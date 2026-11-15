// Single registrar for the offline service worker. Never registers in dev, iframes or Lovable previews.
const PREVIEW_LABEL = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;

function refused(): boolean {
  if (!import.meta.env.PROD) return true;
  if (window.self !== window.top) return true;
  const h = window.location.hostname.toLowerCase();
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  const isLovHost = [".lovable.app", ".gpt-eng.com", ".gptengineer.run"].some((d) => h.endsWith(d));
  if (isLovHost && PREVIEW_LABEL.test(h.split(".")[0])) return true;
  if (/^project--[^.]+-dev\.(lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(h)) return true;
  if (h === "lovableproject.com" || h.endsWith(".lovableproject.com")) return true;
  if (h === "lovableproject-dev.com" || h.endsWith(".lovableproject-dev.com")) return true;
  if (h === "beta.lovable.dev" || h.endsWith(".beta.lovable.dev")) return true;
  return false;
}

export async function registerAppSW() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (refused()) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(
      regs.filter((r) => r.active?.scriptURL.endsWith("/sw.js") || r.installing?.scriptURL.endsWith("/sw.js") || r.waiting?.scriptURL.endsWith("/sw.js")).map((r) => r.unregister()),
    );
    return;
  }
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    // Check for new versions whenever the device comes back online or the app is reopened.
    const check = () => reg.update().catch(() => {});
    window.addEventListener("online", check);
    document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && check());
    let reloaded = !navigator.serviceWorker.controller; // first install: no reload
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  } catch { /* offline support is optional */ }
}

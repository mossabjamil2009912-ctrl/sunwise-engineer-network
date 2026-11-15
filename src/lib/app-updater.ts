export const SERVICE_URL_KEY = "service-url";
export const DEFAULT_SERVICE_URL = "https://actes-crm.lovable.app";
export const APP_VERSION = "1.0.0";

export function getServiceUrl(): string {
  if (typeof window === "undefined") return DEFAULT_SERVICE_URL;
  return (localStorage.getItem(SERVICE_URL_KEY) || DEFAULT_SERVICE_URL).replace(/\/+$/, "");
}
export function setServiceUrl(url: string) {
  const v = url.trim().replace(/\/+$/, "");
  if (v) localStorage.setItem(SERVICE_URL_KEY, v); else localStorage.removeItem(SERVICE_URL_KEY);
}

/** Returns >0 when a is newer than b. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number), pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
}

export type UpdateStatus = "checking" | "downloading" | "latest" | "applying" | "error";

export async function checkAndApplyUpdate(onStatus: (s: UpdateStatus, msg?: string) => void) {
  try {
    onStatus("checking");
    const base = getServiceUrl();
    const res = await fetch(`${base}/app-updates/latest.json?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`تعذّر جلب ملف التحديث (${res.status})`);
    const latest = (await res.json()) as { version: string; path: string; checksum: string };
    const { Capacitor } = await import("@capacitor/core");
    let current = APP_VERSION;
    if (Capacitor.isNativePlatform()) {
      const { CapacitorUpdater } = await import("@capgo/capacitor-updater");
      const cur = await CapacitorUpdater.current();
      current = cur.bundle.version === "builtin" ? cur.native : cur.bundle.version;
      if (compareVersions(latest.version, current) <= 0) return onStatus("latest");
      onStatus("downloading");
      const url = /^https?:/.test(latest.path) ? latest.path : `${base}${latest.path}`;
      const bundle = await CapacitorUpdater.download({ url, version: latest.version, checksum: latest.checksum });
      onStatus("applying");
      await CapacitorUpdater.set({ id: bundle.id });
      return;
    }
    if (compareVersions(latest.version, current) <= 0) return onStatus("latest");
    onStatus("error", `يتوفر إصدار ${latest.version}، والتحديث يعمل داخل تطبيق الجوال فقط.`);
  } catch (e) {
    onStatus("error", e instanceof Error ? e.message : "حدث خطأ");
  }
}

/** Call once at app start inside the native app to confirm the running bundle works. */
export async function notifyAppReady() {
  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isNativePlatform()) return;
  const { CapacitorUpdater } = await import("@capgo/capacitor-updater");
  await CapacitorUpdater.notifyAppReady();
}

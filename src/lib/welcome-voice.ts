const KEY = "acts-welcome-voice";
export const isVoiceOn = () => { try { return localStorage.getItem(KEY) !== "off"; } catch { return true; } };
export const setVoiceOn = (on: boolean) => { try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* ignore */ } };

let current: HTMLAudioElement | null = null;
const TRIGGERS = ["pointerdown", "keydown"] as const;

export function stopWelcome() {
  if (!current) return;
  current.pause();
  current.src = "";
  current = null;
  cleanup();
}

const onVisibility = () => { if (document.hidden) stopWelcome(); };
const onClick = (e: Event) => {
  const t = e.target as Element | null;
  if (t?.closest?.("button, a, [role=button], input, select, textarea, label")) stopWelcome();
};
function cleanup() {
  document.removeEventListener("visibilitychange", onVisibility);
  window.removeEventListener("pagehide", stopWelcome);
  window.removeEventListener("blur", stopWelcome);
  window.removeEventListener("popstate", stopWelcome);
  document.removeEventListener("click", onClick, true);
}

// Plays the welcome greeting once per launch; stops on leaving the app, calls, any button press or screen change.
export function playWelcome() {
  if (!isVoiceOn() || sessionStorage.getItem("acts-welcomed")) return;
  sessionStorage.setItem("acts-welcomed", "1");
  const a = new Audio("/acts/audio/welcome.mp3");
  current = a;
  a.addEventListener("ended", () => { current = null; cleanup(); });
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", stopWelcome);
  window.addEventListener("blur", stopWelcome);
  window.addEventListener("popstate", stopWelcome);
  document.addEventListener("click", onClick, true);
  const retry = (e: Event) => {
    TRIGGERS.forEach((n) => window.removeEventListener(n, retry));
    const t = e.target as Element | null;
    if (current === a && !t?.closest?.("button, a, [role=button]")) a.play().catch(() => {});
  };
  a.play().catch(() => { if (current === a) TRIGGERS.forEach((n) => window.addEventListener(n, retry, { once: true })); });
}

const KEY = "acts-welcome-voice";
export const isVoiceOn = () => { try { return localStorage.getItem(KEY) !== "off"; } catch { return true; } };
export const setVoiceOn = (on: boolean) => { try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* ignore */ } };

// Plays the welcome greeting once per app launch; if autoplay is blocked, plays on the first touch.
export function playWelcome() {
  if (!isVoiceOn() || sessionStorage.getItem("acts-welcomed")) return;
  sessionStorage.setItem("acts-welcomed", "1");
  const a = new Audio("/acts/audio/welcome.mp3");
  const retry = () => { a.play().catch(() => {}); off(); };
  const off = () => ["pointerdown", "keydown"].forEach((e) => window.removeEventListener(e, retry));
  a.play().catch(() => ["pointerdown", "keydown"].forEach((e) => window.addEventListener(e, retry, { once: true })));
}

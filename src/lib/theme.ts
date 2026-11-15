export type Theme = "dark" | "light";
const KEY = "acts-theme";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(KEY) === "light" ? "light" : "dark";
}

export function applyTheme(t: Theme) {
  const el = document.documentElement;
  el.classList.remove("dark", "light");
  el.classList.add(t);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "light" ? "#f4f6fa" : "#141b2d");
}

export function setTheme(t: Theme) {
  localStorage.setItem(KEY, t);
  applyTheme(t);
}

/** Inline boot script: applies the saved theme before first paint. */
export const THEME_BOOT = `try{if(localStorage.getItem("${KEY}")==="light"){var e=document.documentElement;e.classList.remove("dark");e.classList.add("light")}}catch(_){}`;

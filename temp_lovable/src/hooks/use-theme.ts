import { useEffect, useState } from "react";

export type Theme = "dark" | "light";
const KEY = "sb-theme";

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = (typeof localStorage !== "undefined" &&
      (localStorage.getItem(KEY) as Theme | null)) || "dark";
    setTheme(saved);
    apply(saved);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    apply(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  }

  return { theme, toggle };
}

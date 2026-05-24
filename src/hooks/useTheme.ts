"use client";

import { useState, useEffect, useCallback } from "react";

export type Theme = "system" | "light" | "dark";

const STORAGE_KEY = "keel-theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    // Sync from the data-theme attr that the inline script set at load time
    const attr = document.documentElement.getAttribute("data-theme") as Theme | null;
    if (attr === "light" || attr === "dark") setThemeState(attr);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    if (next === "system") {
      localStorage.removeItem(STORAGE_KEY);
      document.documentElement.removeAttribute("data-theme");
    } else {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute("data-theme", next);
    }
  }, []);

  const cycleTheme = useCallback(() => {
    setTheme(
      theme === "system" ? "light" :
      theme === "light"  ? "dark"  :
      "system"
    );
  }, [theme, setTheme]);

  return { theme, setTheme, cycleTheme };
}

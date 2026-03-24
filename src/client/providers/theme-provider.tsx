"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "gpt-chatbot-theme";
const themeListeners = new Set<() => void>();

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
}

function persistTheme(theme: Theme) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, theme);
}

function getThemeSnapshot(): Theme {
  if (typeof document !== "undefined") {
    const currentTheme = document.documentElement.dataset.theme;
    if (currentTheme === "dark" || currentTheme === "light") {
      return currentTheme;
    }
  }

  if (typeof window !== "undefined") {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    if (storedTheme === "dark" || storedTheme === "light") {
      return storedTheme;
    }

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  }

  return "light";
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function notifyThemeListeners() {
  themeListeners.forEach((listener) => listener());
}

function subscribeToTheme(listener: () => void) {
  themeListeners.add(listener);

  if (typeof window === "undefined") {
    return () => {
      themeListeners.delete(listener);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    themeListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function updateTheme(theme: Theme) {
  applyTheme(theme);
  persistTheme(theme);
  notifyThemeListeners();
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme(nextTheme) {
        updateTheme(nextTheme);
      },
      toggleTheme() {
        const nextTheme = theme === "light" ? "dark" : "light";
        updateTheme(nextTheme);
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}

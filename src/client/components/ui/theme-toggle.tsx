"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/client/providers/theme-provider";

import { Button } from "./button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      className="h-11 w-11"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      onClick={toggleTheme}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem("rydex-theme", theme);
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    try {
      const current = (document.documentElement.dataset.theme as Theme) || "light";
      setTheme(current);
    } catch {}
  }, []);

  const label = useMemo(() => (theme === "dark" ? "Switch to light" : "Switch to dark"), [theme]);

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        const next: Theme = theme === "dark" ? "light" : "dark";
        setTheme(next);
        applyTheme(next);
      }}
      className={[
        "inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition",
        "bg-[var(--surface)] hover:bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)]",
        "shadow-[0_10px_30px_rgba(0,0,0,0.06)]",
        className,
      ].join(" ")}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}


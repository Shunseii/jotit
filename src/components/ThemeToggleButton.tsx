import { MoonIcon, SunIcon } from "@heroicons/react/20/solid";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <button
      type="button"
      className="flex h-6 w-6 items-center justify-center rounded-md transition hover:bg-zinc-900/5 dark:hover:bg-white/5"
      aria-label="Toggle dark mode"
      onClick={() => {
// TODO: handle case where this is "system" theme
        setTheme(theme === "dark" ? "light" : "dark");
      }}
    >
      <SunIcon className="h-5 w-5 stroke-zinc-900 dark:hidden" />
      <MoonIcon className="hidden h-5 w-5 fill-transparent stroke-white dark:block" />
    </button>
  );
};

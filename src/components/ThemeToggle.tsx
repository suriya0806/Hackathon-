import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function ThemeToggle({ darkMode, setDarkMode }: ThemeToggleProps) {
  return (
    <button
      id="theme-toggle-btn"
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-xl transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
      title="Toggle Light/Dark Theme"
    >
      {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

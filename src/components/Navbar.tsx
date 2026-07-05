import { Shield, LogOut, Award, User } from "lucide-react";
import { Language, UserProfile } from "../types";
import { translations } from "../utils/translations";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  user: UserProfile;
  onLogout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function Navbar({ user, onLogout, language, setLanguage, darkMode, setDarkMode }: NavbarProps) {
  const t = translations[language];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <nav className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-sm rounded-3xl p-4 transition-all">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-900 dark:bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-indigo-950 dark:text-white uppercase">
                {t.appTitle}
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-widest leading-none mt-0.5">
                {t.subtitle}
              </span>
            </div>
          </div>

          {/* Right side items */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Streak Indicator (For Citizen) */}
            {user.role === "citizen" && (
              <div className="flex items-center gap-1.5 py-1 px-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-full border border-indigo-100 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                <Award className="w-4 h-4" />
                <span>{user.streak} {t.streak}</span>
              </div>
            )}

            {/* User Profile Badge */}
            <div className="flex items-center gap-2 p-1 px-2.5 bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-800 rounded-2xl">
              <div className="w-6 h-6 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-800 dark:text-neutral-200 leading-3">{user.name}</p>
                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{user.role}</span>
              </div>
            </div>

            {/* Multilingual Selector */}
            <div className="flex bg-slate-50 dark:bg-neutral-800/60 rounded-2xl p-1 text-[11px] border border-slate-200 dark:border-neutral-800">
              <button 
                onClick={() => setLanguage("en")} 
                className={`px-3 py-1 rounded-xl font-bold transition-all ${language === "en" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage("ta")} 
                className={`px-3 py-1 rounded-xl font-bold transition-all ${language === "ta" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"}`}
              >
                தமிழ்
              </button>
              <button 
                onClick={() => setLanguage("hi")} 
                className={`px-3 py-1 rounded-xl font-bold transition-all ${language === "hi" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"}`}
              >
                हिन्दी
              </button>
            </div>

            {/* Dark Mode and Logout */}
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

            <button
              id="nav-logout-btn"
              onClick={onLogout}
              className="p-2 bg-slate-50 hover:bg-red-500 hover:text-white dark:bg-neutral-800/60 dark:hover:bg-red-950/60 rounded-2xl text-slate-500 dark:text-slate-400 transition-all border border-slate-200 dark:border-neutral-800"
              title={t.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

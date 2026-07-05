import { useState, useEffect } from "react";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import CitizenDashboard from "./components/CitizenDashboard";
import OfficerDashboard from "./components/OfficerDashboard";
import EngineerDashboard from "./components/EngineerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { UserProfile, Language } from "./types";

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Sync Dark Mode state to Document Element classlist
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleUpdateUser = (updatedProfile: UserProfile) => {
    setUser(updatedProfile);
  };

  if (!user) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        language={language}
        setLanguage={setLanguage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  return (
    <div className="min-h-screen transition-all bg-slate-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200">
      <Navbar
        user={user}
        onLogout={handleLogout}
        language={language}
        setLanguage={setLanguage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Role-Based Dashboard Routing */}
      <main className="transition-all duration-300">
        {user.role === "citizen" && (
          <CitizenDashboard
            user={user}
            language={language}
            onUpdateUser={handleUpdateUser}
          />
        )}
        {user.role === "officer" && (
          <OfficerDashboard
            user={user}
            language={language}
          />
        )}
        {user.role === "engineer" && (
          <EngineerDashboard
            user={user}
          />
        )}
        {user.role === "admin" && (
          <AdminDashboard />
        )}
      </main>
    </div>
  );
}


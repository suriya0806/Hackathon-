import React, { useState } from "react";
import { Shield, Mail, Lock, Phone, ArrowRight, UserCheck, Languages, Check, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import GlassCard from "./GlassCard";
import ThemeToggle from "./ThemeToggle";
import { UserRole, Language } from "../types";
import { translations } from "../utils/translations";

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function Login({ onLoginSuccess, language, setLanguage, darkMode, setDarkMode }: LoginProps) {
  const t = translations[language];
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>("citizen");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = isRegister ? "/api/auth/register" : "/api/auth/login";
    const payload = isRegister 
      ? { name, email, role, phone }
      : { email, password, role };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOTPRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setError("");
    setLoading(true);
    // Simulate OTP dispatch
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
    }, 1200);
  };

  const handlePhoneOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "123456" && otp.length !== 6) {
      setError("Invalid OTP. Use simulated OTP code: 123456");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: `${phone}@constitutionai.gov.in`, role }),
      });
      const data = await response.json();
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError("OTP Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const triggerGoogleLogin = async () => {
    setLoading(true);
    try {
      const mockEmail = `citizen.google@gmail.com`;
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mockEmail, role: "citizen" }),
      });
      const data = await response.json();
      onLoginSuccess(data.user);
    } catch (err) {
      setError("Google sign-in error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-neutral-950 text-white overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

      {/* Floating Header Actions */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        {/* Language Selection */}
        <div className="flex bg-slate-800/60 backdrop-blur border border-slate-700 rounded-xl p-1 text-xs">
          <button onClick={() => setLanguage("en")} className={`px-2 py-1 rounded-lg font-medium transition-all ${language === "en" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>EN</button>
          <button onClick={() => setLanguage("ta")} className={`px-2 py-1 rounded-lg font-medium transition-all ${language === "ta" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>தமிழ்</button>
          <button onClick={() => setLanguage("hi")} className={`px-2 py-1 rounded-lg font-medium transition-all ${language === "hi" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>हिन्दी</button>
        </div>
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        {/* Government Emblem / Logo Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-3 border border-indigo-400/40">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-indigo-200 to-white bg-clip-text text-transparent">
            {t.appTitle}
          </h1>
          <p className="text-xs tracking-widest text-slate-400 mt-1 uppercase font-semibold">
            {t.subtitle}
          </p>
        </div>

        {/* Main Login Card */}
        <GlassCard className="p-8">
          {/* User Role Selection tabs */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-indigo-400 tracking-wider uppercase block mb-3 text-center">
              {t.selectRole}
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
              {(["citizen", "officer", "engineer", "admin"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                    role === r
                      ? "bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {r === "citizen" ? "Citizen" : r === "officer" ? "Officer" : r === "engineer" ? "Engineer" : "Admin"}
                </button>
              ))}
            </div>
          </div>

          {/* Form Tabs: Email vs Phone */}
          {!isRegister && (
            <div className="flex border-b border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => { setTab("email"); setError(""); }}
                className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 ${
                  tab === "email" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400"
                }`}
              >
                Email Access
              </button>
              <button
                type="button"
                onClick={() => { setTab("phone"); setError(""); }}
                className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 ${
                  tab === "phone" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400"
                }`}
              >
                Phone OTP Login
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs">
              {error}
            </div>
          )}

          {/* Email / Password Form (Login & Register) */}
          {(tab === "email" || isRegister) ? (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1.5">{t.welcome} Name</label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 text-white"
                  />
                </div>
              </div>

              {!isRegister && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs text-slate-400 font-medium">{t.password}</label>
                    <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline">
                      {t.forgotPassword}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-indigo-500 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {isRegister && (
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1.5">{t.phone}</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 9000000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 text-white"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me */}
              {!isRegister && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="accent-indigo-600"
                    />
                    <span>{t.rememberMe}</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white font-bold py-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-4 shadow-sm shadow-indigo-600/20"
              >
                {loading ? (
                  <span className="animate-pulse">{t.loading}</span>
                ) : (
                  <>
                    <span>{isRegister ? t.register : t.login}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Phone OTP form */
            <form onSubmit={otpSent ? handlePhoneOTPVerify : handlePhoneOTPRequest} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5">{t.phone}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    disabled={otpSent}
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50 text-white"
                  />
                </div>
              </div>

              {otpSent && (
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-slate-400 font-medium">{t.otp}</label>
                    <span className="text-xs text-green-400">Simulated Code: 123456</span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 text-white tracking-widest text-center"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white font-bold py-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-600/20"
              >
                {loading ? (
                  <span className="animate-pulse">{t.loading}</span>
                ) : (
                  <>
                    <span>{otpSent ? "Verify OTP & Access" : "Send SMS Verification OTP"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Social Sign In (Google) */}
          {!isRegister && (
            <div className="mt-6 pt-6 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-500 mb-3">Or continue securely with authentication partners</p>
              <button
                type="button"
                onClick={triggerGoogleLogin}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 hover:border-slate-700 text-sm font-medium transition-all"
              >
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.51 15.02 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.8 2.95C6.2 7.04 8.85 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.25c0-.82-.07-1.61-.21-2.38H12v4.52h6.48c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.7-4.94 3.7-8.59z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.5c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.5 6.95C.54 8.87 0 11.04 0 13.3c0 2.26.54 4.43 1.5 6.35l3.8-3.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.11-4.26 1.11-3.15 0-5.8-2-6.75-4.91L1.45 16.5C3.35 20.35 7.3 23 12 23z"
                  />
                </svg>
                <span>Sign in with Google Account</span>
              </button>
            </div>
          )}

          {/* Toggle Register/Login footer link */}
          {role === "citizen" && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError(""); }}
                className="text-xs text-indigo-400 font-medium hover:underline"
              >
                {isRegister ? t.loginPrompt : t.registerPrompt}
              </button>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}

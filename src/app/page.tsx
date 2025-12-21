"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AuthForm, ProgressiveRegistration } from "@/components/auth";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register";

/**
 * The Gate - CampuSphere Authentication Page
 * Supports both Login and Progressive Registration flows
 */
export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");

  const handleRegistrationComplete = (data: { isVerified: boolean }) => {
    console.log("Registration complete:", data);
    // Store verification status (in real app, would use context/state management)
    if (typeof window !== "undefined") {
      localStorage.setItem("isVerified", String(data.isVerified));
    }
    router.push("/map");
  };

  const handleSkip = () => {
    console.log("User skipped verification");
    router.push("/map");
  };

  const handleLogin = (data: { email: string; password: string }) => {
    console.log("Login:", data);
    // In real app, would verify and get isVerified status from backend
    if (typeof window !== "undefined") {
      localStorage.setItem("isVerified", "true");
    }
    router.push("/map");
  };

  return (
    <main className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-4">
      {/* Auth Card Container */}
      <div className="w-full max-w-md">
        {/* Logo/Branding Section */}
        <div className="text-center mb-10">
          <h1
            className="text-4xl font-normal text-[var(--bosphorus-emerald)] mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            CampuSphere
          </h1>
          <p className="text-[var(--muted)] text-sm">
            İstanbul Üniversitesi Dijital Kampüs Ağı
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-8">
          {/* Mode Tabs */}
          <div className="flex mb-6 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === "login"
                  ? "bg-white text-[var(--bosphorus-emerald)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === "register"
                  ? "bg-white text-[var(--bosphorus-emerald)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
            >
              Kayıt Ol
            </button>
          </div>

          {/* Dynamic Heading */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={mode}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="text-2xl text-center text-[#1a1a1a] mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {mode === "login" ? "Hoş Geldiniz" : "Hızlı Kayıt"}
            </motion.h2>
          </AnimatePresence>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <AuthForm
                  onLogin={handleLogin}
                  onViewChange={() => { }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ProgressiveRegistration
                  onComplete={handleRegistrationComplete}
                  onSkip={handleSkip}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--muted)] mt-6">
          © 2025 CampuSphere. Tüm hakları saklıdır.
        </p>
      </div>
    </main>
  );
}

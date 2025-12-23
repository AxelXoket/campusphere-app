"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AuthForm, ProgressiveRegistration } from "@/components/auth";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register";

/**
 * The Gate - CampuSphere Authentication Page
 * Cinematic video background with glassmorphism auth card
 */
export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");

  const handleRegistrationComplete = (data: { isVerified: boolean }) => {
    console.log("Registration complete:", data);
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
    if (typeof window !== "undefined") {
      localStorage.setItem("isVerified", "true");
    }
    router.push("/map");
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Cinematic Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-[-2]"
      >
        <source src="/videos/cs_bg.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay for Readability */}
      <div className="fixed inset-0 bg-black/60 z-[-1]" />

      {/* Content Container */}
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo/Branding Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h1
              className="text-5xl font-normal text-white mb-3 drop-shadow-lg"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              CampuSphere
            </h1>
            <p className="text-white/70 text-sm tracking-wide">
              İstanbul Üniversitesi Dijital Kampüs Ağı
            </p>
          </motion.div>

          {/* Glassmorphism Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-3xl shadow-2xl p-8"
          >
            {/* Mode Tabs - Dark Theme */}
            <div className="flex mb-6 p-1 bg-white/10 rounded-xl">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${mode === "login"
                    ? "bg-[var(--bosphorus-emerald)] text-white shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                Giriş Yap
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${mode === "register"
                    ? "bg-[var(--bosphorus-emerald)] text-white shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                Kayıt Ol
              </button>
            </div>

            {/* Dynamic Heading - White for dark bg */}
            <AnimatePresence mode="wait">
              <motion.h2
                key={mode}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="text-2xl text-center text-white mb-6"
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
          </motion.div>

          {/* Footer - Light text for dark bg */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-white/40 mt-6"
          >
            © 2025 CampuSphere. Tüm hakları saklıdır.
          </motion.p>
        </div>
      </div>
    </main>
  );
}

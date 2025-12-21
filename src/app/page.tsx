"use client";

import { LoginForm } from "@/components/auth";

/**
 * The Gate - CampuSphere Authentication Page
 * Centered box on Paper White background
 * Historic meets modern design aesthetic
 */
export default function HomePage() {
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
          <h2
            className="text-2xl text-center text-[#1a1a1a] mb-8"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Giriş Yap
          </h2>

          <LoginForm
            onSubmit={(data) => {
              console.log("Login submitted:", data);
              // TODO: Implement actual authentication
            }}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--muted)] mt-6">
          © 2025 CampuSphere. Tüm hakları saklıdır.
        </p>
      </div>
    </main>
  );
}

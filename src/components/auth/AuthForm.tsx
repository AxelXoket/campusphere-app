"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { SegmentedControl, RoleType } from "./SegmentedControl";
import { UnderlineInput } from "./UnderlineInput";
import { PasswordInput } from "./PasswordInput";
import { Checkbox } from "./Checkbox";
import { FileUpload } from "./FileUpload";
import { useMockAuth, DEMO_EMAILS } from "@/lib/MockAuthContext";

type AuthView = "login" | "register";

interface AuthFormProps {
    onLogin?: (data: { role: RoleType; email: string; password: string }) => void;
    onRegister?: (data: { role: RoleType; email: string; password: string; name: string; file?: File }) => void;
    onViewChange?: (view: AuthView) => void;
}

/**
 * Auth Form Container - Toggles between Login and Register views
 * Uses Framer Motion for smooth transitions
 * All labels in Turkish
 */
export function AuthForm({ onLogin, onRegister, onViewChange }: AuthFormProps) {
    const [view, setView] = useState<AuthView>("login");

    const handleViewChange = (newView: AuthView) => {
        setView(newView);
        onViewChange?.(newView);
    };

    return (
        <div className="relative">
            <AnimatePresence mode="wait">
                {view === "login" ? (
                    <LoginView
                        key="login"
                        onSubmit={onLogin}
                        onSwitchToRegister={() => handleViewChange("register")}
                    />
                ) : (
                    <RegisterView
                        key="register"
                        onSubmit={onRegister}
                        onSwitchToLogin={() => handleViewChange("login")}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * Login View - Giriş Yap
 * Mock auth with hardcoded demo emails
 */
function LoginView({
    onSubmit,
    onSwitchToRegister,
}: {
    onSubmit?: (data: { role: RoleType; email: string; password: string }) => void;
    onSwitchToRegister: () => void;
}) {
    const router = useRouter();
    const { login } = useMockAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 800));

        const result = login(email);

        if (result.success) {
            onSubmit?.({ role: "ogrenci", email, password });
            router.push("/map");
        } else {
            setError(result.error || "Giriş başarısız");
        }

        setIsLoading(false);
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {/* Demo Login Hint */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-emerald-400 text-center">
                    Demo: {DEMO_EMAILS.join(" / ")}
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400 text-center">{error}</p>
                </div>
            )}

            {/* Email Input */}
            <UnderlineInput
                label="E-posta Adresi"
                type="email"
                placeholder="ornek@istanbul.edu.tr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            {/* Password Input with visibility toggle */}
            <PasswordInput
                label="Şifre"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            {/* Remember Me & Forgot Password Row - Below Password */}
            <div className="flex justify-between items-center w-full">
                <Checkbox
                    id="remember-me"
                    label="Beni Hatırla"
                    checked={rememberMe}
                    onChange={setRememberMe}
                />
                <a
                    href="#"
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                    Şifremi Unuttum
                </a>
            </div>

            {/* Submit Button */}
            <motion.button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <motion.span
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        İşleniyor...
                    </span>
                ) : (
                    "Giriş Yap"
                )}
            </motion.button>
        </motion.form>
    );
}

/**
 * Register View - Kayıt Ol
 * Role selection, Name, Email, Password + Confirmation, File Upload
 * Features: Name auto-capitalization, password match validation
 */
function RegisterView({
    onSubmit,
    onSwitchToLogin,
}: {
    onSubmit?: (data: { role: RoleType; email: string; password: string; name: string; file?: File }) => void;
    onSwitchToLogin: () => void;
}) {
    const [role, setRole] = useState<RoleType>("ogrenci");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [file, setFile] = useState<File | undefined>();
    const [isLoading, setIsLoading] = useState(false);

    // Role-specific document labels (PRD Section 4.A)
    const documentLabels: Record<RoleType, string> = {
        ogrenci: "Öğrenci Belgesi",
        mezun: "Mezuniyet Belgesi",
        akademisyen: "Görev Belgesi",
    };

    // Auto-capitalize each word in name
    const capitalizeWords = (text: string): string => {
        return text
            .split(" ")
            .map(word => word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1).toLocaleLowerCase("tr-TR"))
            .join(" ");
    };

    // Handle name blur - auto-format on focus loss
    const handleNameBlur = () => {
        if (name.trim()) {
            setName(capitalizeWords(name));
        }
    };

    // Password match check
    const passwordsMatch = password === confirmPassword;
    const showPasswordError = confirmPassword.length > 0 && !passwordsMatch;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!passwordsMatch) return;

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        onSubmit?.({ role, email, password, name: capitalizeWords(name), file });
        setIsLoading(false);
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {/* Role Selection */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-white">
                    Hesap Türü
                </label>
                <SegmentedControl value={role} onChange={setRole} />
            </div>

            {/* Name Input with helper text */}
            <div className="space-y-1">
                <UnderlineInput
                    label="Ad Soyad"
                    type="text"
                    placeholder="Ahmet Yılmaz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleNameBlur}
                    required
                />
                <p className="text-xs text-white/60 pl-0.5">
                    Lütfen yükleyeceğiniz belgede yer alan ad-soyad bilgilerini eksiksiz giriniz.
                </p>
            </div>

            {/* Email Input */}
            <UnderlineInput
                label="E-posta Adresi"
                type="email"
                placeholder="ornek@istanbul.edu.tr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            {/* Password Input with visibility toggle */}
            <PasswordInput
                label="Şifre"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            {/* Password Confirmation with visibility toggle */}
            <div className="space-y-1">
                <PasswordInput
                    label="Şifreyi Onayla"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={showPasswordError ? "Şifreler eşleşmiyor" : undefined}
                    required
                />
            </div>

            {/* File Upload - Dynamic label based on selected role */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-white">
                    {documentLabels[role]}
                </label>
                <FileUpload onFileSelect={setFile} />
            </div>

            {/* Submit Button */}
            <motion.button
                type="submit"
                className="btn-primary"
                disabled={isLoading || showPasswordError}
                whileTap={{ scale: 0.98 }}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <motion.span
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        İşleniyor...
                    </span>
                ) : (
                    "Kayıt Ol"
                )}
            </motion.button>

        </motion.form>
    );
}

// Re-export individual views for direct use if needed
export { LoginView, RegisterView };

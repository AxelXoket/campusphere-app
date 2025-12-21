"use client";

import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { SegmentedControl, RoleType } from "./SegmentedControl";
import { UnderlineInput } from "./UnderlineInput";
import { FileUpload } from "./FileUpload";

interface LoginFormProps {
    onSubmit?: (data: { role: RoleType; email: string; password: string; file?: File }) => void;
}

/**
 * Complete login form for "The Gate"
 * Combines all auth components with Turkish UI
 */
export function LoginForm({ onSubmit }: LoginFormProps) {
    const [role, setRole] = useState<RoleType>("ogrenci");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [file, setFile] = useState<File | undefined>();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        onSubmit?.({ role, email, password, file });
        setIsLoading(false);
    };

    const roleLabels: Record<RoleType, string> = {
        mezun: "Mezun",
        ogrenci: "Öğrenci",
        akademisyen: "Akademisyen",
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {/* Role Selection */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-[var(--muted)]">
                    Hesap Türü
                </label>
                <SegmentedControl value={role} onChange={setRole} />
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

            {/* Password Input */}
            <UnderlineInput
                label="Şifre"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            {/* File Upload - Required for all roles */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-[var(--muted)]">
                    Kimlik Belgesi ({roleLabels[role]} için)
                </label>
                <FileUpload onFileSelect={setFile} />
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

            {/* Footer Links */}
            <div className="text-center space-y-2">
                <p className="text-sm text-[var(--muted)]">
                    Hesabın yok mu?{" "}
                    <a href="#" className="text-[var(--bosphorus-emerald)] hover:underline font-medium">
                        Kayıt Ol
                    </a>
                </p>
                <a href="#" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
                    Şifremi Unuttum
                </a>
            </div>
        </motion.form>
    );
}

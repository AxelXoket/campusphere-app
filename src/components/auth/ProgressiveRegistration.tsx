"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UnderlineInput } from "./UnderlineInput";
import { PasswordInput } from "./PasswordInput";
import { SegmentedControl, RoleType } from "./SegmentedControl";
import { FileUpload } from "./FileUpload";
import { faculties, getDepartments } from "@/data/faculties";

type RegistrationStep = 1 | 2;

interface RegistrationData {
    name: string;
    email: string;
    password: string;
    role?: RoleType;
    faculty?: string;
    department?: string;
    file?: File;
    isVerified: boolean;
}

interface ProgressiveRegistrationProps {
    onComplete: (data: RegistrationData) => void;
    onSkip: () => void;
}

/**
 * Two-Step Progressive Registration
 * Step 1: Hızlı Kayıt - Basic info
 * Step 2: Kimlik Doğrulama - Role, faculty, file upload
 */
export function ProgressiveRegistration({ onComplete, onSkip }: ProgressiveRegistrationProps) {
    const [step, setStep] = useState<RegistrationStep>(1);

    // Step 1 fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Step 2 fields
    const [role, setRole] = useState<RoleType>("ogrenci");
    const [faculty, setFaculty] = useState("");
    const [department, setDepartment] = useState("");
    const [file, setFile] = useState<File | undefined>();

    const [isLoading, setIsLoading] = useState(false);

    // Auto-capitalize name
    const capitalizeWords = (text: string): string => {
        return text
            .split(" ")
            .map(word => word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1).toLocaleLowerCase("tr-TR"))
            .join(" ");
    };

    const handleNameBlur = () => {
        if (name.trim()) {
            setName(capitalizeWords(name));
        }
    };

    // Password validation
    const passwordsMatch = password === confirmPassword;
    const showPasswordError = confirmPassword.length > 0 && !passwordsMatch;

    // Available departments based on selected faculty
    const availableDepartments = faculty ? getDepartments(faculty) : [];

    // Handle Step 1 submission
    const handleStep1Submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!passwordsMatch) return;

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsLoading(false);
        setStep(2);
    };

    // Handle Step 2 submission (verified)
    const handleStep2Submit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        onComplete({
            name: capitalizeWords(name),
            email,
            password,
            role,
            faculty,
            department,
            file,
            isVerified: true,
        });
        setIsLoading(false);
    };

    // Handle skip (unverified)
    const handleSkip = () => {
        onComplete({
            name: capitalizeWords(name),
            email,
            password,
            isVerified: false,
        });
        onSkip();
    };

    return (
        <AnimatePresence mode="wait">
            {step === 1 ? (
                <Step1Form
                    key="step1"
                    name={name}
                    setName={setName}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                    handleNameBlur={handleNameBlur}
                    showPasswordError={showPasswordError}
                    isLoading={isLoading}
                    onSubmit={handleStep1Submit}
                />
            ) : (
                <Step2Form
                    key="step2"
                    role={role}
                    setRole={setRole}
                    faculty={faculty}
                    setFaculty={setFaculty}
                    department={department}
                    setDepartment={setDepartment}
                    availableDepartments={availableDepartments}
                    setFile={setFile}
                    isLoading={isLoading}
                    onSubmit={handleStep2Submit}
                    onSkip={handleSkip}
                    onBack={() => setStep(1)}
                />
            )}
        </AnimatePresence>
    );
}

/**
 * Step 1: Hızlı Kayıt
 */
function Step1Form({
    name, setName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    handleNameBlur,
    showPasswordError,
    isLoading,
    onSubmit,
}: {
    name: string; setName: (v: string) => void;
    email: string; setEmail: (v: string) => void;
    password: string; setPassword: (v: string) => void;
    confirmPassword: string; setConfirmPassword: (v: string) => void;
    handleNameBlur: () => void;
    showPasswordError: boolean;
    isLoading: boolean;
    onSubmit: (e: FormEvent) => void;
}) {
    return (
        <motion.form
            onSubmit={onSubmit}
            className="space-y-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-1 rounded-full bg-[var(--bosphorus-emerald)]" />
                <div className="w-8 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Name Input */}
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
                <p className="text-xs text-[var(--muted)] opacity-70 pl-0.5">
                    Kimlik belgenizde yer alan ismi giriniz.
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

            {/* Password Input */}
            <PasswordInput
                label="Şifre"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            {/* Password Confirmation */}
            <PasswordInput
                label="Şifreyi Onayla"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={showPasswordError ? "Şifreler eşleşmiyor" : undefined}
                required
            />

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
                    "Üyeliği Başlat"
                )}
            </motion.button>
        </motion.form>
    );
}

/**
 * Step 2: Kimlik Doğrulama
 */
function Step2Form({
    role, setRole,
    faculty, setFaculty,
    department, setDepartment,
    availableDepartments,
    setFile,
    isLoading,
    onSubmit,
    onSkip,
    onBack,
}: {
    role: RoleType; setRole: (v: RoleType) => void;
    faculty: string; setFaculty: (v: string) => void;
    department: string; setDepartment: (v: string) => void;
    availableDepartments: string[];
    setFile: (f: File | undefined) => void;
    isLoading: boolean;
    onSubmit: (e: FormEvent) => void;
    onSkip: () => void;
    onBack: () => void;
}) {
    // Role-specific document labels
    const documentLabels: Record<RoleType, string> = {
        ogrenci: "Öğrenci Belgesi",
        mezun: "Mezuniyet Belgesi",
        akademisyen: "Görev Belgesi",
    };

    return (
        <motion.form
            onSubmit={onSubmit}
            className="space-y-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-1 rounded-full bg-[var(--bosphorus-emerald)]" />
                <div className="w-8 h-1 rounded-full bg-[var(--bosphorus-emerald)]" />
            </div>

            {/* Back Button */}
            <button
                type="button"
                onClick={onBack}
                className="text-sm text-[#9ca3af] hover:text-[#4B5563] transition-colors duration-200"
            >
                ← Geri
            </button>

            {/* Role Selection */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-[var(--muted)]">
                    Hesap Türü
                </label>
                <SegmentedControl value={role} onChange={setRole} />
            </div>

            {/* Faculty Dropdown */}
            <div className="space-y-1">
                <label className="block text-sm font-medium text-[var(--muted)]">
                    Fakülte
                </label>
                <select
                    value={faculty}
                    onChange={(e) => {
                        setFaculty(e.target.value);
                        setDepartment(""); // Reset department when faculty changes
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-[#1a1a1a] text-sm cursor-pointer transition-all duration-200 focus:border-[var(--bosphorus-emerald)] focus:ring-2 focus:ring-[var(--bosphorus-emerald)]/20 focus:outline-none hover:border-[var(--bosphorus-emerald)]/50"
                    required
                >
                    <option value="">Fakülte seçiniz...</option>
                    {faculties.map((f) => (
                        <option key={f} value={f}>
                            {f}
                        </option>
                    ))}
                </select>
            </div>

            {/* Department Dropdown */}
            <div className="space-y-1 relative">
                <label className="block text-sm font-medium text-[var(--muted)]">
                    Bölüm
                </label>
                <div className="relative">
                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:outline-none ${!faculty
                                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "border-gray-200 bg-white/80 backdrop-blur-sm text-[#1a1a1a] cursor-pointer hover:border-[var(--bosphorus-emerald)]/50 focus:border-[var(--bosphorus-emerald)] focus:ring-2 focus:ring-[var(--bosphorus-emerald)]/20"
                            }`}
                        disabled={!faculty}
                        required
                    >
                        <option value="">
                            {!faculty ? "Önce fakülte seçiniz..." : "Bölüm seçiniz..."}
                        </option>
                        {availableDepartments.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                    {/* Disabled state tooltip */}
                    {!faculty && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                            ⚠
                        </div>
                    )}
                </div>
            </div>

            {/* File Upload */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-[var(--muted)]">
                    {documentLabels[role]}
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
                        Doğrulanıyor...
                    </span>
                ) : (
                    "Doğrulamayı Tamamla"
                )}
            </motion.button>

            {/* Skip Link */}
            <div className="text-center pt-2">
                <button
                    type="button"
                    onClick={onSkip}
                    className="text-sm text-[#6B7280] hover:text-[#4B5563] hover:underline transition-colors duration-200"
                >
                    Şimdilik haritayı gözlemle (Kısıtlı erişim)
                </button>
            </div>
        </motion.form>
    );
}

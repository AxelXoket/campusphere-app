"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UnderlineInput } from "./UnderlineInput";
import { PasswordInput } from "./PasswordInput";
import { SegmentedControl, RoleType } from "./SegmentedControl";
import { FileUpload } from "./FileUpload";
import { SearchableCombobox } from "./SearchableCombobox";
import { faculties, getDepartments } from "@/data/faculties";
import { CheckCircle } from "lucide-react";

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
    const [showVerificationMessage, setShowVerificationMessage] = useState(false);

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

    // Handle Step 2 submission - MOCK (no backend)
    const handleStep2Submit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Show verification message instead of calling Supabase
        setShowVerificationMessage(true);
        setIsLoading(false);

        // Clear form after showing message
        setTimeout(() => {
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setFaculty("");
            setDepartment("");
            setFile(undefined);
        }, 500);
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

    // Show verification message modal - takes full card space
    if (showVerificationMessage) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 min-h-[300px]"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                    className="w-24 h-24 mb-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                >
                    <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>

                <h3 className="text-2xl font-heading text-white mb-4">
                    Kayıt Başarılı!
                </h3>

                <p className="text-white/70 text-sm leading-relaxed text-center max-w-[300px] mb-4">
                    Doğrulama işleminiz sürüyor, sisteme erişmek için hesabınızın doğrulanmasını bekleyiniz.
                </p>

                <p className="text-white/40 text-xs">
                    Bu işlem 24-48 saat sürebilir.
                </p>
            </motion.div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            {step === 1 ? (
                <Step1Form
                    key="step1"
                    role={role}
                    setRole={setRole}
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
    role, setRole,
    name, setName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    handleNameBlur,
    showPasswordError,
    isLoading,
    onSubmit,
}: {
    role: RoleType; setRole: (v: RoleType) => void;
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
                <div className="w-8 h-1 rounded-full bg-indigo-500" />
                <div className="w-8 h-1 rounded-full bg-white/20" />
            </div>

            {/* Role Selection - Moved from Step 2 */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-white">
                    Hesap Türü
                </label>
                <SegmentedControl value={role} onChange={setRole} />
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
                <p className="text-xs text-white/60 pl-0.5">
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
                <div className="w-8 h-1 rounded-full bg-indigo-500" />
                <div className="w-8 h-1 rounded-full bg-indigo-500" />
            </div>

            {/* Back Button */}
            <button
                type="button"
                onClick={onBack}
                className="text-sm text-white/60 hover:text-white transition-colors duration-200"
            >
                ← Geri
            </button>

            {/* Faculty Dropdown */}
            <SearchableCombobox
                label="Fakülte"
                options={faculties}
                value={faculty}
                onChange={(value) => {
                    setFaculty(value);
                    setDepartment("");
                }}
                placeholder="Fakülte seçiniz..."
                required
            />

            {/* Department Dropdown */}
            <SearchableCombobox
                label="Bölüm"
                options={availableDepartments}
                value={department}
                onChange={setDepartment}
                placeholder={!faculty ? "Önce fakülte seçiniz..." : "Bölüm seçiniz..."}
                disabled={!faculty}
                required
            />

            {/* File Upload */}
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
                    "Doğrulamayı Başlat"
                )}
            </motion.button>
        </motion.form>
    );
}

"use client";

import { useState, useCallback, DragEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    accept?: string;
}

/**
 * Drag-and-drop file upload zone with animations
 * Dashed border, "Belgeni buraya sürükle" label
 * Checkmark animation on successful upload
 */
export function FileUpload({ onFileSelect, accept = ".pdf,.jpg,.jpeg,.png" }: FileUploadProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const handleDrag = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const files = e.dataTransfer?.files;
        if (files && files[0]) {
            setUploadedFile(files[0]);
            onFileSelect(files[0]);
        }
    }, [onFileSelect]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            setUploadedFile(files[0]);
            onFileSelect(files[0]);
        }
    }, [onFileSelect]);

    return (
        <div className="space-y-2">
            <label
                className={cn(
                    "upload-zone flex flex-col items-center justify-center gap-3 min-h-[140px]",
                    isDragActive && "active",
                    uploadedFile && "success"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleFileInput}
                />

                <AnimatePresence mode="wait">
                    {uploadedFile ? (
                        <motion.div
                            key="success"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="w-12 h-12 rounded-full bg-[var(--success)] flex items-center justify-center">
                                <Check className="w-6 h-6 text-white" strokeWidth={3} />
                            </div>
                            <p className="text-sm text-[var(--success)] font-medium">
                                {uploadedFile.name}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <motion.div
                                animate={{ y: isDragActive ? -5 : 0 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <Upload
                                    className={cn(
                                        "w-8 h-8 transition-colors",
                                        isDragActive ? "text-[var(--bosphorus-emerald)]" : "text-[var(--muted)]"
                                    )}
                                />
                            </motion.div>
                            <p className="text-sm text-[var(--muted)]">
                                Belgeni buraya sürükle
                            </p>
                            <p className="text-xs text-[var(--muted)] opacity-70">
                                veya dosya seçmek için tıkla
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </label>

            {/* Tooltip for approval process */}
            <p className="text-xs text-[var(--muted)] text-center italic">
                Onay süreci 24-48 saattir.
            </p>
        </div>
    );
}

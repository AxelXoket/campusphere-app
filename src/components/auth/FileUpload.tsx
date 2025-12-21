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
 * Drag-and-drop file upload zone with SVG marching ants animation
 * Uses stroke-dashoffset for 60fps GPU-accelerated animation
 * Uniform dashes on all four sides including corners
 */
export function FileUpload({ onFileSelect, accept = ".pdf,.jpg,.jpeg,.png" }: FileUploadProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isHovered, setIsHovered] = useState(false);

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

    const showAnimation = (isHovered || isDragActive) && !uploadedFile;

    return (
        <div className="space-y-2">
            <label
                className={cn(
                    "relative block rounded-xl overflow-hidden cursor-pointer transition-colors",
                    uploadedFile
                        ? "bg-[rgba(16,185,129,0.05)]"
                        : isDragActive
                            ? "bg-[rgba(0,77,64,0.05)]"
                            : "bg-transparent hover:bg-[rgba(0,77,64,0.02)]"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* SVG Marching Ants Border */}
                <MarchingAntsBorder
                    isAnimating={showAnimation}
                    isSuccess={!!uploadedFile}
                />

                {/* Content */}
                <div className="flex flex-col items-center justify-center gap-3 min-h-[140px] p-8">
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
                </div>
            </label>

            {/* Tooltip for approval process */}
            <p className="text-xs text-[var(--muted)] text-center italic">
                Onay süreci 24-48 saattir.
            </p>
        </div>
    );
}

/**
 * SVG Marching Ants Border Component
 * Uses stroke-dashoffset for smooth 60fps animation
 * Consistent dash pattern on all four sides
 */
function MarchingAntsBorder({
    isAnimating,
    isSuccess
}: {
    isAnimating: boolean;
    isSuccess: boolean;
}) {
    // Dash pattern: 10px dash, 6px gap
    const dashArray = "10 6";
    // Total dash cycle length for seamless loop
    const dashCycle = 16;

    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: "visible" }}
        >
            <rect
                x="1"
                y="1"
                width="calc(100% - 2px)"
                height="calc(100% - 2px)"
                rx="11"
                ry="11"
                fill="none"
                strokeWidth="2"
                stroke={isSuccess ? "var(--success)" : isAnimating ? "var(--bosphorus-emerald)" : "var(--input-border)"}
                strokeDasharray={isSuccess ? "none" : dashArray}
                className={cn(
                    "transition-[stroke] duration-200",
                    isAnimating && !isSuccess && "animate-marching-ants"
                )}
                style={{
                    // Use percentage-based sizing
                    width: "calc(100% - 2px)",
                    height: "calc(100% - 2px)",
                }}
            />
        </svg>
    );
}

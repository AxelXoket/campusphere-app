"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "student" | "academician" | "alumnus" | null;

interface MockUser {
    email: string;
    role: UserRole;
    name: string;
}

interface MockAuthContextType {
    user: MockUser | null;
    isAuthenticated: boolean;
    isPrivileged: boolean; // academician or alumnus
    login: (email: string) => { success: boolean; error?: string };
    logout: () => void;
}

// Hardcoded demo users
const DEMO_USERS: Record<string, MockUser> = {
    "ogrenci@campusphere.com": {
        email: "ogrenci@campusphere.com",
        role: "student",
        name: "Demo Öğrenci",
    },
    "akademisyen@campusphere.com": {
        email: "akademisyen@campusphere.com",
        role: "academician",
        name: "Prof. Dr. Demo",
    },
    "mezun@campusphere.com": {
        email: "mezun@campusphere.com",
        role: "alumnus",
        name: "Demo Mezun",
    },
};

const MockAuthContext = createContext<MockAuthContextType>({
    user: null,
    isAuthenticated: false,
    isPrivileged: false,
    login: () => ({ success: false }),
    logout: () => { },
});

const STORAGE_KEY = "campusphere_mock_user";

export function MockAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<MockUser | null>(null);
    const router = useRouter();

    // Load user from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUser(parsed);
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    const login = (email: string): { success: boolean; error?: string } => {
        const normalizedEmail = email.toLowerCase().trim();
        const demoUser = DEMO_USERS[normalizedEmail];

        if (!demoUser) {
            return { success: false, error: "Demo kullanıcısı bulunamadı." };
        }

        setUser(demoUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        router.push("/");
    };

    const isAuthenticated = user !== null;
    const isPrivileged = user?.role === "academician" || user?.role === "alumnus";

    return (
        <MockAuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isPrivileged,
                login,
                logout,
            }}
        >
            {children}
        </MockAuthContext.Provider>
    );
}

export function useMockAuth() {
    const context = useContext(MockAuthContext);
    if (!context) {
        throw new Error("useMockAuth must be used within a MockAuthProvider");
    }
    return context;
}

// Export demo emails for display in login form
export const DEMO_EMAILS = Object.keys(DEMO_USERS);

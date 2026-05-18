'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Only allow Gmail and Yahoo domains
const ALLOWED_DOMAINS = ['gmail.com', 'yahoo.com', 'yahoo.co.id'];

function isAllowedDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
}

function mapFirebaseError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Format email tidak valid.';
    case 'auth/user-disabled':
      return 'Akun ini telah dinonaktifkan.';
    case 'auth/user-not-found':
      return 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.';
    case 'auth/wrong-password':
      return 'Kata sandi salah. Silakan coba lagi.';
    case 'auth/invalid-credential':
      return 'Email atau kata sandi salah. Silakan coba lagi.';
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Silakan masuk.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu lemah. Minimal 8 karakter.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan. Coba lagi nanti.';
    case 'auth/popup-closed-by-user':
      return 'Popup login ditutup sebelum selesai.';
    case 'auth/network-request-failed':
      return 'Gagal terhubung ke jaringan. Periksa koneksi internet.';
    default:
      return 'Terjadi kesalahan. Silakan coba lagi.';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Check if email is verified
      if (!result.user.emailVerified) {
        await signOut(auth);
        return {
          success: false,
          error: 'Email belum diverifikasi. Silakan cek inbox email Anda dan klik link verifikasi.',
        };
      }
      return { success: true };
    } catch (err: unknown) {
      const firebaseErr = err as { code: string };
      return { success: false, error: mapFirebaseError(firebaseErr.code) };
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    // Validate domain
    if (!isAllowedDomain(email)) {
      return {
        success: false,
        error: 'Hanya email dengan domain Gmail atau Yahoo yang diperbolehkan.',
      };
    }
    // Validate password length
    if (password.length < 8) {
      return {
        success: false,
        error: 'Kata sandi harus minimal 8 karakter.',
      };
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Send email verification
      await sendEmailVerification(result.user);
      // Sign out immediately — user must verify email first
      await signOut(auth);
      return { success: true };
    } catch (err: unknown) {
      const firebaseErr = err as { code: string };
      return { success: false, error: mapFirebaseError(firebaseErr.code) };
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (err: unknown) {
      const firebaseErr = err as { code: string };
      return { success: false, error: mapFirebaseError(firebaseErr.code) };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    if (!isAllowedDomain(email)) {
      return {
        success: false,
        error: 'Hanya email dengan domain Gmail atau Yahoo yang diperbolehkan.',
      };
    }
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err: unknown) {
      const firebaseErr = err as { code: string };
      return { success: false, error: mapFirebaseError(firebaseErr.code) };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginWithEmail, registerWithEmail, loginWithGoogle, logout, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

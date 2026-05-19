'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
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
  triggerLoginPrompt: () => Promise<boolean>;
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
  const [mounted, setMounted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmPromise, setConfirmPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptPromise, setLoginPromptPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => {
      unsubscribe();
      setMounted(false);
    };
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

  const logout = () => {
    setShowConfirmModal(true);
    return new Promise<void>((resolve, reject) => {
      setConfirmPromise({
        resolve: (confirmed) => {
          if (confirmed) {
            signOut(auth).then(() => resolve()).catch(reject);
          } else {
            resolve();
          }
        }
      });
    });
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

  const triggerLoginPrompt = () => {
    setShowLoginPrompt(true);
    return new Promise<boolean>((resolve) => {
      setLoginPromptPromise({ resolve });
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginWithEmail, registerWithEmail, loginWithGoogle, logout, resetPassword, triggerLoginPrompt }}
    >
      {children}
      {mounted && showConfirmModal && createPortal(
        <LogoutConfirmModal
          onConfirm={() => {
            if (confirmPromise) confirmPromise.resolve(true);
            setShowConfirmModal(false);
            setConfirmPromise(null);
          }}
          onCancel={() => {
            if (confirmPromise) confirmPromise.resolve(false);
            setShowConfirmModal(false);
            setConfirmPromise(null);
          }}
        />,
        document.body
      )}
      {mounted && showLoginPrompt && createPortal(
        <LoginPromptModal
          onConfirm={() => {
            if (loginPromptPromise) loginPromptPromise.resolve(true);
            setShowLoginPrompt(false);
            setLoginPromptPromise(null);
          }}
          onCancel={() => {
            if (loginPromptPromise) loginPromptPromise.resolve(false);
            setShowLoginPrompt(false);
            setLoginPromptPromise(null);
          }}
        />,
        document.body
      )}
    </AuthContext.Provider>
  );
}

interface LogoutConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function LogoutConfirmModal({ onConfirm, onCancel }: LogoutConfirmModalProps) {
  return (
    <div className="custom-dialog-overlay">
      <div className="custom-dialog-box" role="dialog" aria-modal="true">
        <div className="custom-dialog-icon custom-dialog-icon--warning">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
        <h3 className="custom-dialog-title">Konfirmasi Keluar</h3>
        <p className="custom-dialog-message">
          Apakah Anda yakin ingin keluar dari akun Anda? Sesi Anda akan dihentikan.
        </p>
        <div className="custom-dialog-actions">
          <button
            type="button"
            className="custom-dialog-btn custom-dialog-btn--cancel"
            onClick={onCancel}
          >
            Batal
          </button>
          <button
            type="button"
            className="custom-dialog-btn custom-dialog-btn--confirm"
            onClick={onConfirm}
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginPromptModal({ onConfirm, onCancel }: LogoutConfirmModalProps) {
  return (
    <div className="custom-dialog-overlay">
      <div className="custom-dialog-box" role="dialog" aria-modal="true">
        <div className="custom-dialog-icon custom-dialog-icon--info" style={{ color: 'var(--color-primary)', background: 'rgba(157, 27, 27, 0.08)' }}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h3 className="custom-dialog-title">Fitur Khusus Terdaftar</h3>
        <p className="custom-dialog-message">
          Fitur menyimpan artikel ke bookmark hanya tersedia bagi pembaca yang telah masuk atau terdaftar. Yuk, login sekarang!
        </p>
        <div className="custom-dialog-actions">
          <button
            type="button"
            className="custom-dialog-btn custom-dialog-btn--cancel"
            onClick={onCancel}
          >
            Batal
          </button>
          <button
            type="button"
            className="custom-dialog-btn custom-dialog-btn--confirm"
            onClick={onConfirm}
          >
            Masuk / Daftar
          </button>
        </div>
      </div>
    </div>
  );
}

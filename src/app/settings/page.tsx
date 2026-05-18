'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  deleteUser
} from 'firebase/auth';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import './settings.css';

export default function SettingsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Settings State
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  const [mounted, setMounted] = useState(false);

  // Ganti Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Cache Clear State
  const [cacheLoading, setCacheLoading] = useState(false);
  const [cacheProgress, setCacheProgress] = useState(0);

  // Hapus Akun State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Global Toast
  const [toastMessage, setToastMessage] = useState('');

  // Trigger temporary toast notifications
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  useEffect(() => {
    setMounted(true);
    // Initialize settings from localStorage
    if (typeof window !== 'undefined') {
      const activeTheme = localStorage.getItem('mq_theme') || 'light';
      const activeFontSize = localStorage.getItem('mq_font_size') || 'medium';
      setTheme(activeTheme);
      setFontSize(activeFontSize);
    }
  }, []);

  // Theme Trigger
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mq_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      triggerToast(`Mode ${newTheme === 'dark' ? 'Gelap' : 'Terang'} diaktifkan`);
    }
  };

  // Font Size Trigger
  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mq_font_size', newSize);
      document.documentElement.setAttribute('data-font-size', newSize);
      triggerToast(`Ukuran font diatur ke: ${newSize === 'small' ? 'Kecil' : newSize === 'large' ? 'Besar' : 'Sedang'}`);
    }
  };

  // Clear Cache with elegant progress loader simulation
  const handleClearCache = () => {
    setCacheLoading(true);
    setCacheProgress(0);

    const interval = setInterval(() => {
      setCacheProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Perform actual cache deletions
          try {
            // Delete path stack
            sessionStorage.removeItem('appPaths');
            
            // Delete browser CacheStorage
            if (typeof window !== 'undefined' && 'caches' in window) {
              caches.keys().then((names) => {
                names.forEach((name) => {
                  caches.delete(name);
                });
              });
            }
          } catch (e) {
            console.error('Cache Purge error:', e);
          }

          setTimeout(() => {
            setCacheLoading(false);
            triggerToast('Cache berkas sampah berhasil dibersihkan!');
          }, 400);

          return 100;
        }
        // Simulated incremental load ticks
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 80);
  };

  // Safe Password Change with strict re-authentication
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setPasswordError('');
    setPasswordSuccess('');

    // Strict client-side validations
    if (!oldPassword) {
      setPasswordError('Silakan masukkan kata sandi lama Anda.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Kata sandi baru minimal harus terdiri dari 6 karakter.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }
    if (oldPassword === newPassword) {
      setPasswordError('Kata sandi baru tidak boleh sama dengan kata sandi lama Anda.');
      return;
    }

    setPasswordLoading(true);

    try {
      // 1. Strict re-authentication using old password
      const credential = EmailAuthProvider.credential(user.email!, oldPassword);
      await reauthenticateWithCredential(user, credential);

      // 2. Perform the update
      await updatePassword(user, newPassword);

      // 3. Clear inputs & indicate success
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordSuccess('Kata sandi Anda berhasil diperbarui secara aman!');
      triggerToast('Kata sandi diperbarui!');
    } catch (err: any) {
      console.error('Error changing password:', err);
      let friendlyMessage = 'Gagal mengganti kata sandi. Silakan coba lagi.';
      if (err.code === 'auth/wrong-password') {
        friendlyMessage = 'Kata sandi lama yang Anda masukkan salah. Akses ditolak.';
      } else if (err.code === 'auth/too-many-requests') {
        friendlyMessage = 'Terlalu banyak percobaan masuk yang salah. Silakan coba beberapa saat lagi.';
      } else if (err.code === 'auth/user-mismatch') {
        friendlyMessage = 'Sesi pengguna tidak sesuai. Harap masuk kembali.';
      }
      setPasswordError(friendlyMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Open / Close Dangerous Delete Modal
  const openDeleteModal = () => {
    setDeletePassword('');
    setDeleteConfirmText('');
    setDeleteError('');
    setIsDeleteModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    document.body.style.overflow = '';
  };

  // Safe and Permanent Account Deletion
  const handleDeleteAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setDeleteError('');

    // Strict validation
    if (!deletePassword) {
      setDeleteError('Silakan masukkan kata sandi Anda untuk memverifikasi identitas.');
      return;
    }
    if (deleteConfirmText !== 'HAPUS AKUN SAYA') {
      setDeleteError('Teks konfirmasi harus ditulis secara tepat: "HAPUS AKUN SAYA".');
      return;
    }

    setDeleteLoading(true);

    try {
      // 1. Strict re-authentication to prevent visual hijacks
      const credential = EmailAuthProvider.credential(user.email!, deletePassword);
      await reauthenticateWithCredential(user, credential);

      // 2. Delete Firestore private data safely to prevent orphaned files
      const userDocRef = doc(db, 'users', user.uid);
      await deleteDoc(userDocRef);

      // 3. Delete Firebase Auth database profile
      await deleteUser(user);

      // 4. Close modal and send out
      closeDeleteModal();
      router.push('/');
      window.location.reload();
    } catch (err: any) {
      console.error('Error deleting account:', err);
      let friendlyMessage = 'Gagal menghapus akun. Silakan coba lagi.';
      if (err.code === 'auth/wrong-password') {
        friendlyMessage = 'Kata sandi yang Anda masukkan salah. Autentikasi ditolak.';
      } else if (err.code === 'auth/requires-recent-login') {
        friendlyMessage = 'Sesi Anda telah kedaluwarsa. Silakan log out lalu log in kembali untuk melakukan tindakan ini.';
      }
      setDeleteError(friendlyMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="container section">
        {/* Back Button */}
        <BackButton />

        <div className="settings-container">
          <div className="settings-grid animate-fade-in-up">
            
            {/* Display & Layout Settings */}
            <div className="settings-section-card">
              <h2 className="settings-section-title">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
                Preferensi Tampilan
              </h2>
              <p className="settings-section-subtitle">
                Atur tema warna dan kenyamanan membaca ukuran teks portal berita.
              </p>

              {/* Theme Settings */}
              <div className="pref-row">
                <span className="pref-label">Tema Tampilan</span>
                <div className="pref-options-grid">
                  
                  {/* Light Mode Card */}
                  <div 
                    className={`pref-option-card ${theme === 'light' ? 'pref-option-card--active' : ''}`}
                    onClick={() => handleThemeChange('light')}
                  >
                    <div className="pref-option-check">✓</div>
                    <div className="pref-option-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
                      </svg>
                    </div>
                    <span className="pref-option-title">Terang (Default)</span>
                    <span className="pref-option-desc">Tampilan bersih & cerah siang hari</span>
                  </div>

                  {/* Dark Mode Card */}
                  <div 
                    className={`pref-option-card ${theme === 'dark' ? 'pref-option-card--active' : ''}`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <div className="pref-option-check">✓</div>
                    <div className="pref-option-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                      </svg>
                    </div>
                    <span className="pref-option-title">Gelap (Obsidian)</span>
                    <span className="pref-option-desc">Elegan, nyaman untuk malam hari</span>
                  </div>

                </div>
              </div>

              {/* Font Size Settings */}
              <div className="pref-row" style={{ marginBottom: 0 }}>
                <span className="pref-label">Ukuran Teks Artikel</span>
                <div className="pref-options-grid" style={{ marginBottom: 'var(--space-md)' }}>
                  
                  {/* Small Font */}
                  <div 
                    className={`pref-option-card ${fontSize === 'small' ? 'pref-option-card--active' : ''}`}
                    onClick={() => handleFontSizeChange('small')}
                  >
                    <div className="pref-option-check">✓</div>
                    <span className="pref-option-title" style={{ fontSize: '0.85rem' }}>Kecil</span>
                    <span className="pref-option-desc">Skala fontasi 14px</span>
                  </div>

                  {/* Medium Font */}
                  <div 
                    className={`pref-option-card ${fontSize === 'medium' ? 'pref-option-card--active' : ''}`}
                    onClick={() => handleFontSizeChange('medium')}
                  >
                    <div className="pref-option-check">✓</div>
                    <span className="pref-option-title" style={{ fontSize: '0.96rem' }}>Sedang</span>
                    <span className="pref-option-desc">Skala standar 16px</span>
                  </div>

                  {/* Large Font */}
                  <div 
                    className={`pref-option-card ${fontSize === 'large' ? 'pref-option-card--active' : ''}`}
                    onClick={() => handleFontSizeChange('large')}
                  >
                    <div className="pref-option-check">✓</div>
                    <span className="pref-option-title" style={{ fontSize: '1.1rem' }}>Besar</span>
                    <span className="pref-option-desc">Skala maksimal 18px</span>
                  </div>

                </div>

                {/* Live Preview Area */}
                <div className="font-preview-box">
                  <span className="font-preview-tag">Pratinjau Ukuran Teks</span>
                  <p style={{ margin: 0, fontSize: 'inherit', color: 'var(--color-text)' }}>
                    "Kebenaran tidak akan pernah merugikan jiwa yang tulus." Artikel, geopolitik, dan mubasyirat berita portal MQ News akan dibaca dengan skala kenyamanan teks ini.
                  </p>
                </div>
              </div>

            </div>

            {/* Performance & Cache Settings */}
            <div className="settings-section-card">
              <h2 className="settings-section-title">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Sistem & Kinerja
              </h2>
              <p className="settings-section-subtitle">
                Atur pemeliharaan sistem lokal berkas portal berita Anda.
              </p>

              <div className="maintenance-row">
                <div className="maintenance-info">
                  <span className="maintenance-title">Bersihkan Cache & Berkas Sampah</span>
                  <span className="maintenance-desc">
                    Menghapus riwayat navigasi sementara dan cache aset lokal browser untuk menyegarkan memori halaman. Tindakan ini tidak akan mengeluarkan Anda dari sesi login.
                  </span>
                </div>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={handleClearCache}
                  disabled={cacheLoading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  Hapus Cache
                </button>
              </div>
            </div>

            {/* Account Security (Only if user is logged in) */}
            <div className="settings-section-card">
              <h2 className="settings-section-title">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Keamanan Akun
              </h2>
              <p className="settings-section-subtitle">
                Kelola kredensial akun, perlindungan sandi, dan status pendaftaran Anda.
              </p>

              {!user ? (
                <div className="settings-guest-card">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                  <p className="settings-guest-text">
                    Anda sedang masuk sebagai tamu. Silakan masuk atau buat akun Anda terlebih dahulu untuk membuka fitur keamanan tingkat lanjut seperti ganti kata sandi dan hapus akun.
                  </p>
                  <Link href="/login" className="btn btn-primary">
                    Masuk Sekarang
                  </Link>
                </div>
              ) : (
                <>
                  {/* Change Password Form Container */}
                  <div className="security-form-container">
                    <h3 className="security-form-title">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                      </svg>
                      Ganti Kata Sandi
                    </h3>
                    
                    <form onSubmit={handleChangePasswordSubmit}>
                      {passwordError && (
                        <div style={{ color: 'white', background: 'var(--color-primary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 500, display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                          <span>{passwordError}</span>
                        </div>
                      )}
                      {passwordSuccess && (
                        <div style={{ color: 'white', background: '#2e7d32', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 500, display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                          <span>{passwordSuccess}</span>
                        </div>
                      )}

                      <div className="form-grid-3">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" htmlFor="oldPass">Kata Sandi Lama</label>
                          <input 
                            id="oldPass"
                            type="password"
                            className="form-input"
                            placeholder="Sandi saat ini..."
                            required
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            disabled={passwordLoading}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" htmlFor="newPass">Kata Sandi Baru</label>
                          <input 
                            id="newPass"
                            type="password"
                            className="form-input"
                            placeholder="Min 6 karakter..."
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={passwordLoading}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" htmlFor="confirmPass">Konfirmasi Sandi Baru</label>
                          <input 
                            id="confirmPass"
                            type="password"
                            className="form-input"
                            placeholder="Ulangi sandi baru..."
                            required
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            disabled={passwordLoading}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                        <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                          {passwordLoading ? 'Memproses...' : 'Perbarui Kata Sandi'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Danger Zone: Permanent Account Deletion */}
                  <div className="danger-zone-card">
                    <div className="danger-zone-header">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" x2="12" y1="9" y2="13" />
                        <line x1="12" x2="12.01" y1="17" y2="17" />
                      </svg>
                      Zona Berbahaya: Hapus Akun Permanen
                    </div>
                    <p className="danger-zone-desc">
                      Tindakan ini akan menghapus akun pendaftaran Anda secara permanen dari server MQ News Today. Seluruh data profil pribadi, file unggahan avatar, bookmark berita tersimpan, dan catatan aktivitas Anda akan dihapus selamanya dan tidak dapat dikembalikan lagi.
                    </p>
                    <button 
                      type="button" 
                      className="btn btn-danger"
                      onClick={openDeleteModal}
                    >
                      Hapus Akun Saya
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Cache Clearing Simulated Modal Popup */}
      {cacheLoading && mounted && createPortal(
        <div className="security-modal-overlay">
          <div className="security-modal-content" style={{ maxWidth: '380px' }}>
            <div className="security-modal-body">
              <div className="progress-container">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" className="animate-spin" style={{ animation: 'skeleton-pulse 1s linear infinite' }}>
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                <span className="progress-text">Membersihkan Berkas Sampah...</span>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${cacheProgress}%` }}></div>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {cacheProgress}% Selesai
                </span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Dangerous Account Deletion Popup Modal (Saves document.body coordinates) */}
      {isDeleteModalOpen && mounted && createPortal(
        <div className="security-modal-overlay" onClick={closeDeleteModal}>
          <form 
            className="security-modal-content animate-fade-in" 
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleDeleteAccountSubmit}
          >
            {/* Modal Header */}
            <div className="security-modal-header">
              <h2 className="security-modal-title" style={{ color: '#c62828' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '2px' }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" x2="12" y1="9" y2="13" />
                  <line x1="12" x2="12.01" y1="17" y2="17" />
                </svg>
                Konfirmasi Hapus Akun
              </h2>
              <button type="button" className="security-modal-close" onClick={closeDeleteModal} aria-label="Tutup">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="security-modal-body">
              {deleteError && (
                <div style={{ color: 'white', background: 'var(--color-primary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 500, display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="security-modal-alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" x2="12" y1="9" y2="13" />
                  <line x1="12" x2="12.01" y1="17" y2="17" />
                </svg>
                <span>
                  <strong>PERINGATAN KERAS:</strong> Tindakan ini bersifat permanen! Seluruh data pendaftaran dan relasi Firestore Anda akan segera dihapus secara irreversible dan tidak bisa dipulihkan kembali.
                </span>
              </div>

              <p className="security-modal-prompt">
                Untuk melanjutkan proses penghapusan, silakan verifikasi kata sandi saat ini dan ketik kalimat konfirmasi di bawah ini.
              </p>

              {/* Password Verification Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="delPass">Kata Sandi Akun</label>
                <input 
                  id="delPass"
                  type="password"
                  className="form-input"
                  placeholder="Masukkan kata sandi saat ini..."
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  disabled={deleteLoading}
                />
              </div>

              {/* Typed Confirmation Field */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="delConfirm">Ketik kalimat: <span style={{ color: 'var(--color-primary)', userSelect: 'none', fontWeight: 800 }}>HAPUS AKUN SAYA</span></label>
                <input 
                  id="delConfirm"
                  type="text"
                  className="form-input"
                  placeholder="Ketik kalimat di atas..."
                  required
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  disabled={deleteLoading}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="security-modal-footer">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="btn btn-danger"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Menghapus Akun...' : 'Konfirmasi Hapus Akun'}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Global Toast Alert Box */}
      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

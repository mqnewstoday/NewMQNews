'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import './profil.css';

interface UserProfileData {
  displayName: string;
  photoURL: string;
  gender: string;
  bio: string;
  phone: string;
  birthDate: string;
  joinedDate: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    photoURL: '',
    gender: '',
    bio: '',
    phone: '',
    birthDate: '',
  });
  
  // File upload state for ImgBB
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Set mounted state for portal support
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Fetch Firestore details on mount or user changes
  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setDataLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        const joinedVal = user.metadata.creationTime
          ? new Date(user.metadata.creationTime).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : '-';

        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfileData({
            displayName: data.displayName || user.displayName || 'Pengguna MQ',
            photoURL: data.photoURL || user.photoURL || '',
            gender: data.gender || '-',
            bio: data.bio || 'Belum menulis bio.',
            phone: data.phone || '-',
            birthDate: data.birthDate || '-',
            joinedDate: joinedVal,
          });
        } else {
          // Document does not exist, use fallback
          setProfileData({
            displayName: user.displayName || 'Pengguna MQ',
            photoURL: user.photoURL || '',
            gender: '-',
            bio: 'Belum menulis bio.',
            phone: '-',
            birthDate: '-',
            joinedDate: joinedVal,
          });
        }
      } catch (error) {
        console.error('Error fetching profile from Firestore:', error);
      } finally {
        setDataLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  // Open modal and pre-fill form fields
  const handleOpenEditModal = () => {
    if (!profileData) return;
    setEditForm({
      displayName: profileData.displayName === 'Pengguna MQ' ? '' : profileData.displayName,
      photoURL: profileData.photoURL,
      gender: profileData.gender === '-' ? 'Laki-laki' : profileData.gender,
      bio: profileData.bio === 'Belum menulis bio.' ? '' : profileData.bio,
      phone: profileData.phone === '-' ? '' : profileData.phone,
      birthDate: profileData.birthDate === '-' ? '' : profileData.birthDate,
    });
    setSelectedFile(null);
    setLocalPreviewUrl('');
    setErrorMessage('');
    setSuccessMessage('');
    setIsModalOpen(true);
    // Lock underlying page scroll
    document.body.style.overflow = 'hidden';
  };

  // Close modal and unlock scroll
  const handleCloseEditModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
  };

  // Handle local image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('File yang dipilih harus berupa file gambar.');
        return;
      }
      // Validate size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Ukuran file gambar tidak boleh melebihi 5MB.');
        return;
      }
      setSelectedFile(file);
      setLocalPreviewUrl(URL.createObjectURL(file));
      setErrorMessage('');
    }
  };

  // Handle upload button click triggers native file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Submit profile edit & upload image to ImgBB
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profileData) return;

    if (!editForm.displayName.trim()) {
      setErrorMessage('Nama Lengkap tidak boleh kosong.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let finalPhotoURL = editForm.photoURL;

      // 1. If user selected a new file, upload it directly to ImgBB API
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);

        const uploadRes = await fetch('https://api.imgbb.com/1/upload?key=9ed6adf18dcb5acb46a3a21d6e05d644', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          finalPhotoURL = uploadData.data.url;
        } else {
          throw new Error(uploadData.error?.message || 'Gagal mengunggah foto profil ke ImgBB.');
        }
      }

      // 2. Update Firebase Auth Profile for global sync (Header Navbar)
      await updateProfile(user, {
        displayName: editForm.displayName.trim(),
        photoURL: finalPhotoURL,
      });

      // 3. Save detailed records to Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          displayName: editForm.displayName.trim(),
          photoURL: finalPhotoURL,
          gender: editForm.gender,
          bio: editForm.bio.trim(),
          phone: editForm.phone.trim(),
          birthDate: editForm.birthDate,
        },
        { merge: true }
      );

      // 4. Update local state
      setProfileData({
        ...profileData,
        displayName: editForm.displayName.trim(),
        photoURL: finalPhotoURL,
        gender: editForm.gender,
        bio: editForm.bio.trim() || 'Belum menulis bio.',
        phone: editForm.phone.trim() || '-',
        birthDate: editForm.birthDate || '-',
      });

      setSuccessMessage('Profil Anda berhasil diperbarui!');
      setTimeout(() => {
        handleCloseEditModal();
      }, 1500);
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memperbarui profil. Coba lagi.';
      setErrorMessage(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // Helper to extract first initials for fallback avatar
  const getInitials = (name: string) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'U';
  };

  // Loading skeleton view
  if (authLoading || dataLoading) {
    return (
      <div className="profile-page container section">
        <div className="skeleton" style={{ width: '80px', height: '28px', borderRadius: '4px', marginBottom: '24px' }}></div>
        <div className="profile-container">
          <div className="profile-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div className="skeleton" style={{ height: '180px', width: '100%' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-80px', flex: 1, padding: '24px' }}>
              <div className="skeleton" style={{ width: '150px', height: '150px', borderRadius: '50%', marginBottom: '16px' }}></div>
              <div className="skeleton" style={{ width: '220px', height: '24px', borderRadius: '4px', marginBottom: '8px' }}></div>
              <div className="skeleton" style={{ width: '160px', height: '16px', borderRadius: '4px', marginBottom: '24px' }}></div>
              <div className="skeleton" style={{ width: '120px', height: '40px', borderRadius: '8px' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Access Denied / Unauthenticated Screen
  if (!user) {
    return (
      <div className="profile-page container section">
        <div className="access-denied-container">
          <div className="access-denied-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="access-denied-title">Akses Terbatas</h2>
          <p className="access-denied-desc">
            Silakan masuk atau daftarkan akun Anda terlebih dahulu untuk melihat dan mengelola halaman profil Anda.
          </p>
          <Link href="/login" className="btn btn-primary">
            Masuk ke Akun
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page container section">
      {/* Consistent Smart Back Button */}
      <BackButton />

      <div style={{ marginTop: 'var(--space-sm)' }}>
        <div className="profile-container animate-fade-in-up">
            {/* Cover and Main Details Card */}
            <div className="profile-card">
              {/* Cover Banner */}
              <div className="profile-cover"></div>

              {/* Profile Info Header */}
              <div className="profile-header-wrapper">
                <div className="profile-avatar-container">
                  {profileData?.photoURL ? (
                    <img
                      src={profileData.photoURL}
                      alt={profileData.displayName}
                      className="profile-avatar-img"
                    />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {getInitials(profileData?.displayName || '')}
                    </div>
                  )}
                </div>

                <div className="profile-name-row">
                  <h1 className="profile-name">{profileData?.displayName}</h1>
                  <div className="profile-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '2px' }}>
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    Pembaca Setia
                  </div>
                </div>

                <div className="profile-email">{user.email}</div>
                <p className="profile-bio">{profileData?.bio}</p>

                <button className="profile-edit-btn" onClick={handleOpenEditModal} id="edit-profile-trigger">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                  Edit Profil
                </button>
              </div>

              {/* Extra Account Identity Cards */}
              <div className="profile-details-section">
                <h2 className="profile-details-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  Informasi Identitas
                </h2>

                <div className="profile-details-grid">
                  {/* Email */}
                  <div className="profile-detail-item">
                    <div className="profile-detail-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <div className="profile-detail-content">
                      <span className="profile-detail-label">Email</span>
                      <span className="profile-detail-value">{user.email}</span>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="profile-detail-item">
                    <div className="profile-detail-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2v20" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <div className="profile-detail-content">
                      <span className="profile-detail-label">Jenis Kelamin</span>
                      <span className="profile-detail-value">{profileData?.gender}</span>
                    </div>
                  </div>

                  {/* Telepon */}
                  <div className="profile-detail-item">
                    <div className="profile-detail-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <div className="profile-detail-content">
                      <span className="profile-detail-label">No. Telepon</span>
                      <span className="profile-detail-value">{profileData?.phone}</span>
                    </div>
                  </div>

                  {/* Tanggal Lahir */}
                  <div className="profile-detail-item">
                    <div className="profile-detail-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                      </svg>
                    </div>
                    <div className="profile-detail-content">
                      <span className="profile-detail-label">Tanggal Lahir</span>
                      <span className="profile-detail-value">
                        {profileData?.birthDate && profileData.birthDate !== '-'
                          ? new Date(profileData.birthDate).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Tanggal Bergabung */}
                  <div className="profile-detail-item" style={{ gridColumn: 'span 2' }}>
                    <div className="profile-detail-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="7" />
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                      </svg>
                    </div>
                    <div className="profile-detail-content">
                      <span className="profile-detail-label">Bergabung Sejak</span>
                      <span className="profile-detail-value">{profileData?.joinedDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Edit Profile Modal Popup via React Portal (Always perfectly fixed relative to body) */}
      {isModalOpen && mounted && createPortal(
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <form onSubmit={handleSaveProfile} className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <h2 className="modal-title">Edit Profil Saya</h2>
              <button type="button" className="modal-close-btn" onClick={handleCloseEditModal} aria-label="Tutup">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body / Form fields */}
            <div className="modal-body">
              {errorMessage && (
                <div style={{ color: 'white', background: 'var(--color-primary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 500 }}>
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div style={{ color: 'white', background: '#2e7d32', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 500 }}>
                  {successMessage}
                </div>
              )}

              {/* Highly Compact Upload Area with Live Local Preview */}
              <div className="image-upload-wrapper">
                <div className="upload-preview-container">
                  {localPreviewUrl ? (
                    <img src={localPreviewUrl} alt="Preview Foto Baru" className="upload-preview-img" />
                  ) : editForm.photoURL ? (
                    <img src={editForm.photoURL} alt="Foto Profil" className="upload-preview-img" />
                  ) : (
                    <div className="upload-preview-placeholder">
                      {getInitials(editForm.displayName || profileData?.displayName || '')}
                    </div>
                  )}
                </div>
                
                <div className="upload-controls">
                  <label className="form-label" style={{ marginBottom: '2px' }}>Foto Profil</label>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="file-input-hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <button 
                    type="button" 
                    className="custom-file-upload-btn" 
                    onClick={triggerFileInput}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    {localPreviewUrl ? 'Ganti Gambar' : 'Pilih Gambar Baru'}
                  </button>
                  <span className="upload-info-text">
                    Foto otomatis di-host di ImgBB saat disimpan. Maks 5MB.
                  </span>
                </div>
              </div>

              {/* Row 1: Nama Lengkap & Jenis Kelamin (2-Column Grid Layout) */}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="displayName" className="form-label">
                    Nama Lengkap <span style={{ color: 'var(--color-primary)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    className="form-input"
                    placeholder="Nama lengkap Anda"
                    required
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gender" className="form-label">
                    Jenis Kelamin
                  </label>
                  <select
                    id="gender"
                    className="form-select"
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  >
                    <option value="-">-</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Nomor Telepon & Tanggal Lahir (2-Column Grid Layout) */}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="form-input"
                    placeholder="Contoh: 08123456789"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="birthDate" className="form-label">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    className="form-input"
                    value={editForm.birthDate}
                    onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Bio Singkat (Full width but compact textarea height) */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="bio" className="form-label">
                  Bio / Deskripsi Singkat
                </label>
                <textarea
                  id="bio"
                  className="form-textarea"
                  placeholder="Tuliskan biografi singkat..."
                  maxLength={200}
                  rows={2}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                />
                <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {editForm.bio.length}/200 Karakter
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCloseEditModal}
                disabled={saving}
              >
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="animate-spin" style={{ animation: 'skeleton-pulse 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    {selectedFile ? 'Mengunggah...' : 'Menyimpan...'}
                  </span>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
}

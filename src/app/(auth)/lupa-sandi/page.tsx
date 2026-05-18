'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import '../auth.css';

export default function LupaSandiPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Silakan masukkan alamat email Anda.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(email.trim());
    setLoading(false);

    if (result.success) {
      setSuccess(
        'Link reset kata sandi telah dikirim ke email Anda! Silakan cek inbox (atau folder Spam), klik link tersebut, dan buat kata sandi baru.'
      );
      setEmail('');
    } else {
      setError(result.error || 'Gagal mengirim link reset.');
    }
  };

  return (
    <div className="auth-page__backdrop">
      <div className="auth-page" id="forgot-password-page">
        {/* LEFT — Form Panel */}
        <div className="auth-page__left">
          <div className="auth-page__form-wrapper">
            <Link href="/login" className="auth-page__back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Kembali ke Masuk
            </Link>

            <h1 className="auth-page__heading">Lupa Kata Sandi? 🔑</h1>
            <p className="auth-page__subheading">
              Masukkan email Anda dan kami akan mengirimkan link untuk mengatur ulang kata sandi Anda.
            </p>

          {error && (
            <div className="auth-form__message auth-form__message--error">
              <svg className="auth-form__message-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-form__message auth-form__message--success">
              <svg className="auth-form__message-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleReset}>
            <div className="auth-form__group">
              <label className="auth-form__label" htmlFor="reset-email">Email Terdaftar</label>
              <div className="auth-form__input-wrapper">
                <svg className="auth-form__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  id="reset-email"
                  className="auth-form__input"
                  type="email"
                  placeholder="contoh@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <button type="submit" className="auth-form__submit" disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </form>

          <p className="auth-page__switch">
            Ingat kata sandi Anda? <Link href="/login">Masuk</Link>
          </p>
          </div>
        </div>

        {/* RIGHT — Red Branding Panel */}
        <div className="auth-page__right">
          <div className="auth-page__brand">
            <Image
              src="/LogoMQN144.png"
              alt="MQ News Today"
              width={100}
              height={100}
              className="auth-page__brand-logo"
              priority
            />
            <h2 className="auth-page__brand-name">MQ NEWS TODAY</h2>
            <p className="auth-page__brand-slogan">Truth & Clarity</p>
          </div>
        </div>
      </div>
    </div>
  );
}

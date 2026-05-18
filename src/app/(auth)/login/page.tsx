'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import '../auth.css';

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Silakan isi email dan kata sandi.');
      return;
    }

    setLoading(true);
    const result = await loginWithEmail(email.trim(), password);
    setLoading(false);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Login gagal.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await loginWithGoogle();
    setLoading(false);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Login Google gagal.');
    }
  };

  return (
    <div className="auth-page__backdrop">
      <div className="auth-page" id="login-page">
        {/* LEFT — Form Panel */}
        <div className="auth-page__left">
          <div className="auth-page__form-wrapper">
            <Link href="/" className="auth-page__back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Kembali
            </Link>

            <h1 className="auth-page__heading">Selamat Datang 👋</h1>
            <p className="auth-page__subheading">Masuk ke akun MQ News Today Anda untuk melanjutkan.</p>

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

            <form className="auth-form" onSubmit={handleEmailLogin}>
              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="login-email">Email</label>
                <div className="auth-form__input-wrapper">
                  <svg className="auth-form__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <input
                    id="login-email"
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

              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="login-password">Kata Sandi</label>
                <div className="auth-form__input-wrapper">
                  <svg className="auth-form__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="login-password"
                    className="auth-form__input"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: '48px' }}
                  />
                  <button type="button" className="auth-form__toggle-pw" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                    {showPw ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="auth-form__forgot">
                <Link href="/lupa-sandi">Lupa kata sandi?</Link>
              </div>

              <button type="submit" className="auth-form__submit" disabled={loading}>
                {loading ? 'Memproses...' : 'Masuk'}
              </button>

              <div className="auth-form__divider">
                <div className="auth-form__divider-line" />
                <span className="auth-form__divider-text">atau masuk dengan</span>
                <div className="auth-form__divider-line" />
              </div>

              <button type="button" className="auth-form__google-btn" onClick={handleGoogleLogin} disabled={loading}>
                <svg className="auth-form__google-icon" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Masuk dengan Google
              </button>
            </form>

            <p className="auth-page__switch">
              Belum punya akun? <Link href="/daftar">Daftar Sekarang</Link>
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

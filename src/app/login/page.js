"use client";

import { useState } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Check verification
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        setError("Please verify your email before logging in. Check your inbox.");
        return;
      }
      router.push('/');
    } catch (err) {
      setError("Failed to login. Please check your credentials.");
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/');
    } catch (err) {
      setError("Failed to login with Google.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <img src="/img/LogoMQN144.png" alt="Logo" className="auth-left-logo" />
        <h1>MQ News Today AI</h1>
        <p>Truth & Clarity</p>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <button 
            onClick={() => router.push('/')} 
            style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '600', padding: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Kembali ke Beranda
          </button>
          <h2>Login</h2>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="auth-input-group">
              <label>Email</label>
              <input type="email" required className="auth-input" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="auth-input-group">
              <label>Password</label>
              <input type="password" required className="auth-input" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="auth-button">Sign In</button>
          </form>
          
          <button onClick={handleGoogleLogin} className="auth-google-btn">
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-links">
            <Link href="/forgot-password">Forgot Password?</Link>
            <Link href="/register">Don't have an account? Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

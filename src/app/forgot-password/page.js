"use client";

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError('Failed to send password reset email. Please check the email address.');
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
            onClick={() => router.push('/login')} 
            style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '600', padding: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Kembali ke Login
          </button>
          <h2>Reset Password</h2>
          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}
          <form onSubmit={handleReset}>
            <div className="auth-input-group">
              <label>Email</label>
              <input type="email" required className="auth-input" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="auth-button">Send Reset Link</button>
          </form>
          
          <div className="auth-links">
            <Link href="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

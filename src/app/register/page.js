"use client";

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (pass.length === 0) return { label: '', class: '' };
    if (score <= 2) return { label: 'Weak', class: 'weak' };
    if (score <= 4) return { label: 'Medium', class: 'medium' };
    return { label: 'Strong', class: 'strong' };
  };

  const strength = calculateStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Domain validation
    const emailLower = email.toLowerCase();
    if (!emailLower.endsWith('@gmail.com') && !emailLower.endsWith('@yahoo.com')) {
      setError("Please use a @gmail.com or @yahoo.com email address.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update profile with name
      if (name.trim()) {
        await updateProfile(userCredential.user, { displayName: name.trim() });
      }
      // Send verification
      await sendEmailVerification(userCredential.user);
      // Immediately log them out so they must verify before actually using the app
      await signOut(auth);
      setSuccess("Registration successful! Please check your email to verify your account before logging in.");
      setEmail('');
      setPassword('');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Email is already in use.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Please use at least 6 characters.");
      } else {
        setError("Failed to register. Please try again.");
      }
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
          <h2>Register</h2>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}
          
          <form onSubmit={handleRegister}>
            <div className="auth-input-group">
              <label>Nama Lengkap</label>
              <input type="text" required className="auth-input" value={name} onChange={e => setName(e.target.value)} placeholder="Nama Anda" />
            </div>
            <div className="auth-input-group">
              <label>Email</label>
              <input type="email" required className="auth-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@gmail.com" />
            </div>
            <div className="auth-input-group">
              <label>Password</label>
              <input type="password" required className="auth-input" value={password} onChange={e => setPassword(e.target.value)} />
              {password && (
                <>
                  <div className="password-strength-bar-container">
                    <div className={`password-strength-bar ${strength.class}`}></div>
                  </div>
                  <div className={`password-strength-text ${strength.class}`}>{strength.label} Password</div>
                </>
              )}
            </div>
            <button type="submit" className="auth-button">Sign Up</button>
          </form>
          
          <div className="auth-links">
            <Link href="/login">Already have an account? Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

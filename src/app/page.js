"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Halo! Gue MQ News Today AI. Pegangan gue selalu TRUTH & CLARITY. Ada yang pengen lu tanyain soal Muhammad Qasim hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const [guestMessageCount, setGuestMessageCount] = useState(0);
  const [rateLimitWait, setRateLimitWait] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Load guest count on mount
  useEffect(() => {
    const count = localStorage.getItem('guestMessageCount');
    if (count) setGuestMessageCount(parseInt(count, 10));
  }, []);

  // Timer logic for rate limiting queue
  useEffect(() => {
    let timer;
    if (rateLimitWait > 0) {
      timer = setTimeout(() => {
        setRateLimitWait(prev => prev - 1);
      }, 1000);
    } else if (rateLimitWait === 0 && isRetrying) {
      // Auto-retry when timer hits 0
      setIsRetrying(false);
      retryLastMessage();
    }
    return () => clearTimeout(timer);
  }, [rateLimitWait, isRetrying]);

  // Helper to safely parse **bold** and [links](url)
  const parseFormatting = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        return <a key={index} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{linkMatch[1]}</a>;
      }
      return part;
    });
  };

  const retryLastMessage = async () => {
    if (rateLimitWait > 0 || !isLoading) return;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      const data = await response.json();

      if (response.status === 429 && data.error === 'rate_limit') {
        setIsRetrying(true);
        setRateLimitWait(data.waitTime);
        return;
      }
      if (!response.ok) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      alert('Maaf, terjadi kesalahan saat menghubungi AI.');
    }
  };

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    // Optional: could add a tiny "copied!" toast, but simple clipboard write is fine.
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Check guest limits
    if (!user) {
      if (guestMessageCount >= 3) {
        router.push('/login');
        return;
      }
      const newCount = guestMessageCount + 1;
      setGuestMessageCount(newCount);
      localStorage.setItem('guestMessageCount', newCount.toString());
    }

    let baseMessages = messages;
    if (editingIndex !== null) {
      // User is editing an old message, so we trim the history up to that point
      baseMessages = messages.slice(0, editingIndex);
      setEditingIndex(null);
    }

    const newMessage = { role: 'user', content: input };
    const newMessages = [...baseMessages, newMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setRateLimitWait(0);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      
      if (response.status === 429 && data.error === 'rate_limit') {
        setIsRetrying(true);
        setRateLimitWait(data.waitTime);
        // Return without setting isLoading to false so it auto-retries
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan. Coba lagi.');
      }

      setMessages((prev) => [...prev, { role: 'ai', content: data.reply }]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      setIsLoading(false);
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEdit = (index, content) => {
    setInput(content);
    setEditingIndex(index);
    if (inputRef.current) {
      inputRef.current.focus();
      // Wait for React to render, then set correct height
      setTimeout(() => {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      }, 0);
    }
  };

  return (
    <>
      {/* Mobile Sidebar & Overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
      <aside className={`mobile-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div className="sidebar-header">
          <img src="/img/LogoMQN144.png" alt="Logo" className="sidebar-logo" />
          <h2>MQ News Today AI</h2>
          <p className="sidebar-slogan">Truth & Clarity</p>
        </div>
        <div className="sidebar-content">
          {user ? (
            <div className="sidebar-user">
              <span className="sidebar-greeting">Halo, {user.displayName || user.email?.split('@')[0]}!</span>
              <button 
                onClick={() => { signOut(auth); setIsSidebarOpen(false); }} 
                className="header-btn" 
                style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            </div>
          ) : (
            <div className="sidebar-user">
              <button 
                onClick={() => { router.push('/login'); setIsSidebarOpen(false); }} 
                className="header-btn accent" 
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Login
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Desktop Header */}
      <header className="header desktop-header">
        <div className="header-logo-title">
          <img src="/img/LogoMQN144.png" alt="Logo" className="header-logo" />
          <div className="header-title">
            <h1>MQ News Today AI</h1>
            <p>Truth & Clarity</p>
          </div>
        </div>
        
        <div className="header-controls" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="user-greeting">
              <span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>
                Halo, {user.displayName || user.email?.split('@')[0]}!
              </span>
              <button 
                onClick={() => signOut(auth)} 
                className="header-btn" 
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => router.push('/login')} 
              className="header-btn accent" 
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Login
            </button>
          )}
          <button onClick={toggleTheme} className="header-btn">
            {theme === 'light' ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              Dark Mode
            </>
            ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              Light Mode
            </>
          )}
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="header mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open Sidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <h1 style={{ fontSize: '1.2rem', fontWeight: '700' }}>MQ News Today AI</h1>
        </div>
        <button onClick={toggleTheme} className="header-btn icon-only" aria-label="Toggle Theme">
          {theme === 'light' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          )}
        </button>
      </header>

      <main className="main-container">
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.role}`}>
              <div className={`message ${msg.role}`}>
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} style={{ marginBottom: '0.75rem' }}>{parseFormatting(line)}</p>
                ))}
                
                <div className={`message-actions ${msg.role}-actions`}>
                  <button className="copy-button" onClick={() => handleCopy(msg.content)} title="Salin">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </button>
                  {msg.role === 'user' && (
                    <button className="copy-button" onClick={() => handleEdit(index, msg.content)} title="Edit & Ulangi">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && !rateLimitWait && (
            <div className="message-wrapper ai">
              <div className="message ai">
                <div className="typing-indicator">
                  <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
              </div>
            </div>
          )}
          {isLoading && rateLimitWait > 0 && (
            <div className="message-wrapper ai">
              <div className="message ai" style={{ background: 'rgba(255, 165, 0, 0.1)', border: '1px solid orange' }}>
                <p>⚠️ Server penuh. Melanjutkan antrean dalam: <strong>{rateLimitWait} detik...</strong></p>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="input-container">
          {!user && guestMessageCount >= 3 ? (
            <button 
              type="button" 
              onClick={() => router.push('/login')} 
              className="auth-button" 
              style={{ width: '100%', padding: '1rem', marginTop: 0 }}
            >
              Batas 3 Pesan Habis. Login untuk Unlimited Chat!
            </button>
          ) : (
            <>
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={!user ? `Tanya sesuatu... (Sisa kuota tamu: ${3 - guestMessageCount})` : "Tanya sesuatu..."}
                className="chat-input"
                disabled={isLoading}
                rows={1}
              />
              <button type="submit" className="send-button" disabled={!input.trim() || isLoading} aria-label="Kirim">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </>
          )}
        </form>
        {editingIndex !== null && (
          <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'orange', padding: '0.5rem' }}>
            Mengedit pesan lama. Jika dikirim, percakapan di bawahnya akan dihapus.
            <button 
              type="button" 
              onClick={() => { setEditingIndex(null); setInput(''); if(inputRef.current) inputRef.current.style.height = 'auto'; }} 
              style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', marginLeft: '10px' }}
            >
              Batal
            </button>
          </div>
        )}
      </main>
    </>
  );
}

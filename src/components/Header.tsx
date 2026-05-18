'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import './Header.css';

const NAV_ITEMS = [
  { label: 'Beranda', href: '/' },
  { label: 'Berita', href: '/berita' },
  { label: 'Mubasyirat', href: '/mubasyirat' },
  { label: 'PDF', href: '/pdf' },
  { label: 'Audio', href: '/audio' },
  { label: 'Bookmark', href: '/bookmark' },
];

const BERITA_CATEGORIES = [
  { label: 'Semua', href: '/berita' },
  { label: 'Geopolitik', href: '/berita?kategori=geopolitik' },
  { label: 'Eskatologi', href: '/berita?kategori=eskatologi' },
  { label: 'Mimpi Qasim', href: '/berita?kategori=mimpi-qasim' },
  { label: 'Timur Tengah', href: '/berita?kategori=timur-tengah' },
  { label: 'Trending', href: '/berita?kategori=trending' },
  { label: 'Video', href: '/berita?kategori=video' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const headerRef = useRef<HTMLElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Don't render Header on auth pages at all (prevents hydration mismatch)
  const isAuthPage = pathname === '/login' || pathname === '/daftar' || pathname === '/lupa-sandi';

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ticking client-side clock
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setDateString(now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }));
      setTimeString(now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }) + ' WIB');
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
    } else {
      setSearchQuery('');
    }
  }, [searchParams]);

  // Global browser refresh/reload detection to reset query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let isReload = false;
      try {
        const navEntries = performance.getEntriesByType('navigation');
        if (navEntries.length > 0) {
          isReload = (navEntries[0] as PerformanceNavigationTiming).type === 'reload';
        } else {
          isReload = window.performance.navigation.type === 1;
        }
      } catch (e) {
        isReload = window.performance.navigation.type === 1;
      }

      if (isReload && window.location.search !== '') {
        const cleanPath = window.location.pathname;
        if (cleanPath === '/search') {
          window.location.href = '/';
        } else {
          window.location.href = cleanPath;
        }
      }
    }
  }, []);

  // Deterministic SPA history stack tracker for Smart Back
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        let paths = JSON.parse(sessionStorage.getItem('appPaths') || '[]');
        if (paths.length === 0) {
          paths.push(pathname);
        } else {
          const existingIndex = paths.indexOf(pathname);
          if (existingIndex !== -1) {
            // User returned to a page already in the history stack, rewind the stack to that point
            paths = paths.slice(0, existingIndex + 1);
          } else {
            // User navigated to a new page, push it
            paths.push(pathname);
          }
        }
        sessionStorage.setItem('appPaths', JSON.stringify(paths));
      } catch (e) {
        console.error(e);
      }
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (pathname === '/berita' || pathname.startsWith('/berita/')) {
      router.push(`/berita?q=${encodeURIComponent(query)}`);
    } else if (pathname === '/audio') {
      router.push(`/audio?q=${encodeURIComponent(query)}`);
    } else if (pathname === '/mubasyirat') {
      router.push(`/mubasyirat?q=${encodeURIComponent(query)}`);
    } else if (pathname === '/pdf') {
      router.push(`/pdf?q=${encodeURIComponent(query)}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // Auth pages: don't render header/nav/mobile-menu at all
  if (isAuthPage) return null;

  return (
    <>
      <header
        ref={headerRef}
        className={`header ${scrolled ? 'header--scrolled' : ''}`}
        id="main-header"
        suppressHydrationWarning
      >
        {/* Main header with logo, search, and date */}
        <div className="header__main">
          <div className="container header__main-inner">
            {/* Logo Section */}
            <Link href="/" className="header__logo" id="header-logo">
              <Image
                src="/LogoMQN144.png"
                alt="MQ News Today"
                width={48}
                height={48}
                className="header__logo-img"
                priority
              />
              <div className="header__logo-text">
                <span className="header__logo-name">MQ NEWS TODAY</span>
                <span className="header__logo-tagline">TRUTH & CLARITY</span>
              </div>
            </Link>

            {/* Search Bar - Always Visible */}
            <form className="header__search-form" onSubmit={handleSearch} id="search-form">
              <div className="header__search-wrapper">
                <svg className="header__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  className="header__search-input"
                  placeholder="Cari berita, topik, atau artikel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="header__search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                  </button>
                )}
                <button type="submit" className="header__search-btn" id="search-submit">
                  Cari
                </button>
              </div>
            </form>

            {/* Date, Actions, & Hamburger */}
            <div className="header__right-section">
              <div className="header__date-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
              <div className="header__date" suppressHydrationWarning>
                  {dateString || 'Memuat tanggal...'}
                </div>
                <div className="header__time" suppressHydrationWarning style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-light)', marginTop: '2px', letterSpacing: '0.04em', fontFamily: 'monospace' }}>
                  {timeString || '00:00:00 WIB'}
                </div>
              </div>

              {/* sleek divider */}
              <div className="header__divider"></div>

              {/* Actions Row */}
              <div className="header__actions">
                {/* Notification Button */}
                <Link 
                  href="/notifikasi"
                  className="header__action-btn header__action-btn--notification" 
                  aria-label="Notifikasi" 
                  id="notification-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span className="header__action-badge"></span>
                </Link>

                {/* Settings Button */}
                <Link 
                  href="/settings"
                  className="header__action-btn header__action-btn--settings" 
                  aria-label="Pengaturan" 
                  id="settings-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </Link>

                {/* Profile Button Container with Dropdown */}
                <div className="header__profile-container" ref={profileDropdownRef}>
                  <button 
                    className={`header__action-btn header__action-btn--profile ${!user?.photoURL ? 'header__action-btn--profile-text' : ''}`} 
                    aria-label="Profil Pengguna" 
                    id="profile-btn"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <span className="header__profile-text">Profil</span>
                    )}
                  </button>

                  {/* Dropdown menu */}
                  {profileDropdownOpen && (
                    <div className="header__profile-dropdown">
                      {!user ? (
                        <>
                          <Link 
                            href="/login" 
                            className="header__dropdown-item"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                              <polyline points="10 17 15 12 10 7" />
                              <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                            Masuk / Daftar
                          </Link>
                          <Link 
                            href="/settings" 
                            className="header__dropdown-item"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="3" />
                              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                            Pengaturan
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link 
                            href="/profil" 
                            className="header__dropdown-item" 
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="16" rx="2" />
                              <circle cx="9" cy="10" r="2" />
                              <path d="M6 16c0-1 1-2 3-2s3 1 3 2" />
                              <line x1="15" x2="18" y1="8" y2="8" />
                              <line x1="15" x2="18" y1="12" y2="12" />
                              <line x1="15" x2="18" y1="16" y2="16" />
                            </svg>
                            Profil Saya
                          </Link>
                          <Link 
                            href="/settings" 
                            className="header__dropdown-item" 
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="3" />
                              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                            Pengaturan
                          </Link>
                          <button 
                            className="header__dropdown-item header__dropdown-item--logout" 
                            onClick={async () => {
                              await logout();
                              setProfileDropdownOpen(false);
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Keluar
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Hamburger for mobile */}
              <button
                className={`header__hamburger ${mobileMenuOpen ? 'header__hamburger--active' : ''}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                id="hamburger-toggle"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="header__nav" id="main-nav">
          <div className="container header__nav-inner">
            <div className="header__nav-main">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

      </header>

      {/* Mobile menu overlay */}
      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'mobile-menu-overlay--active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside className={`mobile-menu ${mobileMenuOpen ? 'mobile-menu--active' : ''}`} id="mobile-menu">
        <div className="mobile-menu__header">
          <Link href="/" className="header__logo" onClick={() => setMobileMenuOpen(false)}>
            <Image
              src="/LogoMQN144.png"
              alt="MQ News Today"
              width={36}
              height={36}
              className="header__logo-img"
            />
            <div className="header__logo-text">
              <span className="header__logo-name" style={{ fontSize: '1rem' }}>MQ NEWS TODAY</span>
            </div>
          </Link>
          <button
            className="mobile-menu__close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Search */}
        <div className="mobile-menu__search">
          <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }}>
            <div className="header__search-wrapper">
              <svg className="header__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="header__search-input"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        <nav className="mobile-menu__nav">
          <div className="mobile-menu__section-label">Menu</div>
          {NAV_ITEMS.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="mobile-menu__link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {item.label}
            </Link>
          ))}
          <div className="mobile-menu__divider" />
          <div className="mobile-menu__section-label">Kategori Berita</div>
          {BERITA_CATEGORIES.map((cat, i) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="mobile-menu__link mobile-menu__link--sub"
              onClick={() => setMobileMenuOpen(false)}
              style={{ animationDelay: `${(i + NAV_ITEMS.length) * 50}ms` }}
            >
              {cat.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}

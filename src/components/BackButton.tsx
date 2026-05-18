'use client';

import { useRouter, usePathname } from 'next/navigation';
import './BackButton.css';

interface BackButtonProps {
  className?: string;
  forceExitHref?: string;
}

export default function BackButton({ className = '', forceExitHref }: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (forceExitHref) {
      router.push(forceExitHref);
      return;
    }

    // 1. If it's a main list navbar page, ALWAYS go back to the Home page
    const listNavbarPages = ['/audio', '/berita', '/mubasyirat', '/pdf'];
    if (listNavbarPages.includes(pathname)) {
      router.push('/');
      return;
    }

    // 2. If it's a detail/narrative page, implement true smart back behavior
    let paths = [];
    try {
      paths = JSON.parse(sessionStorage.getItem('appPaths') || '[]');
    } catch (e) {
      console.error(e);
    }

    if (paths.length > 1) {
      // Pop the current page from our tracked history
      paths.pop();
      sessionStorage.setItem('appPaths', JSON.stringify(paths));
      // Use native browser back which pops the history stack cleanly without loops!
      router.back();
    } else {
      // Reached the entry point of the app (e.g. WA external link)
      router.push('/');
    }
  };

  return (
    <button onClick={handleBack} className={`smart-back-btn ${className}`} aria-label="Kembali ke halaman sebelumnya">
      <svg className="smart-back-btn__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      Kembali
    </button>
  );
}

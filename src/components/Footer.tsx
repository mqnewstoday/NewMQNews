import Link from 'next/link';
import Image from 'next/image';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="main-footer">
      <div className="container">
        <div className="footer__grid">
          {/* About */}
          <div className="footer__col">
            <Link href="/" className="footer__logo">
              <Image
                src="/LogoMQN144.png"
                alt="MQ News Today"
                width={40}
                height={40}
                className="footer__logo-img"
              />
              <div className="footer__logo-text">
                <span className="footer__logo-name">MQ NEWS TODAY</span>
                <span className="footer__logo-tagline">TRUTH & CLARITY</span>
              </div>
            </Link>
            <p className="footer__about">
              MQ News Today berdedikasi untuk menyajikan informasi yang sering luput dari media arus utama. Fokus pada kebenaran dan analisis mendalam.
            </p>
            <div className="footer__socials">
              <a href="https://x.com/MQNewsToday" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Twitter/X" id="social-twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/mqnewstoday?igsh=MTc4bWxibXN2ejB4bQ==" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Instagram" id="social-instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@mqnewstoday?_r=1&_t=ZS-96T4fzmcLUC" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="TikTok" id="social-tiktok">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.94 1.18 2.25 2.02 3.69 2.45.03 1.37.01 2.75.02 4.12-.96-.06-1.92-.31-2.8-.72-.94-.44-1.78-1.08-2.45-1.87v7.26c.01 1.34-.23 2.68-.73 3.93-.9 2.27-2.73 4.14-5.06 5.04-1.31.51-2.72.76-4.13.73-2.12-.04-4.2-.82-5.83-2.19C.79 17.58-.2 15.22-.03 12.82c.16-2.33 1.3-4.52 3.16-5.94C4.85 5.58 6.96 4.9 9 5v4.17c-.93-.07-1.88.13-2.7.58-.87.49-1.57 1.25-1.98 2.16-.39.87-.55 1.83-.46 2.78.1 1.05.57 2.05 1.32 2.79.77.76 1.8 1.2 2.87 1.24 1.02.04 2.04-.24 2.89-.81.93-.63 1.53-1.64 1.69-2.74.06-.39.08-.79.08-1.18V0c-.09.01-.18.01-.27.02z" />
                </svg>
              </a>
              <a href="https://www.youtube.com/@MQNewsToday" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="YouTube" id="social-youtube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__col">
            <h4 className="footer__col-title">Navigasi</h4>
            <ul className="footer__links">
              <li><Link href="/">Beranda</Link></li>
              <li><Link href="/berita">Berita</Link></li>
              <li><Link href="/mubasyirat">Mubasyirat</Link></li>
              <li><Link href="/pdf">PDF</Link></li>
              <li><Link href="/audio">Audio</Link></li>
              <li><Link href="/bookmark">Bookmark</Link></li>
            </ul>
          </div>

          {/* Information */}
          <div className="footer__col">
            <h4 className="footer__col-title">Informasi</h4>
            <ul className="footer__links">
              <li><Link href="/privacy">Kebijakan Privasi</Link></li>
              <li><Link href="/terms">Syarat & Ketentuan</Link></li>
              <li><Link href="/pedoman">Pedoman Media</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h4 className="footer__col-title">Kontak</h4>
            <div className="footer__contact-list">
              <div className="footer__contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>WA: +62 857-0585-6030</span>
              </div>
              <div className="footer__contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Bandung, Indonesia</span>
              </div>
              <a 
                href="https://chat.whatsapp.com/Cb6nVjlAtj06JRdeFzRpKw" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer__contact-item footer__contact-item--link"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <span>Join Grup WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} MQ News Today. Hak Cipta Dilindungi.
          </p>
          <div className="footer__bottom-links">
            <Link href="/privacy">Privasi</Link>
            <Link href="/terms">Ketentuan</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

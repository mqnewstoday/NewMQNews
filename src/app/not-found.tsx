import Link from 'next/link';
import './not-found.css';

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="container">
        <div className="not-found__content">
          <div className="not-found__code">404</div>
          <h1 className="not-found__title">Halaman Tidak Ditemukan</h1>
          <p className="not-found__desc">
            Maaf, halaman yang Anda cari tidak ditemukan atau mungkin telah dipindahkan. Silakan kembali ke beranda atau gunakan menu navigasi.
          </p>
          <div className="not-found__actions">
            <Link href="/" className="btn btn-primary btn-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

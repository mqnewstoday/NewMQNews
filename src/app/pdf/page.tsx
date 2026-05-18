import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { fetchPdfBooks } from '@/utils/sheetsApi';
import PdfSmartBack from '@/components/PdfSmartBack';
import './pdf.css';

export const metadata = {
  title: 'Buku PDF - MQ News Today',
  description: 'Baca buku interaktif mengenai perjalanan dan mimpi-mimpi Muhammad Qasim secara langsung.',
};

export const revalidate = 300;

export default async function PdfPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const pdfBooks = await fetchPdfBooks();
  const query = params.q as string;

  let filteredBooks = pdfBooks;
  if (query) {
    filteredBooks = filteredBooks.filter((book) =>
      book.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  return (
    <div className="pdf-page container section">
      {/* Smart browser hardware back button override */}
      <PdfSmartBack />

      {/* Smart Back Button that forces an exit instead of going back through iframe history */}
      <BackButton forceExitHref="/" />

      <div className="pdf-page__header" style={{ marginTop: 'var(--space-sm)' }}>
        <h1 className="pdf-page__title">
          {query ? `Hasil Pencarian: "${query}"` : 'Buku PDF Interaktif'}
        </h1>
        <p className="pdf-page__desc">
          Baca dan eksplorasi buku flipbook interaktif mengenai perjalanan dan mimpi-mimpi Muhammad Qasim secara utuh.
        </p>
      </div>

      <div 
        className="pdf-embed-container" 
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '75vh', 
          minHeight: '600px',
          borderRadius: 'var(--radius-lg)', 
          overflow: 'hidden', 
          boxShadow: 'var(--shadow-md)',
          background: 'var(--color-bg-alt)',
          marginBottom: 'var(--space-xl)'
        }}
      >
        <iframe
          src="https://heyzine.com/flip-book/9fd2b24848.html"
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          style={{ border: 'none' }}
        ></iframe>
      </div>

      {/* Horizontal PDF Books List Section */}
      <section className="pdf-books-section">
        <h2 className="pdf-books-section__title">
          {query ? 'Hasil Pencarian PDF' : 'Koleksi Buku PDF Lengkap'}
        </h2>
        <p className="pdf-books-section__desc">
          Unduh atau baca langsung salinan dokumen resmi/buku mimpi Muhammad Qasim di Google Drive
        </p>

        {filteredBooks && filteredBooks.length > 0 ? (
          <div className="pdf-books-grid">
            {filteredBooks.map((book) => (
              <div key={book.id} className="pdf-book-card" id={`pdf-book-${book.id}`}>
                <div className="pdf-book-card__img-container">
                  <img 
                    src={book.imageUrl} 
                    alt={book.name} 
                    className="pdf-book-card__img"
                    loading="lazy"
                  />
                </div>
                <h3 className="pdf-book-card__title">{book.name}</h3>
                <a 
                  href={book.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="pdf-book-card__btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Unduh / View PDF
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="pdf-books-empty" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4xl) var(--space-xl)', textAlign: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 'var(--space-md)', opacity: 0.7 }}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '8px' }}>Tidak Ada Hasil</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto', marginBottom: 'var(--space-lg)' }}>
              Buku PDF dengan kata kunci <strong>"{query}"</strong> tidak ditemukan.
            </p>
            <Link href="/pdf" className="btn btn--primary" style={{ padding: '12px 24px', fontWeight: 600 }}>
              Atur Ulang Pencarian
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

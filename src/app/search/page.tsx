import Link from 'next/link';
import { fetchBerita, fetchAudio, fetchMubasyirat, fetchPdfBooks } from '@/utils/sheetsApi';
import ArticleCard from '@/components/ArticleCard';
import AudioPlayerList from '@/components/AudioPlayerList';
import BackButton from '@/components/BackButton';
import './search.css';

export const metadata = {
  title: 'Hasil Pencarian - MQ News Today',
};

export const revalidate = 0; // Dynanic search results

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const query = ((params.q as string) || '').trim();

  if (!query) {
    return (
      <div className="search-page container section">
        <BackButton />
        <div className="search-page__header" style={{ marginTop: 'var(--space-sm)' }}>
          <h1 className="search-page__title">Pencarian</h1>
          <p className="search-page__desc">Ketik kata kunci untuk mencari konten...</p>
        </div>
        <div className="search-page__empty">
          <p>Ketikkan sesuatu di kolom pencarian di atas.</p>
        </div>
      </div>
    );
  }

  // Fetch all datasets in parallel
  const [beritaList, audioList, mubasyiratList, pdfList] = await Promise.all([
    fetchBerita(),
    fetchAudio(),
    fetchMubasyirat(),
    fetchPdfBooks(),
  ]);

  // Filter News (Berita)
  const matchedBerita = beritaList.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.excerpt.toLowerCase().includes(query.toLowerCase()) ||
    item.content.toLowerCase().includes(query.toLowerCase())
  );

  // Filter Audio
  const matchedAudio = audioList.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  // Filter Mubasyirat
  const matchedMubasyirat = mubasyiratList.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.excerpt.toLowerCase().includes(query.toLowerCase()) ||
    item.content.toLowerCase().includes(query.toLowerCase())
  );

  // Filter PDF Books
  const matchedPdf = pdfList.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  const hasResults = matchedBerita.length > 0 || matchedAudio.length > 0 || matchedMubasyirat.length > 0 || matchedPdf.length > 0;

  return (
    <div className="search-page container section">
      <BackButton />

      <div className="search-page__header" style={{ marginTop: 'var(--space-sm)' }}>
        <h1 className="search-page__title">Hasil Pencarian</h1>
        <p className="search-page__desc">
          Menampilkan hasil relevan untuk kata kunci: <strong>"{query}"</strong>
        </p>
      </div>

      {hasResults ? (
        <div className="search-results">
          {/* Berita Results */}
          {matchedBerita.length > 0 && (
            <section className="search-section">
              <h2 className="search-section__title">
                Berita Terbaru
                <span className="search-section__count">{matchedBerita.length} Berita</span>
              </h2>
              <div className="grid grid-3">
                {matchedBerita.map((article, i) => (
                  <ArticleCard key={article.id} article={article} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* Mubasyirat Results */}
          {matchedMubasyirat.length > 0 && (
            <section className="search-section">
              <h2 className="search-section__title">
                Koleksi Mubasyirat
                <span className="search-section__count">{matchedMubasyirat.length} Mubasyirat</span>
              </h2>
              <div className="mubasyirat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
                {matchedMubasyirat.map((item) => (
                  <Link key={item.id} href={`/mubasyirat/${item.id}`} className="mubasyirat-card" id={`mubasyirat-card-${item.id}`}>
                    <div className="mubasyirat-card__thumb">
                      <div
                        className="mubasyirat-card__blur-bg"
                        style={{
                          backgroundImage: `url(${item.imageUrl})`,
                          position: 'absolute',
                          inset: 0,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: 'blur(16px)',
                          opacity: 0.5,
                          transform: 'scale(1.15)',
                          zIndex: 1,
                        }}
                      />
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="mubasyirat-card__image"
                        loading="lazy"
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          zIndex: 2,
                        }}
                      />
                      <div className="mubasyirat-card__overlay" style={{ zIndex: 3 }} />
                      {item.category && (
                        <span className="category-tag mubasyirat-card__tag" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, background: 'var(--color-secondary)', color: '#1a2e00', fontSize: '0.65rem' }}>
                          {item.category}
                        </span>
                      )}
                      {item.year && (
                        <span className="year-tag mubasyirat-card__year-tag" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'rgba(0,0,0,0.6)', color: '#ffffff', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {item.year}
                        </span>
                      )}
                    </div>
                    <div className="mubasyirat-card__body">
                      <h4 className="mubasyirat-card__title">{item.title}</h4>
                      <p className="mubasyirat-card__excerpt">{item.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Audio Results */}
          {matchedAudio.length > 0 && (
            <section className="search-section">
              <h2 className="search-section__title">
                Koleksi Audio
                <span className="search-section__count">{matchedAudio.length} Audio</span>
              </h2>
              <AudioPlayerList items={matchedAudio} />
            </section>
          )}

          {/* PDF Results */}
          {matchedPdf.length > 0 && (
            <section className="search-section">
              <h2 className="search-section__title">
                Koleksi Buku PDF
                <span className="search-section__count">{matchedPdf.length} Buku</span>
              </h2>
              <div className="pdf-books-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-xl)' }}>
                {matchedPdf.map((book) => (
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
            </section>
          )}
        </div>
      ) : (
        <div className="search-page__empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 'var(--space-md)', opacity: 0.7 }}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '8px' }}>Tidak Ada Hasil</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto', marginBottom: 'var(--space-lg)' }}>
            Kata kunci <strong>"{query}"</strong> tidak cocok dengan judul berita, deskripsi audio, mubasyirat, atau buku PDF mana pun.
          </p>
          <Link href="/" className="btn btn--primary" style={{ padding: '12px 24px', fontWeight: 600 }}>
            Kembali ke Beranda
          </Link>
        </div>
      )}
    </div>
  );
}

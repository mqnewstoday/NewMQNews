import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import { fetchBerita } from '@/utils/sheetsApi';
import BackButton from '@/components/BackButton';
import Pagination from '@/components/Pagination';
import './berita.css';

export const revalidate = 300;

export default async function BeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const page = parseInt((params.page as string) || '1', 10);
  const ITEMS_PER_PAGE = 6;

  let articles = await fetchBerita();
  
  // Apply category filtering if present
  const kategori = params.kategori as string;
  if (kategori && kategori !== 'semua' && kategori !== 'trending' && kategori !== 'video') {
    articles = articles.filter(a => a.category.toLowerCase() === kategori.toLowerCase());
  }

  // Apply search query filtering if present
  const query = params.q as string;
  if (query) {
    articles = articles.filter(a => 
      a.title.toLowerCase().includes(query.toLowerCase()) || 
      a.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      a.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  const totalItems = articles.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentArticles = articles.slice(startIndex, endIndex);

  return (
    <div className="berita-page container section">
      {/* Smart Back Button */}
      <BackButton />

      <div className="berita-page__header" style={{ marginTop: 'var(--space-sm)' }}>
        <h1 className="berita-page__title">
          {query ? `Hasil Pencarian: "${query}"` : (kategori ? `Kategori: ${kategori.charAt(0).toUpperCase() + kategori.slice(1)}` : 'Semua Berita')}
        </h1>
        <p className="berita-page__desc">
          Kumpulan berita, geopolitik, eskatologi, dan informasi terlengkap seputar kebenaran akhir zaman.
        </p>
      </div>

      {currentArticles.length > 0 ? (
        <>
          <div className="grid grid-3">
            {currentArticles.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={startIndex + i} />
            ))}
          </div>
          <Pagination totalPages={totalPages} currentPage={page} />
        </>
      ) : (
        <div className="berita-page__empty" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4xl) var(--space-xl)', textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 'var(--space-md)', opacity: 0.7 }}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '8px' }}>Tidak Ada Hasil</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto', marginBottom: 'var(--space-lg)' }}>
            Berita dengan kata kunci <strong>"{query}"</strong> tidak ditemukan.
          </p>
          <Link href="/berita" className="btn btn--primary" style={{ padding: '12px 24px', fontWeight: 600 }}>
            Atur Ulang Pencarian
          </Link>
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
import { fetchAudio } from '@/utils/sheetsApi';
import AudioPlayerList from '@/components/AudioPlayerList';
import BackButton from '@/components/BackButton';
import Pagination from '@/components/Pagination';
import './audio.css';

export const revalidate = 300;

export default async function AudioPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const page = parseInt((params.page as string) || '1', 10);
  const ITEMS_PER_PAGE = 6;

  const audioItems = await fetchAudio();

  // Apply search query filtering if present
  let filteredAudio = audioItems;
  const query = params.q as string;
  if (query) {
    filteredAudio = filteredAudio.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.description.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  const totalItems = filteredAudio.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredAudio.slice(startIndex, endIndex);

  return (
    <div className="audio-page container section">
      {/* Smart Back Button */}
      <BackButton />

      <div className="audio-page__header" style={{ marginTop: 'var(--space-sm)' }}>
        <h1 className="audio-page__title">
          {query ? `Hasil Pencarian: "${query}"` : 'Koleksi Audio'}
        </h1>
        <p className="audio-page__desc">
          Dengarkan narasi lengkap dan penjelasan terperinci tentang mimpi-mimpi Muhammad Qasim yang di-dubbing dalam Bahasa Indonesia.
        </p>
      </div>

      {currentItems.length > 0 ? (
        <>
          <AudioPlayerList items={currentItems} />
          <Pagination totalPages={totalPages} currentPage={page} />
        </>
      ) : (
        <div className="audio-page__empty" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4xl) var(--space-xl)', textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 'var(--space-md)', opacity: 0.7 }}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '8px' }}>Tidak Ada Hasil</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto', marginBottom: 'var(--space-lg)' }}>
            Audio dengan kata kunci <strong>"{query}"</strong> tidak ditemukan.
          </p>
          <Link href="/audio" className="btn btn--primary" style={{ padding: '12px 24px', fontWeight: 600 }}>
            Atur Ulang Pencarian
          </Link>
        </div>
      )}
    </div>
  );
}

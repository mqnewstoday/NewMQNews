import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchAudio } from '@/utils/sheetsApi';
import AudioPlayerDetail from '@/components/AudioPlayerDetail';
import BackButton from '@/components/BackButton';
import CommentSection from '@/components/CommentSection';
import '../audio.css';

interface AudioDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AudioDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const audioItems = await fetchAudio();
  const item = audioItems.find((x) => x.id === id);

  if (!item) {
    return { title: 'Audio Tidak Ditemukan' };
  }

  const cleanDescription = item.description || 'Dengarkan rekaman audio mimpi Muhammad Qasim di MQ News Today.';

  return {
    title: `${item.title} — Audio Mimpi Muhammad Qasim`,
    description: cleanDescription,
    openGraph: {
      title: item.title,
      description: cleanDescription,
      type: 'music.song',
      url: `https://mqnewstoday.my.id/audio/${item.id}`,
      siteName: 'MQ News Today',
      images: item.thumbnail ? [{ url: item.thumbnail, width: 1200, height: 630, alt: item.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: cleanDescription,
      images: item.thumbnail ? [item.thumbnail] : undefined,
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function AudioDetailPage({ params }: AudioDetailPageProps) {
  const { id } = await params;
  const audioItems = await fetchAudio();

  const currentIndex = audioItems.findIndex((x) => x.id === id);

  if (currentIndex === -1) {
    notFound();
  }

  const currentItem = audioItems[currentIndex];

  // Calculate previous and next track ids
  const prevId = currentIndex > 0 ? audioItems[currentIndex - 1].id : null;
  const nextId = currentIndex < audioItems.length - 1 ? audioItems[currentIndex + 1].id : null;

  return (
    <div className="audio-page container section">
      {/* Smart Back Button */}
      <BackButton />

      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb" id="breadcrumb" style={{ marginTop: 'var(--space-xs)', marginBottom: 'var(--space-xl)' }}>
        <Link href="/">Beranda</Link>
        <span className="separator">/</span>
        <Link href="/audio">Koleksi Audio</Link>
        <span className="separator">/</span>
        <span className="current">{currentItem.title}</span>
      </nav>

      {/* Main Interactive Audio Player component */}
      <AudioPlayerDetail
        item={currentItem}
        prevId={prevId}
        nextId={nextId}
      />

      {/* Comment Section with local persistence and relative times */}
      <CommentSection itemId={currentItem.id} category="audio" />
    </div>
  );
}

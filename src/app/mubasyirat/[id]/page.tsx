import { Metadata } from 'next';
import { fetchMubasyirat } from '@/utils/sheetsApi';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
import CommentSection from '@/components/CommentSection';
import ArticleShareActions from '@/components/ArticleShareActions';
import './detail.css';

interface MubasyiratDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MubasyiratDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const items = await fetchMubasyirat();
  const item = items.find((x) => x.id === id);

  if (!item) {
    return { title: 'Mimpi Tidak Ditemukan' };
  }

  // Strip html formatting for preview description
  const cleanDescription = (item.excerpt || item.content || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .substring(0, 150)
    .trim() + '...';

  return {
    title: `${item.title} — Mubasyirat Muhammad Qasim`,
    description: cleanDescription,
    openGraph: {
      title: item.title,
      description: cleanDescription,
      type: 'article',
      url: `https://mqnewstoday.my.id/mubasyirat/${item.id}`,
      siteName: 'MQ News Today',
      images: item.imageUrl ? [{ url: item.imageUrl, width: 1200, height: 630, alt: item.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: cleanDescription,
      images: item.imageUrl ? [item.imageUrl] : undefined,
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function MubasyiratDetailPage({ params }: MubasyiratDetailPageProps) {
  const { id } = await params;
  const items = await fetchMubasyirat();
  const item = items.find((x) => x.id === id);

  if (!item) {
    notFound();
  }

  const relatedDreams = items.filter((x) => x.id !== id).slice(0, 3);

  return (
    <article className="mubasyirat-detail container section" id="mubasyirat-detail">
      {/* Smart Back Button */}
      <BackButton />

      {/* Breadcrumb */}
      <nav className="breadcrumb" id="breadcrumb" style={{ marginBottom: 'var(--space-xl)', marginTop: 'var(--space-xs)' }}>
        <Link href="/">Beranda</Link>
        <span className="separator">/</span>
        <Link href="/mubasyirat">Mubasyirat</Link>
        <span className="separator">/</span>
        <span className="current">{item.title}</span>
      </nav>

      <div className="mubasyirat-detail__layout">
        <div className="mubasyirat-detail__main">
          <header className="mubasyirat-detail__header">
            {item.category && (
              <span className="category-tag" style={{ background: 'var(--color-secondary)', color: '#1a2e00', marginBottom: 'var(--space-md)' }}>
                {item.category}
              </span>
            )}
            <h1 className="mubasyirat-detail__title">{item.title}</h1>
            <div className="mubasyirat-detail__meta" style={{ marginTop: 'var(--space-sm)' }}>
              {item.year && <span className="mubasyirat-detail__year">Tahun Mimpi: <strong>{item.year}</strong></span>}
            </div>
          </header>

          {item.imageUrl && (
            <div className="mubasyirat-detail__image-wrapper" style={{ position: 'relative', overflow: 'hidden', background: '#000' }}>
              {/* Blurred backdrop */}
              <div
                className="mubasyirat-detail__blur-bg"
                style={{
                  backgroundImage: `url(${item.imageUrl})`,
                  position: 'absolute',
                  inset: 0,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(20px)',
                  opacity: 0.6,
                  transform: 'scale(1.15)',
                  zIndex: 1,
                }}
              />
              <img
                src={item.imageUrl}
                alt={item.title}
                className="mubasyirat-detail__image"
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  zIndex: 2,
                }}
              />
            </div>
          )}

          {item.audioUrl && (
            <div className="mubasyirat-detail__audio">
              <h4 className="mubasyirat-detail__audio-title">Dengarkan Audio Mimpi</h4>
              <audio controls className="mubasyirat-detail__audio-player" src={item.audioUrl} />
            </div>
          )}

          <div
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: item.content }}
            style={{ marginTop: 'var(--space-lg)' }}
          />

          {/* Bottom actions bar (Consistent sharing actions) */}
          <div className="mubasyirat-detail__bottom" style={{ marginTop: 'var(--space-xl)', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--color-border)' }}>
            <ArticleShareActions articleId={item.id} title={item.title} type="mubasyirat" />
          </div>

          {/* Comments Section */}
          <CommentSection itemId={item.id} category="mubasyirat" />
        </div>

      {relatedDreams.length > 0 && (
        <section className="mubasyirat-detail__related" style={{ marginTop: 'var(--space-3xl)', paddingTop: 'var(--space-xl)', borderTop: '1px solid var(--color-border)' }}>
          <h2 className="section-title">Mubasyirat Lainnya</h2>
          <div className="mubasyirat-grid">
            {relatedDreams.map((dream) => (
              <Link key={dream.id} href={`/mubasyirat/${dream.id}`} className="mubasyirat-card">
                <div className="mubasyirat-card__thumb">
                  {/* Blurred backdrop background */}
                  <div
                    className="mubasyirat-card__blur-bg"
                    style={{
                      backgroundImage: `url(${dream.imageUrl})`,
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
                    src={dream.imageUrl}
                    alt={dream.title}
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
                  {dream.category && (
                    <span className="category-tag mubasyirat-card__tag" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, background: 'var(--color-secondary)', color: '#1a2e00', fontSize: '0.65rem' }}>
                      {dream.category}
                    </span>
                  )}
                </div>
                <div className="mubasyirat-card__body">
                  <h4 className="mubasyirat-card__title">{dream.title}</h4>
                  {dream.year && <span className="mubasyirat-card__date">Tahun: {dream.year}</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      </div>
    </article>
  );
}

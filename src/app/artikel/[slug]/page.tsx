import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchArticleBySlug, fetchArticles, type Article } from '@/utils/sheetsApi';
import ArticleCard from '@/components/ArticleCard';
import BookmarkButton from '@/components/BookmarkButton';
import BackButton from '@/components/BackButton';
import CommentSection from '@/components/CommentSection';
import ArticleShareActions from '@/components/ArticleShareActions';
import './article.css';

// Helper to extract YouTube video ID from any format of YouTube link
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);

  if (!article) {
    return { title: 'Artikel Tidak Ditemukan' };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url: `https://mqnewstoday.my.id/artikel/${slug}`,
      siteName: 'MQ News Today',
      publishedTime: article.publishDate,
      authors: article.author ? [article.author] : undefined,
      images: article.imageUrl ? [{ url: article.imageUrl, width: 1200, height: 630, alt: article.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.imageUrl ? [article.imageUrl] : undefined,
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const allArticles = await fetchArticles();
  const relatedArticles = allArticles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  // Use the date string directly since it's already in Indonesian format from the spreadsheet
  const formattedDate = article.publishDate || '';

  return (
    <article className="article-page" id="article-detail">
      <div className="container">
        {/* Smart Back Button */}
        <BackButton />

        {/* Breadcrumb */}
        <nav className="breadcrumb" id="breadcrumb" style={{ marginTop: 'var(--space-xs)' }}>
          <Link href="/">Beranda</Link>
          <span className="separator">/</span>
          <Link href={`/kategori/${article.category.toLowerCase()}`}>{article.category}</Link>
          <span className="separator">/</span>
          <span className="current">{article.title.length > 50 ? article.title.slice(0, 50) + '...' : article.title}</span>
        </nav>

        <div className="article-page__layout">
          {/* Main Content */}
          <div className="article-page__main">
            {/* Header */}
            <header className="article-page__header">
              <Link href={`/kategori/${article.category.toLowerCase()}`} className="category-tag">
                {article.category}
              </Link>
              <h1 className="article-page__title">{article.title}</h1>
              <div className="article-page__meta">
                <div className="article-page__meta-left">
                  {article.author && (
                    <div className="article-page__author">
                      <div className="article-page__author-avatar">
                        {article.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="article-page__author-name">{article.author}</span>
                        <time className="article-page__date">{formattedDate}</time>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {article.imageUrl && (
              <div className="article-page__image-wrapper">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="article-page__image"
                  loading="eager"
                />
              </div>
            )}

            {/* YouTube Video Embed */}
            {article.sourceUrl && getYouTubeId(article.sourceUrl) && (
              <div className="article-page__video-wrapper">
                <div className="article-page__video-container">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(article.sourceUrl)}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="article-page__video-iframe"
                  ></iframe>
                </div>
              </div>
            )}

            {/* Audio Player */}
            {article.audioUrl && (
              <div className="article-page__audio">
                <h4 className="article-page__audio-title">Dengarkan Audio Berita</h4>
                <audio controls className="article-page__audio-player" src={article.audioUrl} />
              </div>
            )}

            {/* Content */}
            <div
              className="article-prose"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags / Bottom actions */}
            <div className="article-page__bottom">
              <div className="article-page__tags">
                <Link href={`/kategori/${article.category.toLowerCase()}`} className="sidebar-tag">
                  {article.category}
                </Link>
              </div>
              <div className="article-page__bottom-actions">
                <ArticleShareActions articleId={article.id} title={article.title} />
              </div>
            </div>

            {/* Discussion Comments */}
            <CommentSection itemId={article.id} category="artikel" />
          </div>
          
          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="article-page__related" id="related-articles">
              <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Artikel Terkait</h2>
              <div className="article-page__related-grid">
                {relatedArticles.map((art) => (
                  <Link href={`/artikel/${art.slug}`} className="related-card" key={art.id}>
                    <div className="related-card__image-wrapper">
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        className="related-card__image"
                        loading="lazy"
                      />
                    </div>
                    <div className="related-card__content">
                      <h4 className="related-card__title">{art.title}</h4>
                      <time className="related-card__date">{art.publishDate}</time>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}

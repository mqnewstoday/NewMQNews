import Link from 'next/link';
import type { Article } from '@/utils/sheetsApi';
import './HeroBanner.css';

interface HeroBannerProps {
  article: Article;
  secondaryArticles?: Article[];
}

export default function HeroBanner({ article, secondaryArticles = [] }: HeroBannerProps) {
  const formattedDate = article.publishDate || '';

  return (
    <section className="hero" id="hero-section">
      <div className="container">
        <div className="hero__grid">
          {/* Main Featured Article */}
          <Link href={`/artikel/${article.slug}`} className="hero__main" id="hero-main-article">
            <div className="hero__main-image-wrapper">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="hero__main-image"
                loading="eager"
              />
              <div className="hero__main-overlay" />
              <div className="hero__main-content">
                <span className="category-tag">{article.category}</span>
                <h1 className="hero__main-title">{article.title}</h1>
                <p className="hero__main-excerpt">{article.excerpt}</p>
                <div className="hero__main-meta">
                  {article.author && <span className="hero__author">{article.author}</span>}
                  {formattedDate && (
                    <>
                      <span className="hero__meta-dot">•</span>
                      <time className="hero__date">{formattedDate}</time>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>

          {/* Secondary Articles */}
          {secondaryArticles.length > 0 && (
            <div className="hero__sidebar">
              {secondaryArticles.slice(0, 2).map((art) => (
                <Link
                  key={art.id}
                  href={`/artikel/${art.slug}`}
                  className="hero__side-card"
                >
                  <div className="hero__side-image-wrapper">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="hero__side-image"
                      loading="eager"
                    />
                    <div className="hero__side-overlay" />
                    <div className="hero__side-content">
                      <span className="category-tag">{art.category}</span>
                      <h3 className="hero__side-title">{art.title}</h3>
                      <time className="hero__side-date">
                        {art.publishDate || ''}
                      </time>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

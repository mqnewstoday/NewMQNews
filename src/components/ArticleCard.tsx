import Link from 'next/link';
import type { Article } from '@/utils/sheetsApi';
import BookmarkButton from './BookmarkButton';
import './ArticleCard.css';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'horizontal' | 'compact';
  index?: number;
}

export default function ArticleCard({ article, variant = 'default', index = 0 }: ArticleCardProps) {
  const formattedDate = article.publishDate || '';
  const hasImage = article.imageUrl && !article.imageUrl.includes('picsum.photos');

  if (variant === 'horizontal') {
    return (
      <article
        className="article-card article-card--horizontal"
        style={{ animationDelay: `${index * 80}ms` }}
        id={`article-card-${article.id}`}
      >
        {hasImage && (
          <Link href={`/artikel/${article.slug}`} className="article-card__image-link article-card__image-link--horizontal">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="article-card__image"
              loading="lazy"
            />
          </Link>
        )}
        <div className="article-card__body article-card__body--horizontal">
          <Link href={`/kategori/${article.category.toLowerCase()}`} className="category-tag">
            {article.category}
          </Link>
          <Link href={`/artikel/${article.slug}`}>
            <h3 className="article-card__title article-card__title--horizontal">{article.title}</h3>
          </Link>
          <time className="article-card__date">{formattedDate}</time>
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article
        className="article-card article-card--compact"
        style={{ animationDelay: `${index * 60}ms` }}
        id={`article-card-${article.id}`}
      >
        <span className="article-card__number">{String(index + 1).padStart(2, '0')}</span>
        <div className="article-card__body--compact">
          <Link href={`/kategori/${article.category.toLowerCase()}`} className="category-tag" style={{ fontSize: '0.65rem' }}>
            {article.category}
          </Link>
          <Link href={`/artikel/${article.slug}`}>
            <h4 className="article-card__title--compact">{article.title}</h4>
          </Link>
          <time className="article-card__date" style={{ fontSize: '0.75rem' }}>{formattedDate}</time>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`article-card ${!hasImage ? 'article-card--no-image' : ''}`}
      style={{ animationDelay: `${index * 80}ms` }}
      id={`article-card-${article.id}`}
    >
      {hasImage ? (
        <Link href={`/artikel/${article.slug}`} className="article-card__image-link">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="article-card__image"
            loading="lazy"
          />
          <div className="article-card__image-overlay">
            <span className="category-tag">{article.category}</span>
          </div>
        </Link>
      ) : (
        <div className="article-card__no-image-header">
          <Link href={`/kategori/${article.category.toLowerCase()}`} className="category-tag">
            {article.category}
          </Link>
        </div>
      )}
      <div className="article-card__body">
        <Link href={`/artikel/${article.slug}`}>
          <h3 className="article-card__title">{article.title}</h3>
        </Link>
        <p className="article-card__excerpt">{article.excerpt}</p>
        <div className="article-card__footer">
          <div className="article-card__meta">
            {article.author && <span className="article-card__author">{article.author}</span>}
            <time className="article-card__date">{formattedDate}</time>
          </div>
          <BookmarkButton articleId={article.id} size="small" />
        </div>
      </div>
    </article>
  );
}

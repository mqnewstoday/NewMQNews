import Link from 'next/link';
import type { Article } from '@/utils/sheetsApi';
import ArticleCard from './ArticleCard';
import NewsletterForm from './NewsletterForm';
import './TrendingSidebar.css';

interface TrendingSidebarProps {
  articles: Article[];
}

export default function TrendingSidebar({ articles }: TrendingSidebarProps) {
  const trending = articles.slice(0, 5);

  return (
    <aside className="trending-sidebar" id="trending-sidebar">
      {/* Trending Section */}
      <div className="sidebar-section">
        <h3 className="sidebar-section__title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
          Trending
        </h3>
        <div className="sidebar-section__list">
          {trending.map((article, i) => (
            <ArticleCard key={article.id} article={article} variant="compact" index={i} />
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="sidebar-section sidebar-section--newsletter">
        <div className="newsletter-card">
          <div className="newsletter-card__icon">📬</div>
          <h4 className="newsletter-card__title">Langganan Newsletter</h4>
          <p className="newsletter-card__desc">
            Dapatkan berita terbaru langsung di inbox Anda setiap hari.
          </p>
          <NewsletterForm />
        </div>
      </div>

      {/* Tags */}
      <div className="sidebar-section">
        <h3 className="sidebar-section__title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L13 23" />
            <path d="M9.586 5.586A2 2 0 0 0 9 7v12.8a1 1 0 0 0 .586.953l5.828 2.58a1 1 0 0 0 1.372-.706L18 17" />
            <path d="M2 2h4l2.5 3.5" />
          </svg>
          Topik Populer
        </h3>
        <div className="sidebar-tags">
          {['Geopolitik', 'Eskatologi', 'Mimpi Qasim', 'Timur Tengah', 'Trending', 'Video'].map(
            (tag) => (
              <Link key={tag} href={`/kategori/${tag.toLowerCase()}`} className="sidebar-tag">
                {tag}
              </Link>
            )
          )}
        </div>
      </div>
    </aside>
  );
}

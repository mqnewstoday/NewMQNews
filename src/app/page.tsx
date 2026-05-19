import Link from 'next/link';
import BannerSlider from '@/components/BannerSlider';
import ArticleCard from '@/components/ArticleCard';
import TrendingSidebar from '@/components/TrendingSidebar';
import { fetchBerita, fetchAudio, fetchMubasyirat, fetchBanners } from '@/utils/sheetsApi';
import type { AudioItem, MubasyiratItem } from '@/utils/sheetsApi';
import './page.css';

export default async function HomePage() {
  const articles = await fetchBerita();
  const audioItems = await fetchAudio();
  const mubasyiratItems = await fetchMubasyirat();
  const banners = await fetchBanners();

  const latestArticles = articles;

  return (
    <>
      {/* Main Content & Sidebar Grid */}
      <section className="home-content section" id="berita-terupdate" style={{ paddingTop: 'var(--space-xl)' }}>
        <div className="container">
          <div className="grid-main-sidebar">
            {/* Left Column (News + Audio) */}
            <div>
              {/* Hero Banner Slider (Moved inside left column for stunning grid alignment!) */}
              {banners && banners.length > 0 && (
                <div className="home-hero-banner-wrapper" style={{ marginBottom: 'var(--space-xl)' }}>
                  <BannerSlider banners={banners} />
                </div>
              )}

              {/* Berita Terupdate Section Header */}
              <div className="section-header">
                <h2 className="section-title">Berita Terupdate</h2>
                <Link href="/berita" className="btn btn-outline section-more-btn" id="btn-more-berita">
                  Lainnya
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </div>

              {/* Articles Grid */}
              <div className="grid grid-3 home-articles-grid">
                {latestArticles.slice(0, 6).map((article, i) => (
                  <ArticleCard key={article.id} article={article} index={i} />
                ))}
              </div>

              {/* Koleksi Audio Nested (Right in the flow, compact!) */}
              <div className="home-audio-nested" style={{ marginTop: 'var(--space-xl)' }}>
                <div className="section-header" style={{ marginBottom: 'var(--space-md)' }}>
                  <h2 className="section-title" style={{ fontSize: '1.4rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                    Koleksi Audio
                  </h2>
                  <Link href="/audio" className="btn btn-outline section-more-btn" id="btn-more-audio" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                    Lainnya
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </div>

                <div className="grid grid-2 home-audio-grid" style={{ gap: 'var(--space-md)' }}>
                  {audioItems.slice(0, 5).map((item) => (
                    <AudioCard key={item.id} item={item} />
                  ))}
                  
                  {/* CTA Card to fill the 6th slot */}
                  <div className="audio-card audio-card--cta">
                    <div className="audio-card__cta-content">
                      <div className="audio-card__cta-icon-wrapper">
                        <svg className="audio-card__cta-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M9 18V5l12-2v13" />
                          <circle cx="6" cy="18" r="3" />
                          <circle cx="18" cy="16" r="3" />
                        </svg>
                      </div>
                      <h4 className="audio-card__cta-title">Dengarkan Lebih Banyak</h4>
                      <p className="audio-card__cta-desc">Jelajahi seluruh koleksi rekaman audio penjelasan mimpi Muhammad Qasim.</p>
                      <Link href="/audio" className="btn btn-secondary btn-sm audio-card__cta-btn">
                        Lihat Semua Audio
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '4px', verticalAlign: 'middle' }}>
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <TrendingSidebar articles={articles} />
          </div>
        </div>
      </section>

      {/* Mubasyirat Section */}
      <section className="home-mubasyirat section" id="mubasyirat-section" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Mubasyirat
            </h2>
            <Link href="/mubasyirat" className="btn btn-outline section-more-btn" id="btn-more-mubasyirat">
              Lainnya
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>

          <div className="mubasyirat-grid">
            {mubasyiratItems.slice(0, 4).map((item) => (
              <MubasyiratCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-cta" id="cta-section">
        <div className="container">
          <div className="home-cta__card">
            <div className="home-cta__content">
              <h2 className="home-cta__title">Tetap Update dengan Berita Terkini</h2>
              <p className="home-cta__desc">
                Bergabunglah dengan ribuan pembaca yang mendapatkan berita terbaru langsung di inbox mereka setiap hari.
              </p>
            </div>
            <div className="home-cta__actions">
              <Link href="/bookmark" className="btn btn-secondary btn-lg" id="cta-bookmark">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Simpan Bookmark
              </Link>
              <Link href="/berita" className="btn btn-outline btn-lg" id="cta-explore">
                Jelajahi Semua
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ============================================================
// Audio Card Sub-Component
// ============================================================
function AudioCard({ item }: { item: AudioItem }) {
  return (
    <Link href={`/audio/${item.id}`} className="audio-card" id={`audio-card-${item.id}`}>
      <div className="audio-card__thumb">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="audio-card__image"
          loading="lazy"
        />
        <div className="audio-card__play-overlay">
          <div className="audio-card__play-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      </div>
      <div className="audio-card__body">
        <h4 className="audio-card__title">{item.title}</h4>
        <p className="audio-card__desc">{item.description}</p>
      </div>
    </Link>
  );
}

// ============================================================
// Mubasyirat Card Sub-Component (Square/Instagram ratio)
// ============================================================
function MubasyiratCard({ item }: { item: MubasyiratItem }) {
  return (
    <Link href={`/mubasyirat/${item.id}`} className="mubasyirat-card" id={`mubasyirat-card-${item.id}`}>
      <div className="mubasyirat-card__thumb">
        {/* Blurred backdrop background */}
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
        {/* Actual contain image */}
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
      </div>
      <div className="mubasyirat-card__body">
        <h4 className="mubasyirat-card__title">{item.title}</h4>
        <p className="mubasyirat-card__excerpt">{item.excerpt}</p>
      </div>
    </Link>
  );
}

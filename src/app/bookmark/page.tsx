'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import AudioPlayerList from '@/components/AudioPlayerList';
import type { Article, AudioItem, MubasyiratItem } from '@/utils/sheetsApi';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import './bookmark.css';
import '../mubasyirat/mubasyirat.css';
import '../audio/audio.css';

export default function BookmarkPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'berita' | 'mubasyirat' | 'audio'>('berita');
  const [articles, setArticles] = useState<Article[]>([]);
  const [mubasyirats, setMubasyirats] = useState<MubasyiratItem[]>([]);
  const [audios, setAudios] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllBookmarks() {
      try {
        setLoading(true);

        // Fetch all sheets data (articles, audio, mubasyirat)
        const res = await fetch('/api/sheets?type=all');
        const data = await res.json();

        const allArticles = (data.articles || []) as Article[];
        const allAudio = (data.audio || []) as AudioItem[];
        const allMubasyirat = (data.mubasyirat || []) as MubasyiratItem[];

        let beritaIds: string[] = [];
        let mubasyiratIds: string[] = [];
        let audioIds: string[] = [];

        // Load bookmark IDs (from Firestore if logged in, else LocalStorage)
        if (user) {
          try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const fireData = userSnap.data();
              beritaIds = (fireData.bookmarks || []) as string[];
              mubasyiratIds = (fireData.mubasyirat_bookmarks || []) as string[];
              audioIds = (fireData.audio_bookmarks || []) as string[];

              // Sync back to local storage
              localStorage.setItem('mq_bookmarks', JSON.stringify(beritaIds));
              localStorage.setItem('mq_mubasyirat_bookmarks', JSON.stringify(mubasyiratIds));
              localStorage.setItem('mq_audio_bookmarks', JSON.stringify(audioIds));
            } else {
              beritaIds = JSON.parse(localStorage.getItem('mq_bookmarks') || '[]') as string[];
              mubasyiratIds = JSON.parse(localStorage.getItem('mq_mubasyirat_bookmarks') || '[]') as string[];
              audioIds = JSON.parse(localStorage.getItem('mq_audio_bookmarks') || '[]') as string[];
            }
          } catch (fireErr) {
            console.error("Firestore loading error, falling back to local:", fireErr);
            beritaIds = JSON.parse(localStorage.getItem('mq_bookmarks') || '[]') as string[];
            mubasyiratIds = JSON.parse(localStorage.getItem('mq_mubasyirat_bookmarks') || '[]') as string[];
            audioIds = JSON.parse(localStorage.getItem('mq_audio_bookmarks') || '[]') as string[];
          }
        } else {
          beritaIds = JSON.parse(localStorage.getItem('mq_bookmarks') || '[]') as string[];
          mubasyiratIds = JSON.parse(localStorage.getItem('mq_mubasyirat_bookmarks') || '[]') as string[];
          audioIds = JSON.parse(localStorage.getItem('mq_audio_bookmarks') || '[]') as string[];
        }

        // Filter actual items matching the bookmarks
        const bookmarkedArticles = allArticles.filter(a => beritaIds.includes(a.id));
        const bookmarkedMubasyirat = allMubasyirat.filter(m => mubasyiratIds.includes(m.id));
        const bookmarkedAudio = allAudio.filter(au => audioIds.includes(au.id));

        setArticles(bookmarkedArticles);
        setMubasyirats(bookmarkedMubasyirat);
        setAudios(bookmarkedAudio);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAllBookmarks();
  }, [user]);

  // Helper render for Mubasyirat items
  const renderMubasyiratList = () => (
    <div className="mubasyirat-grid">
      {mubasyirats.map((item) => (
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
  );

  return (
    <div className="bookmark-page container section">
      {/* Smart Back Button */}
      <BackButton />

        <div className="bookmark-page__header" style={{ marginTop: 'var(--space-sm)' }}>
          <div className="bookmark-page__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 className="bookmark-page__title">Bookmark Saya</h1>
          <p className="bookmark-page__desc">
            Koleksi berita, mubasyirat, dan audio yang telah Anda simpan.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bookmark-tabs">
          <button 
            className={`bookmark-tab-btn ${activeTab === 'berita' ? 'bookmark-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('berita')}
          >
            Berita ({articles.length})
          </button>
          <button 
            className={`bookmark-tab-btn ${activeTab === 'mubasyirat' ? 'bookmark-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('mubasyirat')}
          >
            Mubasyirat ({mubasyirats.length})
          </button>
          <button 
            className={`bookmark-tab-btn ${activeTab === 'audio' ? 'bookmark-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('audio')}
          >
            Audio ({audios.length})
          </button>
        </div>

        {loading ? (
          <div className="bookmark-page__loading">
            <div className="grid grid-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="skeleton-card">
                  <div className="skeleton" style={{ height: '200px' }} />
                  <div style={{ padding: '16px' }}>
                    <div className="skeleton" style={{ height: '16px', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ height: '14px', width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bookmark-tab-content">
            {activeTab === 'berita' && (
              articles.length > 0 ? (
                <div className="grid grid-3">
                  {articles.map((article, i) => (
                    <ArticleCard key={article.id} article={article} index={i} />
                  ))}
                </div>
              ) : (
                <div className="bookmark-page__empty">
                  <div className="bookmark-page__empty-icon">📰</div>
                  <h3>Belum Ada Berita Tersimpan</h3>
                  <p>
                    Anda belum menyimpan berita apapun. Klik tombol bookmark pada berita untuk menyimpannya di sini.
                  </p>
                  <Link href="/berita" className="btn btn-primary">
                    Jelajahi Berita
                  </Link>
                </div>
              )
            )}

            {activeTab === 'mubasyirat' && (
              mubasyirats.length > 0 ? (
                renderMubasyiratList()
              ) : (
                <div className="bookmark-page__empty">
                  <div className="bookmark-page__empty-icon">🌙</div>
                  <h3>Belum Ada Mubasyirat Tersimpan</h3>
                  <p>
                    Anda belum menyimpan mimpi mubasyirat apapun. Simpan mimpi-mimpi mubasyirat favorit Anda untuk dibaca lagi nanti.
                  </p>
                  <Link href="/mubasyirat" className="btn btn-primary">
                    Jelajahi Mubasyirat
                  </Link>
                </div>
              )
            )}

            {activeTab === 'audio' && (
              audios.length > 0 ? (
                <AudioPlayerList items={audios} />
              ) : (
                <div className="bookmark-page__empty">
                  <div className="bookmark-page__empty-icon">🎧</div>
                  <h3>Belum Ada Audio Tersimpan</h3>
                  <p>
                    Anda belum menyimpan audio ceramah/penjelasan apapun. Klik tombol simpan pada halaman pemutar audio untuk menyimpannya.
                  </p>
                  <Link href="/audio" className="btn btn-primary">
                    Jelajahi Audio
                  </Link>
                </div>
              )
            )}
          </div>
        )}
    </div>
  );
}

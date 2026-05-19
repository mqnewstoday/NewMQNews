'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import ArticleCard from '@/components/ArticleCard';
import type { Article, AudioItem, MubasyiratItem } from '@/utils/sheetsApi';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

  // Deletion Confirmation & Toast States
  const [toastMessage, setToastMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'clear-tab' | 'clear-all';
    targetType?: 'berita' | 'mubasyirat' | 'audio';
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

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

  // Remove individual item
  const removeBookmark = async (id: string, type: 'berita' | 'mubasyirat' | 'audio') => {
    let key = '';
    let firestoreField = '';
    
    if (type === 'berita') {
      key = 'mq_bookmarks';
      firestoreField = 'bookmarks';
    } else if (type === 'mubasyirat') {
      key = 'mq_mubasyirat_bookmarks';
      firestoreField = 'mubasyirat_bookmarks';
    } else {
      key = 'mq_audio_bookmarks';
      firestoreField = 'audio_bookmarks';
    }

    try {
      const local = JSON.parse(localStorage.getItem(key) || '[]') as string[];
      const updated = local.filter(itemId => itemId !== id);
      localStorage.setItem(key, JSON.stringify(updated));

      if (type === 'berita') {
        setArticles(prev => prev.filter(item => item.id !== id));
      } else if (type === 'mubasyirat') {
        setMubasyirats(prev => prev.filter(item => item.id !== id));
      } else {
        setAudios(prev => prev.filter(item => item.id !== id));
      }

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { [firestoreField]: updated }, { merge: true });
      }
      
      triggerToast('Item berhasil dihapus dari bookmark');
    } catch (error) {
      console.error('Error removing bookmark:', error);
      triggerToast('Gagal menghapus bookmark');
    }
  };

  // Trigger modal confirmation
  const triggerConfirm = (type: 'clear-tab' | 'clear-all', targetType?: 'berita' | 'mubasyirat' | 'audio') => {
    setConfirmAction({ type, targetType });
    setShowConfirmModal(true);
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    document.body.style.overflow = '';
  };

  // Process bulk deletion
  const handleBulkDelete = async () => {
    if (!confirmAction) return;

    const { type, targetType } = confirmAction;

    if (type === 'clear-tab' && targetType) {
      let key = '';
      let firestoreField = '';
      let label = '';
      
      if (targetType === 'berita') {
        key = 'mq_bookmarks';
        firestoreField = 'bookmarks';
        label = 'Semua Berita';
      } else if (targetType === 'mubasyirat') {
        key = 'mq_mubasyirat_bookmarks';
        firestoreField = 'mubasyirat_bookmarks';
        label = 'Semua Mubasyirat';
      } else {
        key = 'mq_audio_bookmarks';
        firestoreField = 'audio_bookmarks';
        label = 'Semua Audio';
      }

      try {
        localStorage.setItem(key, JSON.stringify([]));

        if (targetType === 'berita') {
          setArticles([]);
        } else if (targetType === 'mubasyirat') {
          setMubasyirats([]);
        } else {
          setAudios([]);
        }

        if (user) {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, { [firestoreField]: [] }, { merge: true });
        }
        
        triggerToast(`${label} berhasil dibersihkan`);
      } catch (error) {
        console.error('Error clearing tab bookmarks:', error);
        triggerToast('Gagal membersihkan bookmark');
      }
    } else if (type === 'clear-all') {
      try {
        localStorage.setItem('mq_bookmarks', JSON.stringify([]));
        localStorage.setItem('mq_mubasyirat_bookmarks', JSON.stringify([]));
        localStorage.setItem('mq_audio_bookmarks', JSON.stringify([]));

        setArticles([]);
        setMubasyirats([]);
        setAudios([]);

        if (user) {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, {
            bookmarks: [],
            mubasyirat_bookmarks: [],
            audio_bookmarks: []
          }, { merge: true });
        }
        
        triggerToast('Seluruh riwayat bookmark berhasil dibersihkan');
      } catch (error) {
        console.error('Error clearing all bookmarks:', error);
        triggerToast('Gagal membersihkan seluruh bookmark');
      }
    }

    closeConfirmModal();
  };

  // Helper render for Mubasyirat items with individual delete button
  const renderMubasyiratList = () => (
    <div className="mubasyirat-grid">
      {mubasyirats.map((item) => (
        <div key={item.id} className="bookmark-item-wrapper" style={{ position: 'relative' }}>
          <Link href={`/mubasyirat/${item.id}`} className="mubasyirat-card" id={`mubasyirat-card-${item.id}`}>
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
          <button 
            className="bookmark-delete-btn" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              removeBookmark(item.id, 'mubasyirat');
            }}
            title="Hapus dari Bookmark"
            aria-label="Hapus dari Bookmark"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bookmark-page container section">
      {/* Smart Back Button */}
      <BackButton />

      <div className="bookmark-page__header" style={{ marginTop: 'var(--space-sm)' }}>
        <h1 className="bookmark-page__title">Bookmark Saya</h1>
        <p className="bookmark-page__desc">
          Koleksi berita, mubasyirat, dan audio yang telah Anda simpan.
        </p>
      </div>

      {/* Bulk Actions Dashboard */}
      <div className="bookmark-dashboard">
        <div className="bookmark-dashboard__stats">
          <span className="bookmark-dashboard__badge">
            <span className="bookmark-dashboard__badge-dot"></span>
            Total: <strong>{articles.length + mubasyirats.length + audios.length}</strong> item tersimpan
          </span>
        </div>
        <div className="bookmark-dashboard__actions">
          {(articles.length > 0 || mubasyirats.length > 0 || audios.length > 0) && (
            <button 
              className="btn btn-outline bookmark-btn-bulk bookmark-btn-bulk--danger"
              onClick={() => triggerConfirm('clear-all')}
              title="Kosongkan Seluruh Riwayat Bookmark"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
              </svg>
              Bersihkan Semua
            </button>
          )}
          {activeTab === 'berita' && articles.length > 0 && (
            <button 
              className="btn btn-outline bookmark-btn-bulk"
              onClick={() => triggerConfirm('clear-tab', 'berita')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              Hapus Semua Berita
            </button>
          )}
          {activeTab === 'mubasyirat' && mubasyirats.length > 0 && (
            <button 
              className="btn btn-outline bookmark-btn-bulk"
              onClick={() => triggerConfirm('clear-tab', 'mubasyirat')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              Hapus Semua Mubasyirat
            </button>
          )}
          {activeTab === 'audio' && audios.length > 0 && (
            <button 
              className="btn btn-outline bookmark-btn-bulk"
              onClick={() => triggerConfirm('clear-tab', 'audio')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              Hapus Semua Audio
            </button>
          )}
        </div>
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
                  <div key={article.id} className="bookmark-item-wrapper" style={{ position: 'relative' }}>
                    <ArticleCard article={article} index={i} />
                    <button 
                      className="bookmark-delete-btn" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeBookmark(article.id, 'berita');
                      }}
                      title="Hapus dari Bookmark"
                      aria-label="Hapus dari Bookmark"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
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
              <div className="audio-list-grid">
                {audios.map((item) => (
                  <div key={item.id} className="bookmark-item-wrapper" style={{ position: 'relative' }}>
                    <Link href={`/audio/${item.id}`} className="audio-player-card" id={`audio-player-${item.id}`}>
                      <div className="audio-player-card__thumb">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="audio-player-card__img"
                          loading="lazy"
                        />
                        <div className="audio-player-card__play-btn-overlay">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      </div>
                      <div className="audio-player-card__content">
                        <div>
                          <h3 className="audio-player-card__title" title={item.title}>{item.title}</h3>
                          <p className="audio-player-card__desc">{item.description}</p>
                        </div>
                        <span className="btn btn-outline btn-sm audio-player-card__action-btn" style={{ alignSelf: 'flex-start', padding: '6px 14px', fontSize: '0.78rem', marginTop: 'var(--space-xs)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                          Dengarkan
                        </span>
                      </div>
                    </Link>
                    <button 
                      className="bookmark-delete-btn" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeBookmark(item.id, 'audio');
                      }}
                      title="Hapus dari Bookmark"
                      aria-label="Hapus dari Bookmark"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
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

      {/* Confirmation Modal Portal */}
      {showConfirmModal && mounted && createPortal(
        <div className="custom-dialog-overlay" onClick={closeConfirmModal}>
          <div className="custom-dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="custom-dialog-icon custom-dialog-icon--warning">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </div>
            <h2 className="custom-dialog-title">
              {confirmAction?.type === 'clear-all' ? 'Kosongkan Semua Bookmark?' : `Hapus Semua ${confirmAction?.targetType === 'berita' ? 'Berita' : confirmAction?.targetType === 'mubasyirat' ? 'Mubasyirat' : 'Audio'}?`}
            </h2>
            <p className="custom-dialog-message">
              {confirmAction?.type === 'clear-all' 
                ? 'Tindakan ini akan menghapus seluruh riwayat bookmark Anda dari semua kategori secara permanen. Anda tidak dapat membatalkan tindakan ini.'
                : `Apakah Anda yakin ingin menghapus seluruh riwayat bookmark kategori ini? Tindakan ini tidak dapat dibatalkan.`
              }
            </p>
            <div className="custom-dialog-actions">
              <button className="custom-dialog-btn custom-dialog-btn--cancel" onClick={closeConfirmModal}>
                Batal
              </button>
              <button className="custom-dialog-btn custom-dialog-btn--confirm" onClick={handleBulkDelete}>
                Ya, Hapus Semua
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Alert Box */}
      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import './notifikasi.css';

interface NotificationItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  category: string;
  imageUrl?: string;
}

export default function NotifikasiPage() {
  const { user, loading: authLoading } = useAuth();
  const [permission, setPermission] = useState<string>('default'); // 'default', 'granted', 'denied', 'unsupported'
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [feedItems, setFeedItems] = useState<NotificationItem[]>([]);
  const [feedLoading, setFeedLoading] = useState<boolean>(true);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // 1. Initialize Notification Permission & Load OneSignal SDK
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!('Notification' in window)) {
        setPermission('unsupported');
        return;
      }

      setPermission(Notification.permission);
      
      const savedPref = localStorage.getItem('push_subscribed_pref');
      if (savedPref !== null) {
        setIsSubscribed(savedPref === 'true');
      } else {
        setIsSubscribed(Notification.permission === 'granted');
      }

      // Load OneSignal Script dynamically if supported
      try {
        if (!document.getElementById('onesignal-sdk-script')) {
          const script = document.createElement('script');
          script.id = 'onesignal-sdk-script';
          script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
          script.defer = true;
          script.onload = () => {
            // Initialize OneSignal Client Instance
            (window as any).OneSignal = (window as any).OneSignal || [];
            (window as any).OneSignal.push(() => {
              (window as any).OneSignal.init({
                appId: '542c9bb4-d7e3-4938-b453-cf7ad6bef22c',
                safari_web_id: '',
                notifyButton: {
                  enable: false,
                },
              });

              // Hook status changes
              (window as any).OneSignal.Notifications.addEventListener('permissionChange', (permissionResult: any) => {
                const currentPerm = permissionResult ? 'granted' : 'default';
                setPermission(currentPerm);
                setIsSubscribed(currentPerm === 'granted');
              });
            });
          };
          document.head.appendChild(script);
        }
      } catch (err) {
        console.error('Error loading OneSignal SDK:', err);
      }
    }
  }, []);

  // 2. Fetch Live Published Articles from Spreadsheet to render history feed
  const fetchLiveFeed = async (showToast = false) => {
    if (showToast) {
      setFeedLoading(true);
    }
    try {
      const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTOAltvE7tpJsTkKbqMoqLZe-7K9cGk_uPUqeigV7qvWUm5crdAiOJ_hNAvchnjNrE8cA0F-ybuZhKd/pub?gid=1630354903&single=true&output=csv';
      const res = await fetch(SHEET_URL);
      if (!res.ok) throw new Error('Network response not ok');
      const csvText = await res.text();
      
      // Robust quote-aware and multiline-aware CSV parser
      const rows: string[][] = [];
      let currentRow: string[] = [];
      let currentCell = '';
      let inQuotes = false;
      
      for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];
        
        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Escaped double quote inside double quotes ("") -> append single double quote
            currentCell += '"';
            i++; // Skip the next quote character
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // End of cell
          currentRow.push(currentCell);
          currentCell = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
          // End of row
          if (char === '\r' && nextChar === '\n') {
            i++; // Skip \n
          }
          currentRow.push(currentCell);
          rows.push(currentRow);
          currentRow = [];
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
      // Push the last cell/row if any
      if (currentCell !== '' || currentRow.length > 0) {
        currentRow.push(currentCell);
        rows.push(currentRow);
      }

      if (rows.length < 2) throw new Error('Data empty');

      const headers = rows[0]?.map(h => (h || '').trim().toLowerCase()) || [];
      const judulIdx = headers.indexOf('judul');
      const tglIdx = headers.indexOf('timestamp');
      const pesanIdx = headers.indexOf('pesan');
      const imgIdx = headers.indexOf('link gambar');
      const linkIdx = headers.indexOf('link berita');
      const statusIdx = headers.indexOf('status');

      const items: NotificationItem[] = [];
      
      // Reverse array to show newest articles first, take up to 10 items
      for (let i = rows.length - 1; i > 0; i--) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        // HANYA tampilkan notifikasi yang statusnya "TERKIRIM"
        const status = (statusIdx >= 0 && row[statusIdx] ? row[statusIdx] : '').trim().toUpperCase();
        if (status !== 'TERKIRIM') continue;

        const title = (judulIdx >= 0 && row[judulIdx] ? row[judulIdx] : '').trim();
        if (!title) continue;

        const rawDate = (tglIdx >= 0 && row[tglIdx] ? row[tglIdx] : '').trim();
        const pesan = (pesanIdx >= 0 && row[pesanIdx] ? row[pesanIdx] : '').trim();
        const imageUrl = (imgIdx >= 0 && row[imgIdx] ? row[imgIdx] : '').trim();
        const linkBerita = (linkIdx >= 0 && row[linkIdx] ? row[linkIdx] : '').trim();
        
        // Parsing URL berita untuk redirect internal/eksternal
        let slug = '/';
        if (linkBerita) {
          try {
            if (linkBerita.startsWith('/') || linkBerita.startsWith('http')) {
              if (linkBerita.includes('mqnewstoday.my.id')) {
                const urlObj = new URL(linkBerita);
                slug = urlObj.pathname + urlObj.search;
              } else {
                slug = linkBerita;
              }
            } else {
              slug = linkBerita;
            }
          } catch (e) {
            slug = linkBerita;
          }
        }

        items.push({
          id: String(i),
          title,
          excerpt: pesan,
          date: rawDate || new Date().toLocaleDateString('id-ID'),
          slug,
          category: 'Pengumuman',
          imageUrl
        });

        if (items.length >= 10) break;
      }

      setFeedItems(items);
      if (showToast) triggerToast('Riwayat siaran berita berhasil diperbarui.');
    } catch (err) {
      console.error('Error parsing live notification CSV:', err);
      // Fallback to beautiful mock history if spreadsheet fails
      setFeedItems(getMockNotifications());
      if (showToast) triggerToast('Gagal memperbarui, menggunakan data cadangan.');
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveFeed();
  }, []);

  // 3. Load Deleted IDs from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDeleted = localStorage.getItem('deleted_notifications');
      if (savedDeleted) {
        try {
          setDeletedIds(JSON.parse(savedDeleted));
        } catch (e) {
          console.error('Error loading deleted notification IDs:', e);
        }
      }
    }
  }, []);

  // 4. Subscription Toggle Handler
  const handleSubscriptionToggle = async () => {
    if (!user) {
      triggerToast('Silakan login terlebih dahulu untuk menyetel langganan.');
      return;
    }

    if (permission === 'unsupported') {
      triggerToast('Pemberitahuan Push tidak didukung oleh browser ini.');
      return;
    }

    const nextState = !isSubscribed;
    setIsSubscribed(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('push_subscribed_pref', String(nextState));
    }

    try {
      if (nextState) {
        // Request actual permission in background when turning ON
        if (typeof window !== 'undefined') {
          const OS = (window as any).OneSignal;
          if (OS && OS.push) {
            OS.push(async () => {
              try {
                await OS.Notifications.requestPermission();
                const currentPerm = Notification.permission;
                setPermission(currentPerm);
              } catch (e) {
                console.error(e);
              }
            });
          } else {
            try {
              const res = await Notification.requestPermission();
              setPermission(res);
            } catch (e) {
              console.error(e);
            }
          }
        }
        triggerToast('Selamat! Notifikasi web push berhasil diaktifkan.');
      } else {
        // Turning OFF: Notify user preference saved successfully
        triggerToast('Pemberitahuan push dinonaktifkan.');
      }
    } catch (err) {
      console.error('Error toggling push permission:', err);
    }
  };

  // 5. Delete and Restore actions
  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = [...deletedIds, id];
    setDeletedIds(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('deleted_notifications', JSON.stringify(updated));
    }
    triggerToast('Riwayat berita berhasil dihapus.');
  };

  const handleClearAll = () => {
    const allIds = feedItems.map(item => item.id);
    const updated = Array.from(new Set([...deletedIds, ...allIds]));
    setDeletedIds(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('deleted_notifications', JSON.stringify(updated));
    }
    triggerToast('Semua riwayat siaran berhasil dihapus.');
  };

  const handleRestoreHistory = () => {
    setDeletedIds([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('deleted_notifications');
    }
    triggerToast('Semua riwayat berhasil dipulihkan.');
  };

  // Filter visible items
  const visibleFeedItems = feedItems.filter(item => !deletedIds.includes(item.id));

  return (
    <div className="notif-page container section">
      {/* Smart Back Button */}
      <BackButton />

      <div className="notif-container">
          
          {/* Main Control Subscription Card */}
          <div className="notif-card animate-fade-in-up">
            <h2 className="notif-header">
              <span className="bell-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </span>
              Pemberitahuan Berita Baru
            </h2>
            <p className="notif-subtitle">
              Aktifkan izin notifikasi web push untuk menerima info kilat secara langsung di layar perangkat Anda saat artikel kebenaran diterbitkan.
            </p>

            <div className="sub-control-panel">
              <div className="sub-info">
                <div className="sub-title">
                  <span>Status Langganan</span>
                  
                  {!user ? (
                    <span className="status-badge status-badge--inactive" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>Terkunci</span>
                  ) : (
                    <>
                      {permission === 'granted' && (
                        <span className="status-badge status-badge--active">Aktif</span>
                      )}
                      {permission === 'default' && (
                        <span className="status-badge status-badge--inactive">Tidak Aktif</span>
                      )}
                      {permission === 'denied' && (
                        <span className="status-badge status-badge--blocked">Diblokir</span>
                      )}
                      {permission === 'unsupported' && (
                        <span className="status-badge status-badge--blocked">Tidak Didukung</span>
                      )}
                    </>
                  )}
                </div>
                <span className="sub-desc">
                  {!user ? (
                    'Fitur pengelolaan langganan notifikasi web push hanya tersedia bagi pengguna yang telah masuk (login).'
                  ) : permission === 'granted' ? (
                    'Anda terdaftar. Browser akan memproses siaran berita MQ News Today.'
                  ) : permission === 'denied' ? (
                    'Izin notifikasi diblokir oleh browser. Ketuk ikon gembok pada bilah alamat untuk menyetel izin kembali.'
                  ) : (
                    'Pemberitahuan dinonaktifkan secara default. Nyalakan tombol disamping untuk berlangganan.'
                  )}
                </span>
              </div>

              {/* Slide Switch Button */}
              <label className={`switch ${!user ? 'switch--disabled' : ''}`}>
                <input 
                  type="checkbox"
                  checked={user ? isSubscribed : false}
                  onChange={handleSubscriptionToggle}
                  disabled={!user || permission === 'unsupported' || authLoading}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Login Notice Banner for Guest Users */}
            {!user && !authLoading && (
              <div className="login-notice-box animate-fade-in-up">
                <div className="login-notice-info">
                  <span className="lock-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <div className="login-notice-texts">
                    <span className="login-notice-title">Kelola Langganan Terkunci</span>
                    <span className="login-notice-desc">
                      Anda belum masuk ke akun. Silakan login terlebih dahulu agar dapat mengaktifkan atau menonaktifkan fitur pemberitahuan push.
                    </span>
                  </div>
                </div>
                <Link href="/login" className="login-action-btn">
                  Masuk Sekarang
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {/* Historical Notifications Feed (Derived from actual articles) */}
          <div className="notif-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="feed-header-container">
              <h3 className="feed-header" style={{ marginBottom: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 8v4l3 3" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Riwayat Siaran Berita
              </h3>
              
              <div className="feed-actions">
                <button 
                  type="button" 
                  className="feed-action-btn refresh-btn" 
                  onClick={() => fetchLiveFeed(true)}
                  disabled={feedLoading}
                  title="Segarkan Riwayat"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={feedLoading ? 'animate-spin' : ''}>
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  <span>Segarkan</span>
                </button>
                {visibleFeedItems.length > 0 && (
                  <button 
                    type="button" 
                    className="feed-action-btn delete-btn" 
                    onClick={handleClearAll}
                    title="Bersihkan Semua Riwayat"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                    <span>Hapus Semua</span>
                  </button>
                )}
              </div>
            </div>
            
            {feedLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                {[1, 2, 3].map((n) => (
                  <div key={n} className="skeleton" style={{ height: '70px', width: '100%', borderRadius: 'var(--radius-md)' }}></div>
                ))}
              </div>
            ) : visibleFeedItems.length > 0 ? (
              <div className="feed-list" style={{ marginTop: 'var(--space-md)' }}>
                {visibleFeedItems.map((item) => {
                  const targetHref = (item.slug.startsWith('/') || item.slug.startsWith('http'))
                    ? item.slug
                    : `/artikel/${item.slug}`;
                  
                  return (
                    <div key={item.id} className="feed-item-wrapper">
                      <Link href={targetHref} className="feed-item">
                        <div className="feed-item-icon">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt="" 
                              className="feed-item-thumb" 
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: 'var(--radius-sm)', 
                                objectFit: 'cover' 
                              }} 
                            />
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                          )}
                        </div>
                        <div className="feed-item-content">
                          <span className="feed-item-title">{item.title}</span>
                          <span className="feed-item-desc">{item.excerpt}</span>
                          <div className="feed-item-meta">
                            <span style={{ color: 'var(--color-primary)' }}>{item.category}</span>
                            <span>•</span>
                            <span>{item.date}</span>
                          </div>
                        </div>
                        <div className="feed-item-arrow">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </div>
                      </Link>
                      <button 
                        type="button" 
                        className="feed-item-delete" 
                        onClick={(e) => handleDeleteItem(e, item.id)}
                        title="Hapus dari Riwayat"
                        aria-label="Hapus item riwayat"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="feed-empty" style={{ marginTop: 'var(--space-md)' }}>
                <div className="feed-empty-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-xs)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <p style={{ margin: 0 }}>Belum ada riwayat siaran berita yang tercatat atau Anda telah menghapusnya.</p>
                  {deletedIds.length > 0 && (
                    <button 
                      type="button" 
                      className="restore-history-btn" 
                      onClick={handleRestoreHistory}
                      style={{ 
                        marginTop: 'var(--space-md)', 
                        background: 'transparent', 
                        border: '1px solid var(--color-primary)', 
                        color: 'var(--color-primary)', 
                        padding: '6px 16px', 
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '0.8rem', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        transition: 'all var(--transition-base)'
                      }}
                    >
                      Pulihkan Semua Riwayat ({deletedIds.length})
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Global Notification Toast */}
      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

// Fallback dynamic feed mock data if sheet parsing triggers an error
function getMockNotifications(): NotificationItem[] {
  return [
    {
      id: 'mock_1',
      title: 'Aliansi Tiga Negara dan Nubuat Akhir Zaman: Membaca Manuver Turki, Arab Saudi, dan Pakistan',
      excerpt: 'Panggung geopolitik dunia dikejutkan oleh wacana pembentukan pakta pertahanan militer antara tiga negara kuat...',
      date: '18 Mei 2026',
      slug: 'aliansi-tiga-negara-nubuat-akhir-zaman',
      category: 'Geopolitik'
    },
    {
      id: 'mock_2',
      title: 'Karpet Merah Netanyahu untuk Modi di Israel, Bukti Nyata Skenario Akhir Zaman',
      excerpt: 'Karpet merah digelar, pelukan hangat dipertontonkan di hadapan kamera dunia. Analisis hubungan bilateral India-Israel...',
      date: '17 Mei 2026',
      slug: 'karpet-merah-netanyahu-modi-israel',
      category: 'Timur Tengah'
    },
    {
      id: 'mock_3',
      title: 'Kabul Dibombardir, Api Perang Menyala di Perbatasan Pakistan-Afghanistan',
      excerpt: 'Tensi geopolitik Asia Selatan baru saja meledak ke titik yang paling mengkhawatirkan dengan bombardir di Kabul...',
      date: '16 Mei 2026',
      slug: 'kabul-dibombardir-api-perang-pakistan-afghanistan',
      category: 'Geopolitik'
    }
  ];
}

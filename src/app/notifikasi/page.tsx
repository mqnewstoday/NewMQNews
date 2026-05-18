'use client';

import { useState, useEffect } from 'react';
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import './notifikasi.css';

interface NotificationItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  category: string;
}

export default function NotifikasiPage() {
  const [permission, setPermission] = useState<string>('default'); // 'default', 'granted', 'denied', 'unsupported'
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [feedItems, setFeedItems] = useState<NotificationItem[]>([]);
  const [feedLoading, setFeedLoading] = useState<boolean>(true);
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
      setIsSubscribed(Notification.permission === 'granted');

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
                appId: '8f51a44e-1282-45e0-b6ab-e1293fb8e29a', // Placeholder ID
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
  useEffect(() => {
    const fetchLiveFeed = async () => {
      try {
        const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTOAltvE7tpJsTkKbqMoqLZe-7K9cGk_uPUqeigV7qvWUm5crdAiOJ_hNAvchnjNrE8cA0F-ybuZhKd/pub?gid=0&single=true&output=csv';
        const res = await fetch(SHEET_URL);
        if (!res.ok) throw new Error('Network response not ok');
        const csvText = await res.text();
        
        // Simple CSV row parser
        const rows = csvText.split(/\r?\n/).map(row => {
          // Splitting by comma handling basic quotes
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current);
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current);
          return result;
        });

        if (rows.length < 2) throw new Error('Data empty');

        const headers = rows[0].map(h => h.trim().toLowerCase());
        const judulIdx = headers.indexOf('judul');
        const tglIdx = headers.indexOf('tanggal');
        const isiIdx = headers.indexOf('isi');
        const katIdx = headers.indexOf('kategori');

        const items: NotificationItem[] = [];
        
        // Reverse array to show newest articles first, take up to 5 items
        for (let i = rows.length - 1; i > 0; i--) {
          const row = rows[i];
          const title = (judulIdx >= 0 ? row[judulIdx] : '').trim();
          if (!title || title.length < 5) continue;

          const rawDate = (tglIdx >= 0 ? row[tglIdx] : '').trim();
          const isi = (isiIdx >= 0 ? row[isiIdx] : '').trim();
          const category = (katIdx >= 0 ? row[katIdx] : 'Geopolitik').trim().split(',')[0];
          
          // Generate simple slug matching Next.js slugs
          const slug = title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 80)
            .replace(/^-+|-+$/g, '');

          // Strip HTML tags for feed excerpt
          const excerpt = isi
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .substring(0, 110)
            .trim() + '...';

          items.push({
            id: String(i),
            title,
            excerpt,
            date: rawDate || new Date().toLocaleDateString('id-ID'),
            slug,
            category
          });

          if (items.length >= 5) break;
        }

        setFeedItems(items);
      } catch (err) {
        console.error('Error parsing live notification CSV:', err);
        // Fallback to beautiful mock history if spreadsheet fails
        setFeedItems(getMockNotifications());
      } finally {
        setFeedLoading(false);
      }
    };

    fetchLiveFeed();
  }, []);

  // 3. Subscription Toggle Handler
  const handleSubscriptionToggle = async () => {
    if (permission === 'unsupported') {
      triggerToast('Pemberitahuan Push tidak didukung oleh browser ini.');
      return;
    }

    if (permission === 'denied') {
      triggerToast('Akses pemberitahuan diblokir. Harap aktifkan izin di pengaturan browser Anda.');
      return;
    }

    try {
      if (!isSubscribed) {
        // Request Permission
        if (typeof window !== 'undefined') {
          // Trigger OneSignal Prompt
          const OS = (window as any).OneSignal;
          if (OS && OS.push) {
            OS.push(async () => {
              await OS.Notifications.requestPermission();
              const currentPerm = Notification.permission;
              setPermission(currentPerm);
              setIsSubscribed(currentPerm === 'granted');
              if (currentPerm === 'granted') {
                triggerToast('Selamat! Notifikasi web push berhasil diaktifkan.');
              }
            });
          } else {
            // Fallback request
            const res = await Notification.requestPermission();
            setPermission(res);
            setIsSubscribed(res === 'granted');
            if (res === 'granted') {
              triggerToast('Selamat! Notifikasi web push berhasil diaktifkan.');
            }
          }
        }
      } else {
        // Opt Out OneSignal or inform user to manage via browser settings
        if (typeof window !== 'undefined') {
          const OS = (window as any).OneSignal;
          if (OS) {
            OS.push(() => {
              triggerToast('Pengaturan notifikasi dapat diubah melalui ikon gembok pada browser Anda.');
            });
          }
        }
      }
    } catch (err) {
      console.error('Error toggling push permission:', err);
    }
  };

  // Google Apps Script code payload to display
  const googleAppsScriptCode = `// ============================================================
// GOOGLE APPS SCRIPT: TRIGGER NOTIFIKASI ONESIGNAL DARI SPREADSHEET
// ============================================================
// Cara Pasang:
// 1. Buka Google Sheet tempat artikel MQ News Today disimpan.
// 2. Klik menu "Ekstensi" > "Apps Script".
// 3. Hapus semua kode default, salin dan tempel seluruh kode di bawah ini.
// 4. Ubah nilai ONESIGNAL_APP_ID dan ONESIGNAL_REST_KEY dengan milik Anda.
// 5. Simpan proyek dengan menekan tombol simpan (ikon disket).
// 6. Buat kolom baru "Status Notifikasi" di spreadsheet Anda (misal kolom ke-11).
// 7. Ketik "KIRIM" pada kolom tersebut untuk menyiarkan berita secara real-time!

function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var range = e.range;
  
  // Parameter Konfigurasi (Sesuaikan):
  var SHEET_NAME = "Berita";              // Nama sheet artikel Anda
  var TRIGGER_COLUMN = 11;                // Nomor kolom trigger (Kolom K = 11)
  var ONESIGNAL_APP_ID = "YOUR_ONESIGNAL_APP_ID";
  var ONESIGNAL_REST_KEY = "YOUR_ONESIGNAL_REST_API_KEY";
  
  // Pastikan perubahan terjadi pada sheet dan kolom trigger yang tepat (bukan baris judul)
  if (sheet.getName() === SHEET_NAME && range.getColumn() === TRIGGER_COLUMN && range.getRow() > 1) {
    var status = range.getValue().toString().trim().toUpperCase();
    
    if (status === "KIRIM") {
      var row = range.getRow();
      
      // Ambil data artikel dari kolom baris tersebut (Sesuaikan dengan urutan kolom Anda):
      var judul = sheet.getRange(row, 1).getValue().toString().trim(); // Kolom A (Judul)
      var ringkasan = sheet.getRange(row, 4).getValue().toString().trim(); // Kolom D (Isi Berita)
      var gambar = sheet.getRange(row, 5).getValue().toString().trim(); // Kolom E (Tautan Gambar)
      
      // Bersihkan teks ringkasan dari tag HTML & batasi panjang teks
      ringkasan = ringkasan.replace(/<[^>]+>/g, '').substring(0, 150) + "...";
      
      // Buat slug otomatis agar selaras dengan routing halaman artikel Next.js
      var slug = slugify(judul);
      var linkUrl = "https://mqnewstoday.my.id/artikel/" + slug;
      
      // Persiapkan Payload API OneSignal
      var payload = {
        "app_id": ONESIGNAL_APP_ID,
        "included_segments": ["All"],
        "headings": {"en": judul},
        "contents": {"en": ringkasan},
        "url": linkUrl
      };
      
      // Tambahkan gambar jika tersedia
      if (gambar && gambar.startsWith("http")) {
        payload["chrome_web_image"] = gambar;
        payload["big_picture"] = gambar;
      }
      
      var options = {
        "method": "post",
        "contentType": "application/json",
        "headers": {
          "Authorization": "Basic " + ONESIGNAL_REST_KEY
        },
        "payload": JSON.stringify(payload),
        "muteHttpExceptions": true
      };
      
      // Kirim permintaan HTTP POST ke REST API OneSignal
      try {
        var response = UrlFetchApp.fetch("https://onesignal.com/api/v1/notifications", options);
        var resText = response.getContentText();
        var resData = JSON.parse(resText);
        
        if (resData.id) {
          // Ubah status cell menjadi "TERKIRIM" sebagai indikator sukses
          sheet.getRange(row, TRIGGER_COLUMN).setValue("TERKIRIM");
          SpreadsheetApp.getUi().alert("Sukses! Notifikasi OneSignal berhasil disiarkan.");
        } else {
          sheet.getRange(row, TRIGGER_COLUMN).setValue("GAGAL");
          SpreadsheetApp.getUi().alert("Gagal menyiarkan! Respon OneSignal: " + resText);
        }
      } catch (err) {
        sheet.getRange(row, TRIGGER_COLUMN).setValue("ERROR");
        SpreadsheetApp.getUi().alert("Kesalahan koneksi internet: " + err.toString());
      }
    }
  }
}

// Fungsi pembantu membuat slug ramah URL
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/[^\w\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
    .trim();
}`;

  // Copy Google Apps Script to Clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    triggerToast('Kode Google Apps Script berhasil disalin!');
  };

  return (
    <div className="notif-page">
      <div className="container section">
        
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
                </div>
                <span className="sub-desc">
                  {permission === 'granted' 
                    ? 'Anda terdaftar. Browser akan memproses siaran berita MQ News Today.' 
                    : permission === 'denied' 
                    ? 'Izin notifikasi diblokir oleh browser. Ketuk ikon gembok pada bilah alamat untuk menyetel izin kembali.' 
                    : 'Pemberitahuan dinonaktifkan secara default. Nyalakan tombol disamping untuk berlangganan.'
                  }
                </span>
              </div>

              {/* Slide Switch Button */}
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={isSubscribed}
                  onChange={handleSubscriptionToggle}
                  disabled={permission === 'unsupported'}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Collapsible Architecture Integration Guide Card */}
          <div className="notif-guide-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="notif-guide-header" onClick={() => setIsGuideOpen(!isGuideOpen)}>
              <h3 className="notif-guide-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                </svg>
                Panduan Integrasi Google Sheets → OneSignal (Developer Guide)
              </h3>
              <span className={`notif-guide-toggle-icon ${isGuideOpen ? 'notif-guide-toggle-icon--active' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>

            {isGuideOpen && (
              <div className="notif-guide-content">
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-lg)' }}>
                  Skema ini berfungsi otomatis. Saat Anda menulis baris artikel baru di Google Sheets, Anda tidak perlu membuka dasbor admin OneSignal secara manual. Cukup ketik kata <strong>"KIRIM"</strong> pada kolom status, Google Apps Script akan segera mengeksekusi HTTP POST request secara aman ke server OneSignal untuk membroadcast berita ke perangkat pengguna!
                </p>

                <div className="steps-list">
                  <div className="step-item">
                    <span className="step-num">1</span>
                    <span className="step-text">
                      Buka dasbor OneSignal Anda, cari <strong>OneSignal App ID</strong> dan <strong>REST API Key</strong> pada tab Settings & Key Credentials.
                    </span>
                  </div>
                  <div className="step-item">
                    <span className="step-num">2</span>
                    <span className="step-text">
                      Buka Spreadsheet Google Sheet Anda. Masuk ke menu <strong>Ekstensi</strong> &gt; <strong>Apps Script</strong>.
                    </span>
                  </div>
                  <div className="step-item">
                    <span className="step-num">3</span>
                    <span className="step-text">
                      Hapus semua kode bawaan, lalu salin kode pemicu di bawah ini dan tempel di editor Apps Script Anda. Sesuaikan variabel kunci <code>ONESIGNAL_APP_ID</code> dan <code>ONESIGNAL_REST_KEY</code> dengan kredensial milik Anda. Simpan berkas proyek tersebut.
                    </span>
                  </div>
                  <div className="step-item">
                    <span className="step-num">4</span>
                    <span className="step-text">
                      Pastikan Anda memiliki kolom bertajuk <strong>"Status Notifikasi"</strong> di sheet Anda (secara default diatur pada Kolom ke-11 / Kolom K). Ketika Anda ingin menyiarkan artikel, ketik kata <strong>KIRIM</strong> di baris tersebut.
                    </span>
                  </div>
                </div>

                {/* Copyable Apps Script Code Container */}
                <div className="code-section-header">
                  <span className="code-title">Kode Apps Script Pemicu (onEdit Trigger)</span>
                  <button type="button" className="copy-btn" onClick={handleCopyCode}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    Salin Kode
                  </button>
                </div>

                <div className="code-container">
                  <pre className="code-pre">
                    <code>{googleAppsScriptCode}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Historical Notifications Feed (Derived from actual articles) */}
          <div className="notif-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="feed-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '2px' }}>
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              Riwayat Siaran Berita
            </h3>
            
            {feedLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {[1, 2, 3].map((n) => (
                  <div key={n} className="skeleton" style={{ height: '70px', width: '100%', borderRadius: 'var(--radius-md)' }}></div>
                ))}
              </div>
            ) : feedItems.length > 0 ? (
              <div className="feed-list">
                {feedItems.map((item) => (
                  <Link href={`/artikel/${item.slug}`} key={item.id} className="feed-item">
                    <div className="feed-item-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
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
                ))}
              </div>
            ) : (
              <div className="feed-empty">
                Belum ada riwayat siaran berita yang tercatat.
              </div>
            )}
          </div>

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
      id: '1',
      title: 'Aliansi Tiga Negara dan Nubuat Akhir Zaman: Membaca Manuver Turki, Arab Saudi, dan Pakistan',
      excerpt: 'Panggung geopolitik dunia dikejutkan oleh wacana pembentukan pakta pertahanan militer antara tiga negara kuat...',
      date: '18 Mei 2026',
      slug: 'aliansi-tiga-negara-nubuat-akhir-zaman',
      category: 'Geopolitik'
    },
    {
      id: '2',
      title: 'Karpet Merah Netanyahu untuk Modi di Israel, Bukti Nyata Skenario Akhir Zaman',
      excerpt: 'Karpet merah digelar, pelukan hangat dipertontonkan di hadapan kamera dunia. Analisis hubungan bilateral India-Israel...',
      date: '17 Mei 2026',
      slug: 'karpet-merah-netanyahu-modi-israel',
      category: 'Timur Tengah'
    },
    {
      id: '3',
      title: 'Kabul Dibombardir, Api Perang Menyala di Perbatasan Pakistan-Afghanistan',
      excerpt: 'Tensi geopolitik Asia Selatan baru saja meledak ke titik yang paling mengkhawatirkan dengan bombardir di Kabul...',
      date: '16 Mei 2026',
      slug: 'kabul-dibombardir-api-perang-pakistan-afghanistan',
      category: 'Geopolitik'
    }
  ];
}

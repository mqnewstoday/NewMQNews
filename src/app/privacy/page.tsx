'use client';

import BackButton from '@/components/BackButton';
import '../info.css';

export default function PrivacyPage() {
  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="info-page container section">
      {/* Smart Back Button */}
      <BackButton />

      <div className="info-container">
        {/* Sticky Sidebar Index for Desktop */}
        <aside className="info-sidebar">
          <span className="info-sidebar__title">Kebijakan Privasi</span>
          <ul className="info-sidebar__links">
            <li>
              <button onClick={() => handleScrollTo('pengantar')} className="info-sidebar__link">
                <span>1.</span> Pengantar
              </button>
            </li>
            <li>
              <button onClick={() => handleScrollTo('data-dikumpul')} className="info-sidebar__link">
                <span>2.</span> Data yang Dikumpulkan
              </button>
            </li>
            <li>
              <button onClick={() => handleScrollTo('tujuan-data')} className="info-sidebar__link">
                <span>3.</span> Tujuan Penggunaan
              </button>
            </li>
            <li>
              <button onClick={() => handleScrollTo('penyimpanan-data')} className="info-sidebar__link">
                <span>4.</span> Metode Penyimpanan
              </button>
            </li>
            <li>
              <button onClick={() => handleScrollTo('hak-pengguna')} className="info-sidebar__link">
                <span>5.</span> Hak-Hak Pengguna
              </button>
            </li>
            <li>
              <button onClick={() => handleScrollTo('kontak-kami')} className="info-sidebar__link">
                <span>6.</span> Hubungi Kami
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Document Content Card */}
        <article className="info-content-card animate-fade-in-up">
          <div className="info-header">
            <div className="info-badge-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h1 className="info-title">Kebijakan Privasi</h1>
            <p className="info-meta">Pembaruan Terakhir: 19 Mei 2026</p>
          </div>

          <div className="info-body">
            <section id="pengantar" className="info-section">
              <h2 className="info-section__title">1. Pengantar</h2>
              <p>
                Selamat datang di <strong>MQ News Today</strong>. Kami sangat menghargai kepercayaan Anda dan berkomitmen penuh untuk melindungi privasi serta keamanan data pribadi Anda. Halaman Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan menjaga informasi Anda saat Anda menggunakan portal berita, layanan audio, pembaca PDF, dan berinteraksi di kolom komentar kami.
              </p>
              <p>
                Dengan mengakses, mendaftar, atau menggunakan layanan MQ News Today, Anda menyetujui praktik pengumpulan dan pengolahan data pribadi sebagaimana diatur dalam Kebijakan Privasi ini.
              </p>
            </section>

            <section id="data-dikumpul" className="info-section">
              <h2 className="info-section__title">2. Data yang Kami Kumpulkan</h2>
              <p>
                Kami mengumpulkan informasi minimal yang semata-mata diperlukan untuk memberikan pengalaman membaca, mendengarkan audio, dan berinteraksi secara personal dan aman. Informasi tersebut mencakup:
              </p>
              <ul>
                <li>
                  <strong>Informasi Akun (Firebase Authentication):</strong> Ketika Anda mendaftar atau masuk menggunakan Email/Sandi atau Akun Google, kami mencatat alamat email, nama lengkap (displayName), dan URL foto profil Anda secara aman.
                </li>
                <li>
                  <strong>Profil Tambahan (Firestore Database):</strong> Kami menyimpan data opsional yang Anda masukkan pada halaman edit profil, seperti Bio diri, Nomor Telepon, Tanggal Lahir, dan Jenis Kelamin.
                </li>
                <li>
                  <strong>Data Aktivitas & Preferensi Lokal:</strong> Preferensi visual Anda seperti pilihan Tema (Terang/Gelap), ukuran font bacaan, serta daftar artikel yang Anda simpan ke Bookmark disimpan secara lokal di peramban Anda untuk efisiensi performa.
                </li>
                <li>
                  <strong>Interaksi Komunitas:</strong> Komentar, saran, atau masukan yang Anda kirimkan pada artikel berita, Mubasyirat, maupun pemutar audio akan disimpan di server kami untuk ditampilkan secara publik kepada pembaca lain.
                </li>
              </ul>
            </section>

            <section id="tujuan-data" className="info-section">
              <h2 className="info-section__title">3. Tujuan Penggunaan Data</h2>
              <p>
                Kami menggunakan data yang dikumpulkan untuk tujuan-tujuan berikut:
              </p>
              <ol>
                <li>Menyediakan fungsi autentikasi akun yang aman guna memvalidasi identitas pembaca saat menulis komentar.</li>
                <li>Menampilkan profil Anda secara akurat ketika Anda berinteraksi di kolom diskusi berita.</li>
                <li>Memfasilitasi penayangan konten live-feed dan pengiriman notifikasi instan melalui integrasi OneSignal.</li>
                <li>Menjaga keamanan ekosistem situs dari aktivitas spam, peretasan, maupun penyalahgunaan sistem komentar.</li>
                <li>Menganalisis performa situs secara anonim demi meningkatkan kecepatan pemuatan data Google Sheets CMS kami.</li>
              </ol>
            </section>

            <div className="info-callout">
              <div className="info-callout__title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Komitmen Tanpa Iklan Pihak Ketiga</span>
              </div>
              <p className="info-callout__text">
                MQ News Today tidak menjual, memperdagangkan, atau membocorkan data pribadi Anda kepada broker data atau jaringan periklanan pihak ketiga mana pun. Kebijakan ini adalah bentuk komitmen kami dalam menjaga keaslian misi menyebarkan berita eskatologi dan Mubasyirat Muhammad Qasim secara murni.
              </p>
            </div>

            <section id="penyimpanan-data" className="info-section">
              <h2 className="info-section__title">4. Metode Penyimpanan & Keamanan</h2>
              <p>
                Seluruh data pribadi autentikasi Anda dikelola langsung oleh infrastruktur <strong>Firebase Auth (Google)</strong> yang terenkripsi secara industri. Informasi profil tambahan serta rekaman interaksi komentar disimpan di server database <strong>Cloud Firestore</strong> dengan pengamanan ketat menggunakan aturan Firebase Security Rules.
              </p>
              <p>
                Kami juga menyinkronkan data pembaruan artikel dan live-feed secara dinamis dengan Google Sheets API yang diamankan menggunakan token kredensial terenkripsi di sisi server (*server-side*), sehingga tidak dapat dibaca atau dimanipulasi oleh pihak luar.
              </p>
            </section>

            <section id="hak-pengguna" className="info-section">
              <h2 className="info-section__title">5. Hak-Hak Pengguna</h2>
              <p>
                Sebagai pengguna MQ News Today, Anda memiliki hak penuh atas pengelolaan data Anda sendiri, termasuk:
              </p>
              <ul>
                <li><strong>Hak Mengoreksi:</strong> Anda dapat mengubah Nama Lengkap, Bio, Nomor Telepon, Tanggal Lahir, serta Foto Profil secara instan melalui dashboard Halaman Profil Anda.</li>
                <li><strong>Hak Membatasi Akun:</strong> Anda dapat keluar dari akun (*logout*) kapan saja demi menghentikan sinkronisasi aktivitas interaksi.</li>
                <li><strong>Hak Penghapusan Data:</strong> Jika Anda menghendaki akun Anda dihapus secara permanen dari basis data Firebase dan Firestore kami, silakan hubungi tim administrator kami melalui saluran resmi yang tersedia.</li>
              </ul>
            </section>

            <section id="kontak-kami" className="info-section">
              <h2 className="info-section__title">6. Hubungi Kami</h2>
              <p>
                Apabila Anda memiliki pertanyaan, saran, atau keluhan terkait Kebijakan Privasi ini maupun pengelolaan informasi pribadi Anda di platform kami, silakan hubungi tim MQ News Today melalui kontak berikut:
              </p>
              <ul>
                <li><strong>WhatsApp:</strong> +62 857-0585-6030</li>
                <li><strong>Alamat Kantor/Redaksi:</strong> Bandung, Jawa Barat, Indonesia</li>
                <li><strong>Saluran Sosial:</strong> @MQNewsToday</li>
              </ul>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}

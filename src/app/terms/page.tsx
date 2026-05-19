'use client';

import BackButton from '@/components/BackButton';
import '../info.css';

export default function TermsPage() {
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
          <span className="info-sidebar__title">Syarat & Ketentuan</span>
          <ul className="info-sidebar__links">
            <li>
              <button onClick={() => handleScrollTo('ketentuan-umum')} className="info-sidebar__link">
                <span>1.</span> Ketentuan Umum
              </button>
            </li>
            <li>
              <button onClick={() => handleScrollTo('hak-cipta')} className="info-sidebar__link">
                <span>2.</span> Hak Cipta & Lisensi
              </button>
            </li>
            <li>
              <button onClick={() => handleScrollTo('kebijakan-komentar')} className="info-sidebar__link">
                <span>3.</span> Kebijakan Komentar
              </button>
            </li>
            <li>
              <button onClick={() => handleScrollTo('integritas-sistem')} className="info-sidebar__link">
                <span>4.</span> Integritas Sistem
              </button>
            </li>
            <li>
              <button onClick={() => handleScrollTo('penyangkalan')} className="info-sidebar__link">
                <span>5.</span> Penyangkalan (Disclaimer)
              </button>
            </li>
            <li>
              <button onClick={() => handleScrollTo('perubahan-ketentuan')} className="info-sidebar__link">
                <span>6.</span> Perubahan Ketentuan
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Document Content Card */}
        <article className="info-content-card animate-fade-in-up">
          <div className="info-header">
            <div className="info-badge-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h1 className="info-title">Syarat & Ketentuan Penggunaan</h1>
            <p className="info-meta">Pembaruan Terakhir: 19 Mei 2026</p>
          </div>

          <div className="info-body">
            <section id="ketentuan-umum" className="info-section">
              <h2 className="info-section__title">1. Ketentuan Umum</h2>
              <p>
                Selamat datang di <strong>MQ News Today</strong>. Syarat dan Ketentuan Penggunaan ini mengatur akses dan penggunaan Anda terhadap situs web kami yang beralamat di <a href="https://mqnewstoday.my.id" target="_blank" rel="noopener noreferrer">mqnewstoday.my.id</a>. Dengan memasuki, membaca konten, memutar konten audio, membuka dokumen PDF, serta mendaftar akun di situs ini, Anda dianggap telah memahami dan menyetujui seluruh ketentuan yang tercantum di halaman ini.
              </p>
              <p>
                Jika Anda tidak menyetujui bagian apa pun dari Syarat & Ketentuan ini, kami mempersilakan Anda untuk tidak melanjutkan penggunaan layanan kami.
              </p>
            </section>

            <section id="hak-cipta" className="info-section">
              <h2 className="info-section__title">2. Hak Cipta & Lisensi Konten</h2>
              <p>
                Seluruh materi yang diterbitkan di MQ News Today—termasuk namun tidak terbatas pada naskah berita, narasi analisis geopolitik, rekaman suara audio (MP3), terjemahan naskah mimpi (Mubasyirat), logo, dan publikasi digital PDF—dilindungi oleh undang-undang hak cipta dan merek dagang.
              </p>
              <ul>
                <li><strong>Penggunaan Non-Komersial:</strong> Anda diperbolehkan membaca, mengunduh file PDF, mendengarkan berkas audio, dan membagikan tautan artikel secara pribadi dan non-komersial.</li>
                <li><strong>Ketentuan Distribusi Ulang:</strong> Anda diperkenankan mengutip sebagian isi konten berita atau menyalin potongan narasi mimpi Muhammad Qasim dengan **kewajiban mencantumkan kredit link aktif yang merujuk langsung ke halaman asli artikel di MQ News Today**.</li>
                <li><strong>Larangan Plagiasi & Klaim Sepihak:</strong> Dilarang keras mengunggah ulang file audio podcast kami secara utuh ke platform musik komersial atau memalsukan dokumen PDF resmi kami tanpa izin tertulis dari pihak redaksi.</li>
              </ul>
            </section>

            <section id="kebijakan-komentar" className="info-section">
              <h2 className="info-section__title">3. Kebijakan Interaksi & Kolom Komentar</h2>
              <p>
                Guna memelihara lingkungan diskusi yang sehat, ilmiah, dan beradab di bawah prinsip "Truth & Clarity", kami menetapkan aturan ketat untuk kolom komentar pada halaman Berita, Mubasyirat, dan Audio Player:
              </p>
              <ul>
                <li>Dilarang mengirimkan komentar yang mengandung unsur provokasi SARA, penghinaan pribadi, umpatan kasar, pornografi, maupun ujaran kebencian (*hate speech*).</li>
                <li>Dilarang mempromosikan produk, menempelkan tautan rujukan afiliasi, menyebarkan spam, atau melakukan kampanye politik praktis.</li>
                <li>Redaksi MQ News Today berhak penuh untuk menghapus komentar, memblokir akun secara sepihak, atau membatasi hak interaksi pengguna yang melanggar aturan ini secara berulang.</li>
              </ul>
            </section>

            <div className="info-callout">
              <div className="info-callout__title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>Penyangkalan Mubasyirat (Disclaimer)</span>
              </div>
              <p className="info-callout__text">
                Konten Mubasyirat (Kumpulan Mimpi Muhammad Qasim) disajikan sebagai materi kajian eskatologi, perbandingan nubuat, dan analisis spiritual. Isi mimpi-mimpi tersebut murni mencerminkan kesaksian pribadi beliau dan tidak mengikat pembaca secara teologis maupun dogmatis. MQ News Today tidak memaksakan dogma tertentu dan memberikan kebebasan mutlak bagi setiap pembaca untuk menganalisis isi mimpi tersebut secara objektif.
              </p>
            </div>

            <section id="integritas-sistem" className="info-section">
              <h2 className="info-section__title">4. Integritas & Keamanan Sistem</h2>
              <p>
                Sebagai platform modern berbasis teknologi, kami berdedikasi menjaga performa sistem kami:
              </p>
              <ol>
                <li>Dilarang keras mengeksploitasi sistem integrasi data Google Sheets API kami dengan cara melakukan teknik *automated data scraping*, *crawling* agresif, maupun serangan *Denial of Service* (DoS) ke server kami.</li>
                <li>Dilarang mencoba memanipulasi *endpoint* autentikasi Firebase, meretas basis data Firestore, atau menyamar sebagai pengguna lain demi mencuri data pribadi.</li>
                <li>Segala upaya manipulasi atau serangan siber terhadap infrastruktur MQ News Today akan diserahkan kepada pihak berwajib berdasarkan hukum UU ITE yang berlaku di Indonesia.</li>
              </ol>
            </section>

            <section id="penyangkalan" className="info-section">
              <h2 className="info-section__title">5. Batasan Tanggung Jawab</h2>
              <p>
                Informasi geopolitik dan eskatologi yang disajikan di MQ News Today dihimpun dari berbagai sumber analisis yang kami upayakan seakurat mungkin. Namun demikian, redaksi tidak memberikan jaminan mutlak atas ketepatan waktu realisasi naskah analisis masa depan atau interpretasi tafsir mimpi yang dirangkum. Segala keputusan yang diambil oleh pembaca secara personal berdasarkan tulisan di platform ini menjadi tanggung jawab pribadi masing-masing pengguna.
              </p>
            </section>

            <section id="perubahan-ketentuan" className="info-section">
              <h2 className="info-section__title">6. Perubahan Ketentuan Penggunaan</h2>
              <p>
                Redaksi MQ News Today berhak penuh untuk memperbarui atau memodifikasi Syarat & Ketentuan Penggunaan ini sewaktu-waktu tanpa pemberitahuan tertulis sebelumnya. Segala perubahan akan langsung diberlakukan setelah diterbitkan di halaman ini. Kami mengimbau Anda untuk meninjau halaman ini secara berkala untuk tetap mendapatkan informasi terbaru mengenai hak dan kewajiban Anda.
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}

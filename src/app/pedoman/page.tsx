'use client';

import BackButton from '@/components/BackButton';
import '../info.css';

export default function PedomanPage() {
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
          <span className="info-sidebar__title">Pedoman Wajib</span>
          <ul className="info-sidebar__links">
            <li>
              <button onClick={() => handleScrollTo('visi-redaksi')} className="info-sidebar__link">
                <span>1.</span> Visi Redaksi
              </button>
            </li>
            <li>
              <button onClick={() => handleScrollTo('akurasi-verifikasi')} className="info-sidebar__link">
                <span>2.</span> Standar Akurasi
              </button>
            </li>
            <li>
              <button onClick={() => handleScrollTo('kriteria-publikasi')} className="info-sidebar__link">
                <span>3.</span> Kriteria Publikasi
              </button>
            </li>
            <li>
              <button onClick={() => handleScrollTo('integritas-narasi')} className="info-sidebar__link">
                <span>4.</span> Integritas Narasi
              </button>
            </li>
            <li>
              <button onClick={() => handleScrollTo('moderasi-diskusi')} className="info-sidebar__link">
                <span>5.</span> Moderasi Diskusi
              </button>
            </li>
            <li>
              <button onClick={() => handleScrollTo('independensi')} className="info-sidebar__link">
                <span>6.</span> Independensi
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Document Content Card */}
        <article className="info-content-card animate-fade-in-up">
          <div className="info-header">
            <div className="info-badge-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h1 className="info-title">Pedoman Pemberitaan & Penyiaran Media</h1>
            <p className="info-meta">Pembaruan Terakhir: 19 Mei 2026</p>
          </div>

          <div className="info-body">
            <section id="visi-redaksi" className="info-section">
              <h2 className="info-section__title">1. Visi Redaksi (Truth & Clarity)</h2>
              <p>
                <strong>MQ News Today</strong> didirikan atas dasar komitmen terhadap kejujuran informasi (*Truth*) dan kejelasan analisis (*Clarity*). Sebagai media pemberitaan alternatif yang fokus pada tema eskatologi (akhir zaman), mimpi spiritual rahmani Muhammad Qasim (Mubasyirat), serta dinamika geopolitik global, kami menjunjung tinggi nilai keberimbangan yang mendidik dan mencerahkan pemikiran umat Islam sedunia.
              </p>
              <p>
                Seluruh kontributor, penulis berita, penyunting audio, dan penyusun infografis PDF wajib tunduk sepenuhnya pada pedoman media ini guna memelihara kredibilitas serta keaslian misi pemberitaan.
              </p>
            </section>

            <section id="akurasi-verifikasi" className="info-section">
              <h2 className="info-section__title">2. Standar Akurasi & Verifikasi</h2>
              <p>
                Setiap materi berita, analisis geopolitik, maupun terjemahan kutipan mimpi wajib melalui proses verifikasi berlapis sebelum disinkronkan ke dalam basis data Google Sheets CMS kami:
              </p>
              <ul>
                <li><strong>Kebenaran Tekstual:</strong> Penyebutan narasi mimpi Muhammad Qasim harus mengacu langsung pada dokumen rekaman suara asli atau catatan verbatim resmi beliau, tanpa adanya pemotongan konteks kalimat yang dapat menimbulkan kesalahpahaman penafsiran.</li>
                <li><strong>Akurasi Fakta Geopolitik:</strong> Berita seputar konfrontasi militer di Timur Tengah, krisis ekonomi global, maupun pergerakan aliansi dunia wajib diverifikasi silang (*cross-checked*) dengan sumber-sumber berita kredibel internasional sebelum dihubungkan dengan analisis nubuat eskatologi.</li>
              </ul>
            </section>

            <section id="kriteria-publikasi" className="info-section">
              <h2 className="info-section__title">3. Kriteria Konten Layak Siar</h2>
              <p>
                Kami menyaring konten secara selektif agar portal berita tetap terfokus pada misi utama. Konten yang layak diterbitkan wajib memenuhi setidaknya salah satu kriteria berikut:
              </p>
              <ol>
                <li>Memberikan pemahaman mendalam tentang konsep-konsep eskatologi Islam berdasarkan Al-Qur'an dan Sunnah.</li>
                <li>Mendokumentasikan terjemahan naskah tertulis mimpi spiritual Muhammad Qasim secara murni disertai tanggal kesaksian mimpi yang jelas.</li>
                <li>Menyediakan analisis geopolitik mutakhir yang relevan dengan tanda-tanda zaman di wilayah Timur Tengah dan dunia internasional.</li>
                <li>Menyajikan pembelajaran tauhid serta upaya menjauhi segala bentuk syirik—sebagai pesan inti yang senantiasa ditekankan dalam mimpi-mimpi beliau.</li>
              </ol>
            </section>

            <div className="info-callout">
              <div className="info-callout__title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
                <span>Kebijakan Anti-Sensasionalisme</span>
              </div>
              <p className="info-callout__text">
                MQ News Today melarang keras penulisan judul berita bergaya umpan klik (*clickbait*) yang sensasional, berlebihan, maupun menakut-nakuti pembaca. Penyampaian analisis eskatologi wajib dilakukan secara tenang, ilmiah, analitis, dan mengutamakan ketenangan spiritual pembaca.
              </p>
            </div>

            <section id="integritas-narasi" className="info-section">
              <h2 className="info-section__title">4. Integritas Narasi & Kutipan</h2>
              <p>
                Untuk menjaga kemurnian naskah Mubasyirat Muhammad Qasim, para penulis dilarang keras:
              </p>
              <ul>
                <li>Menyunting kata-kata asli dalam naskah mimpi demi menyesuaikannya dengan opini pribadi atau agenda politik tertentu.</li>
                <li>Menyisipkan prediksi waktu realisasi mimpi secara mutlak (contoh: menentukan tanggal spesifik terjadinya suatu peristiwa) apabila hal tersebut tidak disebutkan secara eksplisit oleh Muhammad Qasim sendiri dalam mimpinya.</li>
                <li>Mengaburkan pemisah antara teks mimpi murni (Mubasyirat) dengan teks interpretasi/analisis opini penulis. Keduanya harus disajikan secara terpisah dan jelas.</li>
              </ul>
            </section>

            <section id="moderasi-diskusi" className="info-section">
              <h2 className="info-section__title">5. Kebijakan Moderasi Diskusi Komunitas</h2>
              <p>
                Ekosistem komentar dikelola oleh tim moderator dengan berpegang pada standar kesopanan. Komentar yang bersifat mendebat secara tidak sehat, berdebat kusir tanpa dasar ilmiah, menghakimi secara sektarian (*takfiri*), maupun melecehkan keyakinan pembaca lain wajib segera dihapus atau diarsipkan demi menjaga kekhusyukan membaca.
              </p>
            </section>

            <section id="independensi" className="info-section">
              <h2 className="info-section__title">6. Independensi Media & Kebijakan Non-Komersial</h2>
              <p>
                MQ News Today berdiri secara independen dan tidak terafiliasi dengan organisasi kemasyarakatan formal, partai politik, maupun badan komersial mana pun. Kami didanai secara swadaya oleh komunitas pembaca yang memiliki kepedulian terhadap penyebaran informasi eskatologi secara murni tanpa adanya intervensi agenda profit komersial. Kami berkomitmen mempertahankan model operasional tanpa iklan agar fokus pembaca tetap terjaga secara utuh.
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}

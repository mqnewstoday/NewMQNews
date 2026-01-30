/**
 * MQ CHATBOT - NATIVE THEME INTEGRATION
 * Fitur: Auto-Sync dengan theme.css & settings.html
 * Logic: RAG-Lite (Smart Search PDF)
 */

const CHAT_CONFIG = {
    apiKey: "", // PASTE YOUR API KEY HERE (JANGAN COMMIT KE GITHUB) 
    model: "llama-3.3-70b-versatile",
    maxDailyLimit: 100,

    // TEMPEL DATA PDF LU DISINI
    rawKnowledgeBase: `
    
    Visi Eskatologis Muhammad Qasim bin Abdul Karim: Analisis Komprehensif Dokumen 'Mimpi Muhammad Qasim'
​1. Pendahuluan: Fenomena Narasi Kenabian Kontemporer
​subjek analisis utama dalam laporan ini berjudul 'Mimpi Muhammad Qasim' (PDF dalam Bahasa Indonesia/Melayu), yang disusun oleh Asniati bin Yahya pada September 2022. Dokumen ini berfungsi sebagai kompendium utama yang merekam pengalaman spiritual, visi eskatologis, dan klaim profetik dari Muhammad Qasim bin Abdul Karim, seorang warga negara Pakistan yang telah menjadi pusat perhatian dalam diskursus eskatologi Islam kontemporer. Laporan ini menyajikan analisis mendalam, objektif, dan terperinci mengenai isi dokumen tersebut, menguraikan struktur naratif, implikasi teologis, serta ramalan geopolitik yang terkandung di dalamnya.
​Premis dasar dari dokumen ini adalah bahwa mimpi-mimpi yang dialami oleh Muhammad Qasim bukanlah bunga tidur biasa, melainkan Ru'ya Sadiqah (mimpi yang benar) yang merupakan bagian dari kenabian, sebagaimana disebutkan dalam tradisi Islam. Qasim mengklaim bahwa ia tidak mencari status, kekuasaan, atau pengikut, melainkan hanya menjalankan perintah langsung dari Allah SWT dan Nabi Muhammad SAW untuk menyebarkan mimpi-mimpi ini sebagai peringatan bagi umat Islam dan dunia.
​Analisis ini akan membedah teks secara sistematis, mulai dari profil sang visioner, teologi inti mengenai tauhid dan syirik, hingga skenario geopolitik yang sangat spesifik yang melibatkan Pakistan, India, Timur Tengah, dan kekuatan adidaya dunia. Fokus khusus diberikan pada bagaimana narasi ini membangun koherensi internalnya sendiri, menghubungkan kegagalan politik domestik di Pakistan dengan peristiwa apokaliptik global seperti Perang Dunia III dan kemunculan Dajjal.
​2. Profil Visioner: Muhammad Qasim bin Abdul Karim
​2.1 Latar Belakang dan Inisiasi Spiritual
​Dalam dokumen tersebut, Muhammad Qasim memperkenalkan dirinya sebagai sosok yang sederhana dan "tidak religius" dalam pengertian konvensional. Ia secara eksplisit menyebutkan bahwa dirinya tidak berjenggot (tercukur bersih) dan pada awalnya tidak terbiasa melakukan ibadah-ibadah sunnah seperti shalat Tahajjud secara teratur. Pengakuan ini merupakan elemen retoris yang penting; dengan memposisikan dirinya sebagai "orang biasa" dan bukan ulama atau orang suci yang sengaja menyucikan diri, narasi ini memperkuat gagasan bahwa pemilihannya adalah murni kehendak Ilahi, bukan hasil dari ambisi pribadi.
​Perjalanan spiritualnya dimulai pada usia yang sangat muda. Qasim melaporkan bahwa ia berusia sekitar 12 atau 13 tahun ketika Allah SWT dan Nabi Muhammad SAW hadir bersamaan dalam mimpinya untuk pertama kalinya. Sejak tahun 1993, ketika ia berusia 17 tahun, frekuensi mimpi-mimpi ini meningkat drastis. Ia mengklaim telah melihat Allah SWT dalam mimpinya lebih dari 500 kali dan Nabi Muhammad SAW lebih dari 280 kali. 
​Penting untuk dicatat batasan teologis yang dijaga dalam narasi ini. Qasim menegaskan bahwa ia tidak pernah melihat wujud Allah secara langsung. Ia merasakan kehadiran Allah di atas Arsy (Singgasana) dan mendengar suara-Nya dari balik tabir cahaya atau langsung dari langit. Hal ini menjaga konsistensi dengan doktrin Islam mengenai transendensi Tuhan. Mengenai Nabi Muhammad SAW, Qasim menggambarkan bahwa pada awalnya ia tidak berani menatap wajah Nabi karena rasa hormat yang mendalam, dan hanya melihat tubuh atau tangan beliau saat bersalaman. Baru pada September 2015, untuk pertama kalinya, ia memberanikan diri menatap mata Nabi Muhammad SAW, yang digambarkan penuh dengan cahaya Ilahi.
​2.2 Mandat Penyebaran dan Tantangan Awal
​Titik balik dalam narasi Qasim terjadi pada tahun 2014. Setelah lebih dari dua dekade menyimpan mimpi-mimpi ini, ia menerima perintah langsung melalui mimpi untuk mulai membagikannya kepada dunia. Perintah ini datang dengan urgensi tinggi: "Qasim, kamu harus membagikan mimpi ini kepada semua orang untuk menyelamatkan Pakistan dan menyelamatkan Islam".
​Dokumen ini merekam perjuangan awal Qasim dalam menyebarkan pesannya. Ia awalnya berbagi dengan keluarga dan teman, namun tidak dipercaya. Ia kemudian mencoba menghubungi situs resmi Angkatan Darat Pakistan dan pemerintah, serta tokoh-tokoh populer, namun diabaikan. Penolakan ini digambarkan sebagai ujian kesabaran dan keimanan, yang memaksanya untuk beralih ke platform digital dan internet sebagai sarana utama penyebaran—sebuah langkah yang pada akhirnya memfasilitasi jangkauan globalnya hingga ke Indonesia dan Malaysia. 
​2.3 Penolakan Tegas Terhadap Gelar Imam Mahdi
​Salah satu aspek paling krusial dari dokumen ini adalah klarifikasi mengenai status eskatologis Qasim. Meskipun isi mimpinya mengandung elemen-elemen yang secara tradisional dikaitkan dengan Imam Mahdi—seperti memimpin umat keluar dari kegelapan, menyatukan Islam, dan peran kunci dalam perang akhir zaman—Qasim secara konsisten dan tegas menolak gelar tersebut.
​Ia menyatakan: "Aku bukan Mahdi, aku juga tidak ingin menjadi Mahdi... Aku hanya manusia biasa yang mencari Rahmat Allah". Ia menekankan bahwa ia tidak pernah diperlihatkan dalam mimpi bahwa dirinya adalah Mahdi. Sikap ini menciptakan paradoks naratif yang menarik: ia menggambarkan dirinya melakukan pekerjaan Mahdi tanpa mengklaim gelar Mahdi. Bagi para pengikutnya, penyangkalan ini justru sering diinterpretasikan sebagai tanda kebenaran, merujuk pada hadis yang menyatakan bahwa Imam Mahdi akan menyangkal dirinya sendiri.
​3. Kerangka Teologis: Perang Total Melawan Syirik Modern
​3.1 Definisi Syirik dalam Konteks Kontemporer
​Pesan inti yang melandasi seluruh visi Qasim adalah pemurnian Tauhid dan penghapusan segala bentuk Syirik (menyekutukan Allah). Namun, dokumen ini menawarkan definisi syirik yang sangat spesifik dan ketat, yang disesuaikan dengan konteks modern. Qasim tidak hanya berbicara tentang penyembahan berhala kuno, tetapi mengidentifikasi artefak budaya modern sebagai bentuk berhala baru yang menghalangi pertolongan Allah.
​Menurut dokumen tersebut, bentuk-bentuk syirik modern meliputi:
​Gambar Makhluk Bernyawa: Foto-foto di dinding rumah, gambar pada kemasan produk (sampo, makanan, obat-obatan), dan papan reklame.
​Patung dan Boneka: Patung di taman kota, manekin di toko, dan mainan anak-anak yang berbentuk makhluk hidup.
​Pemujaan Tokoh: Menggantungkan harapan pada manusia (seperti politisi atau jenderal) dan bukan kepada Allah, serta tindakan fisik seperti membungkuk hormat kepada selain Allah.
​3.2 Implikasi Geopolitik dari Syirik
​Keunikan narasi Qasim terletak pada hubungan kausalitas langsung antara "kebersihan spiritual" negara dan keberhasilan geopolitiknya. Ia berpendapat bahwa Pakistan dan umat Islam secara umum mengalami kehinaan, kekalahan, dan krisis ekonomi karena negara tersebut dipenuhi oleh "berhala modern" ini.
​Dalam sebuah mimpi, Qasim melihat bahwa Allah SWT tidak akan menurunkan bantuan-Nya—termasuk teknologi militer canggih—sampai Pakistan membersihkan dirinya dari gambar-gambar dan patung-patung ini. Ia menggambarkan bahwa malaikat pembawa rahmat tidak dapat memasuki wilayah yang terkontaminasi oleh syirik visual ini. Oleh karena itu, agenda reformasi utama yang ia tawarkan bukanlah reformasi ekonomi atau konstitusi semata, melainkan gerakan ikonoklasme nasional: penghapusan gambar dari ruang publik, uang kertas, dan identitas negara.
​3.3 "Sekolah Umar" dan Pembentukan Karakter
​Dokumen ini juga memuat mimpi tentang pendidikan spiritual Qasim. Ia bermimpi didaftarkan oleh Nabi Muhammad SAW ke sebuah sekolah, di mana ia bertemu dengan para sahabat utama seperti Abu Bakar Ash-Siddiq (RA) dan Umar bin Khattab (RA). Dalam mimpi berjudul "Penerimaan Muhammad Qasim Di Sekolah Umar," ia menggambarkan proses transformasi dari seseorang yang berpakaian lusuh menjadi siswa yang berseragam rapi dan indah melalui rahmat Allah.
​Simbolisme "Sekolah Umar" sangat signifikan. Ini mengindikasikan bahwa model kepemimpinan dan karakter yang diperlukan untuk kebangkitan Islam di akhir zaman harus meniru ketegasan, keadilan, dan kesederhanaan Umar bin Khattab. Ini adalah kritik implisit terhadap kepemimpinan Muslim saat ini yang dianggap lemah dan korup.
​4. Analisis Politik Pakistan: Nubuat Kegagalan dan Kehancuran
​Sebagian besar dokumen 'mqversi1.pdf' didedikasikan untuk situasi internal Pakistan. Qasim mengklaim telah menerima serangkaian mimpi yang secara akurat memprediksi kebangkitan dan kejatuhan tokoh-tokoh politik utama, khususnya Imran Khan.
​4.1 Imran Khan: Harapan yang Gagal
​Narasi mengenai Imran Khan sangat rinci dan tragis. Qasim menggambarkan bahwa sebelum pemilu 2018, ia bermimpi Imran Khan akan menjadi Perdana Menteri tetapi akan gagal memenuhi janji-janjinya.
​Penyebab Kegagalan: Dokumen tersebut secara spesifik menyebutkan bahwa kegagalan Imran Khan bukan hanya karena inkompetensi manajerial, tetapi karena alasan spiritual: tindakan syirik yang dilakukannya dengan bersujud (atau memberikan penghormatan berlebihan) di sebuah kuil (Makam Baba Farid di Pakpattan). Mimpi Qasim memperingatkan bahwa tindakan ini mencabut keberkahan dari pemerintahannya. 
​Ketidakmampuan Mengendalikan Inflasi: Mimpi-mimpi tersebut menggambarkan Imran Khan terjebak dalam jaring masalah ekonomi, inflasi yang tidak terkendali, dan tekanan dari kekuatan oposisi serta mafia internal. Qasim melihat Imran Khan mengakui kegagalannya secara pribadi kepada orang terdekat, namun tetap menampilkan citra kesuksesan di depan publik.
​Akhir yang Tragis: Narasi mimpi memprediksi bahwa Imran Khan tidak akan menyelesaikan masa jabatannya dengan sukses dan akan meninggalkan pemerintahan dalam kondisi negara yang lebih buruk daripada saat ia memulainya. Simbolisme "pesawat dengan satu mesin yang jatuh" digunakan untuk menggambarkan partai PTI dan kepemimpinan Imran Khan yang rapuh.
​4.2 Peran Panglima Militer (Army Chief)
​Dalam teologi politik Qasim, militer Pakistan memegang peranan sentral namun ambigu. Di satu sisi, para jenderal dikritik karena tidak mendengarkan peringatan ilahi. Di sisi lain, Panglima Militer digambarkan sebagai satu-satunya aktor rasional yang pada akhirnya akan menyadari kebenaran mimpi Qasim.
​Momen Kesadaran: Terdapat nubuat bahwa Panglima Militer akan menghadapi situasi yang sangat kritis di mana semua opsi strategis dan militer konvensional telah habis (amunisi menipis, musuh mengepung). Pada titik nadir ini, Nabi Muhammad SAW akan hadir dalam mimpi Panglima Militer untuk bersaksi bahwa "Qasim mengatakan kebenaran".
​Transisi Kekuasaan: Setelah kesaksian ini, militer diprediksi akan memfasilitasi transisi menuju sistem pemerintahan baru yang berbasis Islam murni, menghapus sistem demokrasi yang dianggap gagal dan korup, serta mempersiapkan negara untuk perang besar (Ghazwatul Hind).
​4.3 Nawaz Sharif dan Kekacauan Sipil
​Dokumen ini juga menyinggung nasib mantan Perdana Menteri Nawaz Sharif. Terdapat mimpi yang menggambarkan upaya Nawaz Sharif untuk kembali ke panggung politik dengan dukungan putrinya, Maryam Nawaz. Namun, narasi ini berubah menjadi gelap dengan prediksi tentang potensi pembunuhan atau kematian Nawaz Sharif yang dapat memicu perang saudara atau kekacauan massal di Pakistan, menciptakan ketidakstabilan yang dimanfaatkan oleh musuh luar (India).
​5. Geopolitik Global dan Perang Dunia III
​Visi Qasim melampaui perbatasan Pakistan, memetakan skenario Perang Dunia III yang dimulai dari Timur Tengah dan melibatkan konfrontasi langsung antara blok Islam dan kekuatan global.
​5.1 Tiga Benteng Islam
​Qasim menggunakan metafora "Tiga Menara" atau benteng untuk menggambarkan pertahanan dunia Islam:
​Turki (Benteng Pertama): Dokumen ini memprediksi kehancuran Turki. Presiden Erdogan digambarkan sebagai pemimpin yang kuat namun pada akhirnya akan dikalahkan atau dijatuhkan karena konspirasi internasional yang masif. Kejatuhan Turki menandai runtuhnya pertahanan pertama umat Islam. 
​Arab Saudi (Benteng Kedua): Setelah Turki, Arab Saudi diprediksi akan mengalami kekacauan internal dan serangan eksternal. Ketidakmampuan kepemimpinan Saudi untuk mempertahankan diri digambarkan sebagai tanda semakin dekatnya kemunculan Dajjal.
​Pakistan (Benteng Terakhir): Setelah jatuhnya dua benteng pertama, musuh-musuh Islam (diidentifikasi sebagai aliansi Zionis, Amerika Serikat, dan India) akan memusatkan serangan mereka ke Pakistan untuk menghancurkan benteng terakhir ini. Namun, di sinilah intervensi Ilahi terjadi.
​5.2 Ghazwatul Hind: Perang Suci di Anak Benua
​Nubuat mengenai Ghazwatul Hind (Perang Besar India) adalah salah satu tema paling dominan. Qasim menggambarkan bahwa India, dengan dukungan AS dan Israel, akan melancarkan serangan mendadak ke Pakistan, memanfaatkan kelemahan internal negara tersebut.
​Serangan Awal: India diprediksi akan menyerang Lahore dan melumpuhkan sebagian tentara Pakistan, mencapai posisi yang sangat mengancam.
​Intervensi Ilahi (Jet Tempur Hitam): Dalam situasi putus asa, Allah SWT digambarkan memberikan bantuan supranatural berupa "3.000 Jet Tempur Hitam" (Black Fighter Jets). Pesawat ini digambarkan memiliki teknologi yang tidak tertandingi oleh senjata manusia mana pun—tidak terdeteksi radar, tak terkalahkan, dan sangat mematikan. 
​Kemenangan Total: Dengan bantuan teknologi ilahi ini, Pakistan tidak hanya memukul mundur India tetapi juga menaklukkan seluruh wilayah India, Bangladesh, dan Afghanistan. Wilayah ini kemudian disatukan menjadi satu entitas geopolitik Islam yang kuat.
​5.3 Perang Dunia III dan Ekspansi ke Timur Tengah
​Setelah mengamankan wilayah Asia Selatan, narasi berlanjut dengan Pakistan memimpin koalisi (termasuk dukungan dari Indonesia dan Malaysia) menuju Timur Tengah untuk membebaskan wilayah yang diduduki. Perang ini digambarkan sebagai konflik eksistensial melawan dua kekuatan adidaya (AS dan Rusia) yang bersaing menguasai wilayah tersebut. Kemenangan umat Islam dalam perang ini menjadi pendahuluan bagi masa damai dan kemakmuran singkat sebelum datangnya Kiamat. 
​6. Eskatologi Utama: Dajjal, Isa AS, dan Yajuj Majuj
​Dokumen ini memberikan detail yang sangat spesifik mengenai tanda-tanda besar Kiamat, mengintegrasikan elemen tradisional dengan interpretasi modern.
​6.1 Dajjal: Penyihir Teknologi
​Qasim mendeskripsikan Dajjal bukan sekadar sistem, tetapi sosok manusia nyata.
​Ciri Fisik: Tinggi besar (sekitar 6 kaki 1-2 inci), berkulit coklat gelap, berotot, rambut keriting, wajah kejam, dan memiliki tahi lalat di pipi. Ia digambarkan berjalan dengan kesombongan luar biasa. 
​Sumber Kekuatan: Dajjal digambarkan mengumpulkan kekuatan melalui ritual sihir hitam yang melibatkan tengkorak dan fasilitas khusus. Ia juga membangun "Istana Terapung" dan memiliki kemampuan memanipulasi materi dan pikiran.
​Modus Operandi: Dajjal akan muncul setelah masa damai pasca-PD III. Ia akan menawarkan "surga dunia"—kekayaan, pemuda abadi, dan wanita—kepada mereka yang menyembahnya. Pengikutnya akan hidup dalam kemewahan semu, sementara penentangnya akan menderita.
​Konfrontasi: Qasim menceritakan mimpi di mana ia berhadapan langsung dengan Dajjal. Dajjal mencoba membujuknya, kemudian mengancamnya. Qasim melarikan diri menggunakan kemampuan levitasi (berlari di udara) yang diberikan Allah, sebuah motif berulang dalam mimpinya yang menyimbolkan perlindungan Ilahi.
​6.2 Yajuj dan Majuj (Gog dan Magog)
​Makhluk-makhluk ini digambarkan secara visual mirip dengan gorila besar namun dengan kecepatan dan kekuatan yang jauh melebihi manusia. Mereka memiliki dua warna kulit (hitam dan putih) dan tubuh yang dipenuhi bulu.
​Karakteristik: Mereka sangat buas, memakan apa saja, dan memiliki kemampuan melompat tinggi hingga ke langit.
​Kemunculan: Mereka akan keluar setelah Dajjal dikalahkan, menyebar dari pegunungan (kemungkinan Kaukasus atau utara Rusia) dan menghancurkan peradaban manusia yang tersisa. Senjata konvensional tidak mempan terhadap mereka.
​Pemusnahan: Qasim menggambarkan bahwa satu-satunya cara mengalahkan mereka adalah melalui intervensi Ilahi dan doa Nabi Isa AS, bukan melalui kekuatan militer manusia.
​6.3 Turunnya Nabi Isa AS
​Kedatangan Nabi Isa AS digambarkan sesuai dengan hadis (rambut basah seolah baru mandi). Beliau turun dari langit pada saat kritis ketika umat Islam terdesak oleh Dajjal. Qasim menggambarkan dirinya bertemu dan hidup bersama Nabi Isa AS setelah perang besar, menandakan periode di mana Islam dipimpin langsung oleh seorang Nabi sebelum akhir dunia.
​7. Elemen Metafisika dan Simbolisme Spiritual
​Selain narasi politik dan perang, dokumen ini kaya akan simbolisme metafisika yang menggambarkan perjalanan spiritual Qasim dan umat Islam.
​7.1 Karpet Terbang dan Tangga Langit
​Dalam salah satu mimpi awalnya, Qasim melihat tangga di atap rumahnya yang menuju langsung ke langit, yang ia daki dengan penuh kegembiraan. Di mimpi lain, ia menggunakan "karpet terbang" untuk mencapai Arsy Allah. Ini menyimbolkan akses langsung kepada petunjuk Ilahi tanpa perantara institusi agama formal, serta kecepatan kenaikan spiritual yang diberikan Allah kepadanya.
​7.2 Pencarian Rumah Nabi dan Bus Modern
​Rumah Nabi: Qasim sering bermimpi mencari "Rumah Nabi Muhammad SAW" yang hilang atau dalam kondisi rusak parah dan gelap. Misi utamanya digambarkan sebagai membersihkan, memperbaiki, dan menerangi kembali rumah ini. Ini adalah alegori yang jelas untuk pemurnian ajaran Islam dari bid'ah dan syirik serta penyatuan kembali umat.
​Bus Canggih: Dalam sebuah visi, Qasim mengendarai sebuah bus modern yang besar, mengangkut orang-orang menuju "Tempat yang Damai." Bus ini melambangkan kepemimpinannya dalam membimbing sekelompok umat terpilih melewati masa-masa kekacauan menuju keselamatan.
​7.3 Cahaya Allah dan Jari Telunjuk
​Motif "Cahaya Allah" yang memancar dari jari telunjuk kanan Qasim muncul berulang kali, terutama dalam konfrontasi melawan musuh atau kegelapan. Cahaya ini digunakan untuk menghancurkan mesin-mesin perang musuh yang canggih atau untuk menerangi jalan bagi pengikutnya. Ini merepresentasikan kekuatan Tauhid yang murni sebagai senjata pamungkas melawan teknologi materialistik Dajjal.
​8. Peran Indonesia, Malaysia, dan Bangladesh
​Dokumen ini secara khusus menyebutkan peran penting umat Islam dari Asia Tenggara dan Asia Selatan (non-Pakistan) dalam mendukung misi Qasim.
​Pendukung Awal: Dalam mimpi berjudul "Orang-Orang dari Indonesia, Malaysia dan Bangladesh Membantu Menyebarkan Mimpi-Mimpi," Qasim melihat sekelompok orang muncul dari dalam air biru (lautan) yang jernih. Mereka digambarkan sebagai pendukung yang tulus yang membantu menyebarkan pesan mimpi ini ketika orang-orang di Pakistan sendiri masih ragu. 
​Simbolisme Air Biru: Kemunculan dari air menyimbolkan kemurnian iman dan jarak geografis yang diseberangi oleh keimanan. Qasim diperlihatkan bahwa Allah SWT telah mempersiapkan hati orang-orang di wilayah ini untuk menerima pesannya lebih cepat daripada di tempat lain.
​Bantuan Logistik: Dalam mimpi lain, ia melihat orang-orang dari wilayah ini memberikan bantuan nyata (makanan, sumber daya) kepada Qasim dan pengikutnya saat mereka dalam kondisi sulit, menegaskan solidaritas trans-nasional umat Islam.
​9. Kesimpulan: Antara Harapan dan Peringatan
​Dokumen 'Mimpi Muhammad Qasim' menyajikan sebuah teologi harapan yang dibungkus dalam peringatan apokaliptik yang keras. Dokumen ini mendiagnosis kondisi umat Islam saat ini sebagai akibat langsung dari penyakit spiritual (Syirik) dan menawarkan obat yang radikal: pemurnian total dari ikonografi modern, penyatuan politik di bawah kepemimpinan yang ditunjuk Ilahi, dan persiapan militer untuk perang akhir zaman.
​Secara struktural, narasi ini sangat koheren. Ia menghubungkan kegagalan mikro seorang pemimpin politik (Imran Khan) dengan skenario makro perang dunia, menggunakan mimpi sebagai benang merah yang menjahit keduanya. Bagi para pengikutnya, dokumen ini bukan sekadar kumpulan mimpi, melainkan cetak biru (blueprint) masa depan yang menuntut aksi nyata: reformasi diri, penyebaran pesan, dan kesiapsiagaan menghadapi guncangan global yang akan datang.
​Intisari dari dokumen ini adalah bahwa keselamatan Pakistan—dan dengan ekstensi, Islam—tidak bergantung pada demokrasi, bantuan IMF, atau aliansi dengan Barat, melainkan pada kembalinya umat kepada Tauhid murni dan intervensi langsung dari Allah SWT melalui teknologi dan pertolongan yang tak terduga.
​Tabel Analisis Data dari Dokumen
​Berikut adalah ringkasan terstruktur mengenai prediksi utama dan statusnya berdasarkan narasi dokumen:
    
    `,

    welcomeMessage: "Halo! Saya Asisten bot MQ News Today, ada yang bisa dibantu?."
};

// --- 1. SYSTEM LOGIC (SEARCH ENGINE) ---
function cleanData(text) {
    return text.split('\n').filter(line => {
        const l = line.trim().toLowerCase();
        if (l.length < 20) return false;
        if (l.includes("login") || l.includes("register") || l.includes("copyright")) return false;
        return true;
    }).join('\n');
}

function findRelevantContext(query, fullText) {
    const cleanText = cleanData(fullText);
    const paragraphs = cleanText.split(/\n\s*\n/);
    const keywords = query.toLowerCase().split(" ").filter(w => w.length > 3);

    let hits = [];
    paragraphs.forEach(p => {
        let score = 0;
        keywords.forEach(kw => { if (p.toLowerCase().includes(kw)) score++; });
        if (score > 0) hits.push({ text: p, score: score });
    });

    hits.sort((a, b) => b.score - a.score);
    const topHits = hits.slice(0, 5).map(h => h.text).join("\n\n---\n\n");
    if (!topHits) return paragraphs.slice(0, 3).join("\n\n");
    return topHits;
}

// --- 2. LOGIC QUOTA & NOTIF ---
const STORAGE_KEY = "mq_bot_quota";
function checkQuota() {
    const today = new Date().toDateString();
    let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { date: today, count: 0 };
    if (data.date !== today) { data = { date: today, count: 0 }; localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    return data.count < CHAT_CONFIG.maxDailyLimit;
}
function incrementQuota() {
    const today = new Date().toDateString();
    let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { date: today, count: 0 };
    data.count++;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Notif Menggunakan Style CSS Lu
function triggerCustomNotif(message, type) {
    const toast = document.createElement("div");
    toast.innerText = message;
    // Pake var(--bg-card) dan var(--text-main) biar cocok sama tema
    toast.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: var(--bg-card, #fff); 
        color: ${type === 'error' ? '#ff4d4d' : 'var(--text-main, #333)'};
        border: 1px solid var(--border, #ccc);
        padding: 12px 24px; border-radius: 12px; z-index: 2147483647; 
        font-family: inherit; font-weight: bold;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// --- 3. UI GENERATOR (KAWIN DENGAN THEME.CSS) ---
document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        /* INI KUNCINYA: MENGGUNAKAN VARIABEL DARI theme.css */
        #mq-chat-wrapper {
            font-family: var(--font-body, 'Lato', sans-serif);
            
            /* Mapping Variable Local ke Variable Global Theme Lu */
            --c-bg: var(--bg-card, #ffffff);
            --c-text: var(--text-main, #334155);
            --c-primary: var(--primary, #9d1b1b);
            --c-input: var(--input-bg, #f8fafc);
            --c-border: var(--border, #e2e8f0);
            --c-muted: var(--text-muted, #64748b);
        }

        /* FAB (TOMBOL BULAT) */
        #mq-fab { 
            position: fixed; bottom: 30px; right: 20px; z-index: 9000; 
            background: var(--c-primary); color: #fff; 
            width: 60px; height: 60px; border-radius: 50%; 
            border: none; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3); 
            cursor: grab; display: flex; align-items: center; justify-content: center; 
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            touch-action: none;
        }
        #mq-fab:active { cursor: grabbing; transform: scale(0.9); }

        /* JENDELA CHAT */
        #mq-chat-window { 
            position: fixed; bottom: 0; right: 0; 
            width: 100%; max-width: 450px; height: 80vh; 
            
            /* BACKGROUND IKUT TEMA */
            background: var(--c-bg); 
            color: var(--c-text);
            border-top: 1px solid var(--c-border);
            border-left: 1px solid var(--c-border);
            border-right: 1px solid var(--c-border);
            
            border-radius: 24px 24px 0 0; 
            box-shadow: 0 -10px 40px rgba(0,0,0,0.2); 
            display: flex; flex-direction: column; z-index: 9001; 
            
            transform: translateY(120%); 
            transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        }
        #mq-chat-window.show { transform: translateY(0); }

        /* HEADER */
        .chat-header { 
            padding: 15px 20px; 
            border-bottom: 1px solid var(--c-border);
            display: flex; justify-content: space-between; align-items: center; 
            background: var(--c-bg); 
            border-radius: 24px 24px 0 0;
        }
        .chat-title { font-weight: 700; color: var(--c-primary); font-size: 1.1em; font-family: 'Cinzel', serif; }
        .chat-close { cursor: pointer; color: var(--c-muted); font-size: 1.5em; }

        /* DISCLAIMER */
        .chat-alert-note {
            font-size: 0.8em;
            background: rgba(197, 160, 89, 0.15); /* Warna Gold Transparan */
            color: var(--c-text);
            padding: 10px 20px;
            text-align: center;
            border-bottom: 1px solid var(--c-border);
            line-height: 1.4;
        }

        /* BODY */
        .chat-body { flex: 1; padding: 20px; overflow-y: auto; background: var(--c-bg); }

        /* FOOTER & INPUT */
        .chat-footer { padding: 15px; display: flex; gap: 10px; align-items: center; background: var(--c-bg); border-top: 1px solid var(--c-border); }
        .chat-input { 
            flex: 1; padding: 12px 20px; 
            border: 1px solid var(--c-border); border-radius: 30px; 
            outline: none; font-size: 1em; 
            background: var(--c-input); /* INI PENTING BUAT DARK MODE */
            color: var(--c-text);
        }
        .chat-input:focus { border-color: var(--c-primary); }
        .chat-send { 
            background: var(--c-primary); color: #fff; 
            border: none; width: 45px; height: 45px; border-radius: 50%; 
            cursor: pointer; display: flex; align-items: center; justify-content: center; 
        }

        /* BUBBLES */
        .msg-bubble { max-width: 85%; padding: 12px 16px; border-radius: 18px; margin-bottom: 12px; line-height: 1.5; word-wrap: break-word; }
        .msg-user { background: var(--c-primary); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
        
        .msg-bot { 
            background: var(--c-input); /* Abu muda di light, Hitam pekat di dark */
            color: var(--c-text); 
            align-self: flex-start; 
            border-bottom-left-radius: 4px; 
            border: 1px solid var(--c-border); 
        }

        @media (min-width: 481px) {
            #mq-chat-window { right: 20px; bottom: 0; width: 400px; border-radius: 24px 24px 0 0; }
        }
    `;
    document.head.appendChild(style);

    const html = `
        <div id="mq-chat-wrapper">
            <div id="mq-chat-window">
                <div class="chat-header">
                    <span class="chat-title">MQ Assistant</span>
                    <span id="close-chat" class="chat-close">&times;</span>
                </div>
                <div class="chat-alert-note">
                    ⚠️ <b>Penting:</b> Informasi bot ini mungkin tidak lengkap. Harap cek kembali ke sumber dokumen yang terpercaya.
                </div>
                <div id="chat-history" class="chat-body" style="display:flex; flex-direction:column;">
                    <div class="msg-bubble msg-bot">${CHAT_CONFIG.welcomeMessage}</div>
                </div>
                <div class="chat-footer">
                    <input type="text" id="chat-input" class="chat-input" placeholder="Tanya sesuatu...">
                    <button id="send-btn" class="chat-send">➤</button>
                </div>
            </div>
            <button id="mq-fab">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    // --- LOGIC TOMBOL GESER ---
    const fab = document.getElementById('mq-fab');
    let isDragging = false, startX, startY;

    function startDrag(e) {
        isDragging = false;
        const touch = e.type.includes('mouse') ? e : e.touches[0];
        startX = touch.clientX; startY = touch.clientY;
        const rect = fab.getBoundingClientRect();
        fab.style.bottom = 'auto'; fab.style.right = 'auto';
        fab.style.left = rect.left + 'px'; fab.style.top = rect.top + 'px';
        fab.style.transition = 'none';
        setTimeout(() => isDragging = true, 150);
    }
    function moveDrag(e) {
        if (!e.buttons && !e.touches) return;
        e.preventDefault(); isDragging = true;
        const touch = e.type.includes('mouse') ? e : e.touches[0];
        fab.style.left = (parseFloat(fab.style.left) + (touch.clientX - startX)) + 'px';
        fab.style.top = (parseFloat(fab.style.top) + (touch.clientY - startY)) + 'px';
        startX = touch.clientX; startY = touch.clientY;
    }
    function endDrag() { fab.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'; }

    fab.addEventListener('mousedown', startDrag); fab.addEventListener('touchstart', startDrag);
    document.addEventListener('mousemove', moveDrag); document.addEventListener('touchmove', moveDrag);
    document.addEventListener('mouseup', endDrag); document.addEventListener('touchend', endDrag);

    // --- LOGIC CHAT ---
    const chatWindow = document.getElementById('mq-chat-window');
    const input = document.getElementById('chat-input');
    const history = document.getElementById('chat-history');

    document.getElementById('mq-fab').addEventListener('click', () => {
        if (!isDragging) { chatWindow.classList.add('show'); setTimeout(() => input.focus(), 300); }
        isDragging = false;
    });
    document.getElementById('close-chat').addEventListener('click', () => chatWindow.classList.remove('show'));

    // --- SYNC DARK MODE (INIT) ---
    // Cek apakah user udah set dark mode sebelumnya dari LocalStorage
    // Sebenarnya CSS Variable udah otomatis handle, tapi ini buat memastikan
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;
        if (!checkQuota()) { triggerCustomNotif("Kuota harian habis.", "error"); return; }

        input.value = "";
        history.innerHTML += `<div class="msg-bubble msg-user">${text}</div>`;
        history.scrollTop = history.scrollHeight;

        const loadId = "load-" + Date.now();
        history.innerHTML += `<div id="${loadId}" class="msg-bubble msg-bot" style="opacity:0.6">Sedang mengetik...</div>`;
        history.scrollTop = history.scrollHeight;

        try {
            const relevantData = findRelevantContext(text, CHAT_CONFIG.rawKnowledgeBase);
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${CHAT_CONFIG.apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: `Kamu asisten MQ News. Jawab user berdasar data ini (Bahasa Indo):\n\n${relevantData}` },
                        { role: "user", content: text }
                    ],
                    model: CHAT_CONFIG.model,
                    temperature: 0.3, max_tokens: 1024
                })
            });

            if (!response.ok) throw new Error("Gagal koneksi");
            const data = await response.json();
            const reply = data.choices[0].message.content;

            document.getElementById(loadId).remove();
            history.innerHTML += `<div class="msg-bubble msg-bot">${reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')}</div>`;
            incrementQuota();
        } catch (error) {
            document.getElementById(loadId).remove();
            triggerCustomNotif("Gagal: " + error.message, "error");
        }
        history.scrollTop = history.scrollHeight;
    }

    document.getElementById('send-btn').onclick = sendMessage;
    input.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });
});

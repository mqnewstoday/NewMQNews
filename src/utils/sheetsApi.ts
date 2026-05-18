// Google Sheets API utilities
// Fetches data from Google Spreadsheet CSV exports for Berita, Audio, and Mubasyirat

const SPREADSHEET_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTOAltvE7tpJsTkKbqMoqLZe-7K9cGk_uPUqeigV7qvWUm5crdAiOJ_hNAvchnjNrE8cA0F-ybuZhKd/pub';

const SHEET_URLS = {
  berita: `${SPREADSHEET_BASE}?gid=0&single=true&output=csv`,
  audio: `${SPREADSHEET_BASE}?gid=1549454662&single=true&output=csv`,
  mubasyirat: `${SPREADSHEET_BASE}?gid=703095600&single=true&output=csv`,
  banners: `${SPREADSHEET_BASE}?gid=530510330&single=true&output=csv`,
  pdfBooks: `${SPREADSHEET_BASE}?gid=1024621830&single=true&output=csv`,
};

// ============================================================
// Types
// ============================================================

export interface BannerItem {
  image_url: string;
  caption: string;
  link_url: string;
}

export interface PdfBookItem {
  id: string;
  name: string;
  pdfUrl: string;
  imageUrl: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  imageUrl: string;
  excerpt: string;
  content: string;
  publishDate: string;
  author: string;
  featured: boolean;
  sourceUrl?: string;
  audioUrl?: string;
}

export interface AudioItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  embedLink: string;
}

export interface MubasyiratItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  audioUrl?: string;
  category?: string;
  year?: string;
}

// ============================================================
// CSV Parsing
// ============================================================

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// ============================================================
// Berita (News) Fetcher
// ============================================================

/**
 * Extract a readable title from a text block
 */
function extractTitle(text: string): string {
  // Try to find a markdown link title first
  const linkMatch = text.match(/\[([^\]]+)\]\(/);
  if (linkMatch) return linkMatch[1].substring(0, 120);
  
  // Otherwise use first sentence or first 120 chars
  const firstSentence = text.split(/[.!?]\s/)[0];
  if (firstSentence && firstSentence.length <= 120) return firstSentence;
  return text.substring(0, 120).trim() + '...';
}

/**
 * Extract URL from markdown link or plain URL
 */
function extractUrl(text: string): string {
  const mdLink = text.match(/\[.*?\]\((https?:\/\/[^)]+)\)/);
  if (mdLink) return mdLink[1];
  const plainUrl = text.match(/(https?:\/\/[^\s\)]+)/);
  if (plainUrl) return plainUrl[1];
  return '';
}

/**
 * Generate slug from title
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
    .replace(/^-+|-+$/g, '');
}

/**
 * Fetch and parse Berita (news articles) from spreadsheet.
 * CSV Headers: Judul, Kategori, Tanggal, Isi, Gambar, VideoType, VideoID, Audio
 */
export async function fetchBerita(): Promise<Article[]> {
  try {
    const res = await fetch(SHEET_URLS.berita, { next: { revalidate: 3 } });
    if (!res.ok) return getDemoArticles();
    
    const csvText = await res.text();
    
    // Parse CSV properly - the data has headers and quoted fields
    const rows = parseCSVToRows(csvText);
    if (rows.length < 2) return getDemoArticles();
    
    // First row is headers
    const headers = rows[0].map(h => h.trim().toLowerCase());
    const juduIdx = headers.indexOf('judul');
    const katIdx = headers.indexOf('kategori');
    const tglIdx = headers.indexOf('tanggal');
    const isiIdx = headers.indexOf('isi');
    const imgIdx = headers.indexOf('gambar');
    const vidTypeIdx = headers.indexOf('videotype');
    const vidIdIdx = headers.indexOf('videoid');
    const penulisIdx = headers.indexOf('penulis');
    const audioIdx = headers.indexOf('audio');
    
    const articles: Article[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const title = (juduIdx >= 0 ? row[juduIdx] : '').trim();
      if (!title || title.length < 5) continue;
      
      const category = (katIdx >= 0 ? row[katIdx] : 'Geopolitik').trim();
      const tanggal = (tglIdx >= 0 ? row[tglIdx] : '').trim();
      const isi = (isiIdx >= 0 ? row[isiIdx] : '').trim();
      const gambar = (imgIdx >= 0 ? row[imgIdx] : '').trim();
      const videoType = (vidTypeIdx >= 0 ? row[vidTypeIdx] : '').trim();
      const videoId = (vidIdIdx >= 0 ? row[vidIdIdx] : '').trim();
      const penulis = (penulisIdx >= 0 ? row[penulisIdx] : '').trim();
      const audioUrl = (audioIdx >= 0 ? row[audioIdx] : '').trim();
      
      const slug = slugify(title);
      
      // Strip HTML for excerpt
      const excerpt = isi
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .substring(0, 200)
        .trim() + '...';
      
      // Use first category if multiple
      const primaryCategory = category.split(',')[0].trim();
      
      // Fallback image
      const imageUrl = gambar || `https://picsum.photos/800/450?random=${i}`;
      
      // If Penulis is present in Sheets, use it; otherwise fallback to 'Redaksi MQ News Today'
      const author = penulis ? penulis : 'Redaksi MQ News Today';
      
      articles.push({
        id: String(i),
        title,
        slug: slug || `berita-${i}`,
        category: primaryCategory || 'Geopolitik',
        imageUrl,
        excerpt,
        content: isi,
        publishDate: tanggal || new Date().toISOString().split('T')[0],
        author,
        featured: i >= rows.length - 3, // Mark the 3 newest articles (at the bottom of the sheet) as featured
        sourceUrl: videoType === 'youtube' && videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined,
        audioUrl: audioUrl || undefined,
      });
    }
    
    // Reverse the articles array so that the newest articles (bottom of the sheet) appear first
    const newestFirstArticles = articles.reverse();
    return newestFirstArticles.length > 0 ? newestFirstArticles : getDemoArticles();
  } catch (error) {
    console.error('Error fetching berita:', error);
    return getDemoArticles();
  }
}

/**
 * Parse full CSV text into rows of string arrays.
 * Handles quoted fields, newlines within quotes, etc.
 */
function parseCSVToRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // Skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      if (char === '\r') i++; // Skip \r in \r\n
      currentRow.push(currentField);
      if (currentRow.some(f => f.trim())) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  // Push last row
  currentRow.push(currentField);
  if (currentRow.some(f => f.trim())) {
    rows.push(currentRow);
  }
  
  return rows;
}

// ============================================================
// Audio Fetcher
// ============================================================

/**
 * Fetch audio collection from spreadsheet.
 * Headers: Judul, Deskripsi, Thumbnail, Embed_Link
 */
export async function fetchAudio(): Promise<AudioItem[]> {
  try {
    const res = await fetch(SHEET_URLS.audio, { next: { revalidate: 3 } });
    if (!res.ok) return getDemoAudio();
    
    const csvText = await res.text();
    const rows = parseCSVToRows(csvText);
    
    if (rows.length < 2) return getDemoAudio();
    
    // First row is headers: Judul,Deskripsi,Thumbnail,Embed_Link
    const items: AudioItem[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 4) continue;
      
      const [title, description, thumbnail, embedLink] = row;
      if (!title?.trim() || !embedLink?.trim()) continue;
      
      items.push({
        id: String(i),
        title: title.trim(),
        description: description.trim(),
        thumbnail: thumbnail.trim(),
        embedLink: embedLink.trim(),
      });
    }
    
    return items.length > 0 ? items : getDemoAudio();
  } catch (error) {
    console.error('Error fetching audio:', error);
    return getDemoAudio();
  }
}

// ============================================================
// Mubasyirat Fetcher
// ============================================================

/**
 * Fetch Mubasyirat (dream narratives) from spreadsheet.
 * CSV Headers: Judul, Thumbnail, Gambar, Narasi, Audio, Kategori, Tahun
 */
export async function fetchMubasyirat(): Promise<MubasyiratItem[]> {
  try {
    const res = await fetch(SHEET_URLS.mubasyirat, { next: { revalidate: 3 } });
    if (!res.ok) return getDemoMubasyirat();
    
    const csvText = await res.text();
    const rows = parseCSVToRows(csvText);
    
    if (rows.length < 2) return getDemoMubasyirat();
    
    // First row is headers
    const headers = rows[0].map(h => h.trim().toLowerCase());
    const judulIdx = headers.indexOf('judul');
    const thumbIdx = headers.indexOf('thumbnail');
    const gambarIdx = headers.indexOf('gambar');
    const narasiIdx = headers.indexOf('narasi');
    const audioIdx = headers.indexOf('audio');
    const katIdx = headers.indexOf('kategori');
    const tahunIdx = headers.indexOf('tahun');
    
    const items: MubasyiratItem[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const title = (judulIdx >= 0 ? row[judulIdx] : '').trim();
      if (!title || title.length < 3) continue;
      
      const thumbnail = (thumbIdx >= 0 ? row[thumbIdx] : '').trim();
      const gambar = (gambarIdx >= 0 ? row[gambarIdx] : '').trim();
      const narasi = (narasiIdx >= 0 ? row[narasiIdx] : '').trim();
      const audio = (audioIdx >= 0 ? row[audioIdx] : '').trim();
      const kategori = (katIdx >= 0 ? row[katIdx] : '').trim();
      const tahun = (tahunIdx >= 0 ? row[tahunIdx] : '').trim();
      
      // Strip HTML for excerpt
      const excerpt = narasi
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .substring(0, 200)
        .trim() + '...';
      
      const imageUrl = thumbnail || gambar || `https://picsum.photos/400/400?random=${i + 100}`;
      
      items.push({
        id: String(i),
        title,
        excerpt,
        content: narasi,
        imageUrl,
        audioUrl: audio || undefined,
        category: kategori || undefined,
        year: tahun || undefined,
      });
    }
    
    return items.length > 0 ? items : getDemoMubasyirat();
  } catch (error) {
    console.error('Error fetching mubasyirat:', error);
    return getDemoMubasyirat();
  }
}

// ============================================================
// PDF Books Fetcher
// ============================================================
export async function fetchPdfBooks(): Promise<PdfBookItem[]> {
  try {
    const res = await fetch(SHEET_URLS.pdfBooks, { next: { revalidate: 3 } });
    if (!res.ok) return getDemoPdfBooks();
    
    const csvText = await res.text();
    const rows = parseCSVToRows(csvText);
    
    if (rows.length < 2) return getDemoPdfBooks();
    
    const items: PdfBookItem[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 3) continue;
      
      const [name, pdfUrl, imageUrl] = row;
      if (!name?.trim() || !pdfUrl?.trim()) continue;
      
      items.push({
        id: String(i),
        name: name.trim(),
        pdfUrl: pdfUrl.trim(),
        imageUrl: imageUrl.trim(),
      });
    }
    
    return items.length > 0 ? items : getDemoPdfBooks();
  } catch (error) {
    console.error('Error fetching pdf books:', error);
    return getDemoPdfBooks();
  }
}

function getDemoPdfBooks(): PdfBookItem[] {
  return [
    {
      id: '1',
      name: 'PDF Mimpi MQ Indo/Malay',
      pdfUrl: 'https://drive.google.com/file/d/1fBF42LsLoOpRcC2P11oez0SbomCDpZxB/view?usp=drive_link',
      imageUrl: 'https://i.ibb.co.com/Q70J4Dbs/V-indo.png'
    },
    {
      id: '2',
      name: 'PDF Mimpi Sumber Langsung English',
      pdfUrl: 'https://drive.google.com/file/d/1RfL9BGDy2LutOpMJ7Sh-q1iA1TRcYHmv/view?usp=drive_link',
      imageUrl: 'https://i.ibb.co.com/fGpsP6Sv/V-ENGREV.png'
    },
    {
      id: '3',
      name: 'PDF Mimpi Sumber Langsung English Original',
      pdfUrl: 'https://drive.google.com/file/d/11TmYvrp77ZffhjJJ3JcxC-0PSgsGlzmR/view?usp=drive_link',
      imageUrl: 'https://i.ibb.co.com/MkPkpwnV/V-ENGORI.png'
    }
  ];
}

// ============================================================
// Legacy fetchArticles (compatibility)
// ============================================================
export async function fetchArticles(): Promise<Article[]> {
  return fetchBerita();
}

export async function fetchFeaturedArticles(): Promise<Article[]> {
  const articles = await fetchBerita();
  return articles.filter(a => a.featured);
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const articles = await fetchBerita();
  return articles.find(a => a.slug === slug) || null;
}

export async function fetchArticlesByCategory(category: string): Promise<Article[]> {
  const articles = await fetchBerita();
  return articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
}

export async function fetchCategories(): Promise<string[]> {
  const articles = await fetchBerita();
  const categories = new Set(articles.map(a => a.category));
  return Array.from(categories).filter(Boolean);
}

export async function fetchBanners(): Promise<BannerItem[]> {
  try {
    const res = await fetch(SHEET_URLS.banners, { next: { revalidate: 3 } });
    if (!res.ok) return getDemoBanners();
    
    const csvText = await res.text();
    const rows = parseCSVToRows(csvText);
    
    if (rows.length < 2) return getDemoBanners();
    
    const headers = rows[0].map(h => h.trim().toLowerCase());
    const imgIdx = headers.indexOf('image_url');
    const capIdx = headers.indexOf('caption');
    const linkIdx = headers.indexOf('link_url');
    
    const banners: BannerItem[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const imageUrl = (imgIdx >= 0 ? row[imgIdx] : '').trim();
      if (!imageUrl) continue;
      
      const caption = (capIdx >= 0 ? row[capIdx] : '').trim();
      const linkUrl = (linkIdx >= 0 ? row[linkIdx] : '').trim();
      
      banners.push({
        image_url: imageUrl,
        caption,
        link_url: linkUrl,
      });
    }
    
    return banners.length > 0 ? banners : getDemoBanners();
  } catch (error) {
    console.error('Error fetching banners:', error);
    return getDemoBanners();
  }
}

function getDemoBanners(): BannerItem[] {
  return [
    {
      image_url: 'https://i.ibb.co.com/chcwypkp/Al-Mubasyirat-20251229-063333-0000.png',
      caption: 'Mubashiraat',
      link_url: 'https://muhammadqasimpk.org/id'
    },
    {
      image_url: 'https://i.ibb.co.com/SDq75MKV/Al-Mubasyirat-20251229-072635-0000.png',
      caption: 'Mukjizat',
      link_url: 'https://casereportsinregrowth.com'
    },
    {
      image_url: 'https://i.ibb.co.com/9329pCzs/ELIMINATE-20260227-230951-0000.png',
      caption: '19 Pesan Tauhid',
      link_url: 'pesan-tauhid.html'
    }
  ];
}

// ============================================================
// Demo Data (Fallbacks)
// ============================================================

export function getDemoArticles(): Article[] {
  return [
    {
      id: '1',
      title: 'Aliansi Tiga Negara dan Nubuat Akhir Zaman: Membaca Manuver Turki, Arab Saudi, dan Pakistan',
      slug: 'aliansi-tiga-negara-nubuat-akhir-zaman',
      category: 'Geopolitik',
      imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80',
      excerpt: 'Panggung geopolitik dunia dikejutkan oleh wacana pembentukan pakta pertahanan militer antara tiga negara kuat Islam: Turki, Arab Saudi, dan Pakistan.',
      content: '<p>Panggung geopolitik dunia dikejutkan oleh wacana pembentukan pakta pertahanan militer antara tiga negara kuat Islam.</p>',
      publishDate: '2026-05-18',
      author: 'Redaksi MQ News Today',
      featured: true,
    },
    {
      id: '2',
      title: 'Karpet Merah Netanyahu untuk Modi di Israel, Bukti Nyata Skenario Akhir Zaman',
      slug: 'karpet-merah-netanyahu-modi-israel',
      category: 'Timur Tengah',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      excerpt: 'Karpet merah digelar, pelukan hangat dipertontonkan di hadapan kamera dunia. Analisis mendalam tentang hubungan India-Israel.',
      content: '<p>Karpet merah digelar, pelukan hangat dipertontonkan di hadapan kamera dunia.</p>',
      publishDate: '2026-05-17',
      author: 'Redaksi MQ News Today',
      featured: true,
    },
    {
      id: '3',
      title: 'Kabul Dibombardir, Api Perang Menyala di Perbatasan Pakistan-Afghanistan',
      slug: 'kabul-dibombardir-api-perang-pakistan-afghanistan',
      category: 'Geopolitik',
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
      excerpt: 'Tensi geopolitik Asia Selatan baru saja meledak ke titik yang paling mengkhawatirkan.',
      content: '<p>Tensi geopolitik Asia Selatan baru saja meledak ke titik yang paling mengkhawatirkan.</p>',
      publishDate: '2026-05-16',
      author: 'Redaksi MQ News Today',
      featured: true,
    },
    {
      id: '4',
      title: 'Keprihatinan China atas Perang Perbatasan Pakistan-Afghanistan',
      slug: 'keprihatinan-china-perang-perbatasan',
      category: 'Geopolitik',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
      excerpt: 'Beijing secara resmi menyatakan keprihatinan mendalam atas eskalasi militer antara kedua negara.',
      content: '<p>Beijing secara resmi menyatakan keprihatinan mendalam atas eskalasi militer.</p>',
      publishDate: '2026-05-15',
      author: 'Redaksi MQ News Today',
      featured: false,
    },
    {
      id: '5',
      title: 'Misteri Ribuan Jasad Menguap di Gaza: Bukti Senjata Termal?',
      slug: 'misteri-ribuan-jasad-menguap-gaza',
      category: 'Timur Tengah',
      imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
      excerpt: 'Laporan investigasi mendalam mengungkap kengerian di luar batas kemanusiaan di Jalur Gaza.',
      content: '<p>Laporan investigasi mendalam mengungkap kengerian di luar batas kemanusiaan di Jalur Gaza.</p>',
      publishDate: '2026-05-14',
      author: 'Redaksi MQ News Today',
      featured: false,
    },
    {
      id: '6',
      title: 'Tumbal Besar di Teheran: Kematian Khamenei dan Jeratan Teknologi Setan',
      slug: 'tumbal-besar-teheran-kematian-khamenei',
      category: 'Timur Tengah',
      imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80',
      excerpt: 'Dunia baru saja menyaksikan guncangan hebat yang mengubah wajah Timur Tengah selamanya.',
      content: '<p>Dunia baru saja menyaksikan guncangan hebat yang mengubah wajah Timur Tengah selamanya.</p>',
      publishDate: '2026-05-13',
      author: 'Redaksi MQ News Today',
      featured: false,
    },
  ];
}

function getDemoAudio(): AudioItem[] {
  return [
    {
      id: '1',
      title: 'Pidato 1 Part 1 Dub Indo',
      description: 'Cerita Muhammad Qasim dalam Pidato Pertamanya',
      thumbnail: 'https://i.ibb.co.com/s9JH61MK/MQN-img-Pidato1-Part1.png',
      embedLink: 'https://cdn.jsdelivr.net/gh/mqnewstoday/audio-mq/MQNT_Pidato1_Part1.mp3',
    },
    {
      id: '2',
      title: 'Pidato 1 Part 2 Dub Indo',
      description: 'Nabi Hancurkan Patung Bukan Karena Urusan Pribadi Tapi Perintah',
      thumbnail: 'https://i.ibb.co.com/jcynH25/MQN-img-Pidato1-Part2.png',
      embedLink: 'https://cdn.jsdelivr.net/gh/mqnewstoday/audio-mq/MQNT_Pidato1_Part2.mp3',
    },
    {
      id: '3',
      title: 'Pidato 1 Part 3 Dub Indo',
      description: 'Peristiwa-Peristiwa Akhir Zaman dan Sebuah Jawaban',
      thumbnail: 'https://i.ibb.co.com/3yg5dCN5/MQN-img-Pidato1-Part3.png',
      embedLink: 'https://cdn.jsdelivr.net/gh/mqnewstoday/audio-mq/MQNT_Pidato1_Part3.mp3',
    },
    {
      id: '4',
      title: 'Pidato 2 Part 1 Dub Indo',
      description: 'Muhammad Qasim Ceritakan Adab Kisah Nabi Muhammad dengan Wanita Gila',
      thumbnail: 'https://i.ibb.co.com/9m6ZgXN8/MQN-img-Pidato2-Part1.png',
      embedLink: 'https://cdn.jsdelivr.net/gh/mqnewstoday/audio-mq/MQNT_Pidato2_Part1.mp3',
    },
  ];
}

function getDemoMubasyirat(): MubasyiratItem[] {
  return [
    {
      id: '1',
      title: 'Cahaya Allah dan Kemenangan Umat Islam',
      excerpt: 'Aku melihat mimpi ini pada tahun 2015. Saat aku terbangun dari mimpi yang luar biasa ini, aku merasakan harapan besar...',
      content: 'Aku melihat mimpi ini pada tahun 2015. Saat aku terbangun, aku merasakan harapan besar bagi umat Islam.',
      imageUrl: 'https://picsum.photos/400/400?random=101',
    },
    {
      id: '2',
      title: 'Muhammad Qasim Dan Empat Bulan',
      excerpt: 'Muhammad Qasim melihat bahwa kegelapan ada dimana-mana termasuk langit. Sebuah mesin besar melintasi langit...',
      content: 'Muhammad Qasim melihat bahwa kegelapan ada dimana-mana termasuk juga langit.',
      imageUrl: 'https://picsum.photos/400/400?random=102',
    },
    {
      id: '3',
      title: 'Kemenangan Pertama',
      excerpt: 'Pada 04 Desember 2014, Allah telah memperlihatkan bahwa dua dari tiga benteng telah dihancurkan oleh pasukan jahat...',
      content: 'Pada 04 Desember 2014, Allah telah memperlihatkan kepadaku bahwa dua dari tiga benteng telah dihancurkan.',
      imageUrl: 'https://picsum.photos/400/400?random=103',
    },
    {
      id: '4',
      title: 'Rangkaian Peristiwa di Masa Depan',
      excerpt: 'Aku telah melihat di banyak mimpi betapa Islam dan umat Muslim akan bangkit lagi ke seluruh dunia...',
      content: 'Aku telah melihat di banyak mimpi betapa islam dan umat muslim akan bangkit lagi ke seluruh dunia.',
      imageUrl: 'https://picsum.photos/400/400?random=104',
    },
  ];
}

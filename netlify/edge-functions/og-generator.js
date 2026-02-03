export default async (request, context) => {
    const url = new URL(request.url);

    // 1. Ambil Parameter Title dari URL
    const titleParam = url.searchParams.get("title");

    // Jika tidak ada title, biarkan loading biasa (default CSR)
    if (!titleParam) {
        return context.next();
    }

    // 2. Ambil Data CSV dari Google Sheets (Published to Web URL)
    // Menggunakan URL 'published' agar konsisten dengan client-side dan tidak butuh login
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTOAltvE7tpJsTkKbqMoqLZe-7K9cGk_uPUqeigV7qvWUm5crdAiOJ_hNAvchnjNrE8cA0F-ybuZhKd/pub?gid=0&single=true&output=csv";

    // Tambahkan timestamp untuk menghindari caching agresif dari Google
    const fetchUrl = csvUrl + "&t=" + Date.now();

    try {
        const csvResponse = await fetch(fetchUrl);

        // Cek jika response bukan OK
        if (!csvResponse.ok) {
            console.log("Error fetching CSV:", csvResponse.status);
            return context.next();
        }

        const csvText = await csvResponse.text();

        // 3. Parsing CSV Sederhana
        const rows = csvText.split("\n");
        if (rows.length < 2) return context.next(); // Data kosong

        const headers = parseCSVRow(rows[0]);

        // Cari index kolom
        const titleIdx = headers.findIndex(h => h.toLowerCase() === 'judul' || h.toLowerCase() === 'title');
        const imgIdx = headers.findIndex(h => h.toLowerCase() === 'gambar' || h.toLowerCase() === 'image' || h.toLowerCase() === 'thumbnail');
        const dateIdx = headers.findIndex(h => h.toLowerCase() === 'tanggal' || h.toLowerCase() === 'date');

        if (titleIdx === -1) return context.next();

        // 4. Cari Artikel yang Cocok (Improved Fuzzy Matching)
        let foundArticle = null;

        // Buat slug dari parameter URL (hapus simbol, lowercase)
        const normalize = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const targetSlug = normalize(titleParam);

        for (let i = 1; i < rows.length; i++) {
            const rowData = parseCSVRow(rows[i]);
            // Pastikan baris memiliki data di kolom title
            if (!rowData[titleIdx]) continue;

            const rowSlug = normalize(rowData[titleIdx]);

            // Cek apakah slug cocok (atau salah satu mengandung yang lain jika terjadi pemotongan)
            if (rowSlug === targetSlug || (rowSlug.length > 10 && targetSlug.length > 10 && rowSlug.includes(targetSlug))) {
                foundArticle = {
                    title: rowData[titleIdx].trim(),
                    image: (rowData[imgIdx] || "").trim(),
                    date: (rowData[dateIdx] || "").trim()
                };
                break;
            }
        }

        if (!foundArticle) return context.next();

        // 5. Modifikasi HTML Response
        const response = await context.next();
        const pageToModify = await response.text();

        let updatedPage = pageToModify;

        // Helper untuk replace meta tag dengan aman (case insensitive)
        const replaceMeta = (property, content) => {
            const regex = new RegExp(`<meta\\s+property=["']${property}["']\\s+content=["'].*?["']\\s*\\/?>`, 'i');
            updatedPage = updatedPage.replace(regex, `<meta property="${property}" content="${content}">`);
        };

        // A. Title Page
        updatedPage = updatedPage.replace(/<title>[\s\S]*?<\/title>/i, `<title>${foundArticle.title} - MQ News Today</title>`);

        // B. Open Graph Tags
        replaceMeta('og:title', foundArticle.title);

        const desc = `Baca selengkapnya tentang ${foundArticle.title}. ${foundArticle.date}`;
        replaceMeta('og:description', desc);

        // Link Gambar (Fallback ke logo jika kosong)
        let imgUrl = foundArticle.image;
        if (!imgUrl || imgUrl.length < 5) {
            imgUrl = "https://mqnewstoday.my.id/ALT_LogoMQN.png";
        }
        replaceMeta('og:image', imgUrl);

        // C. Twitter Card Tags (biasanya name="twitter:...")
        updatedPage = updatedPage.replace(
            /<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/i,
            `<meta name="twitter:image" content="${imgUrl}">`
        );

        updatedPage += "\n<!-- Processed by Netlify Edge Functions -->";

        return new Response(updatedPage, response);

    } catch (error) {
        console.log("Edge Function Exception:", error);
        return context.next();
    }
};

function parseCSVRow(row) {
    const result = [];
    let cell = "";
    let inQuote = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(cell.replace(/^"|"$/g, '').trim()); // Clean quotes
            cell = "";
        } else {
            cell += char;
        }
    }
    result.push(cell.replace(/^"|"$/g, '').trim());
    return result;
}

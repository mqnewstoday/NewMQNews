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

        const csvText = (await csvResponse.text()).replace(/^\uFEFF/, '');

        // 3. Parsing CSV Robust (Handle Newlines inside Quotes)
        const parseCSV = (text) => {
            const arr = [];
            let quote = false;
            let row = [];
            let col = '';
            for (let c = 0; c < text.length; c++) {
                const char = text[c];
                const next = text[c + 1];

                if (char === '"') {
                    if (quote && next === '"') { // Escaped quote
                        col += '"';
                        c++;
                    } else {
                        quote = !quote;
                    }
                } else if (char === ',' && !quote) {
                    row.push(col);
                    col = '';
                } else if ((char === '\r' || char === '\n') && !quote) {
                    // Handle CRLF or just LF or CR
                    if (char === '\r' && next === '\n') c++;
                    row.push(col);
                    col = '';
                    if (row.length > 0) arr.push(row);
                    row = [];
                } else {
                    col += char;
                }
            }
            if (col || row.length > 0) {
                row.push(col);
                arr.push(row);
            }
            return arr;
        };

        const rows = parseCSV(csvText);
        if (rows.length < 2) return context.next();

        const headers = rows[0];
        // Helper parseCSVRow is no longer needed but we keep interface consistent
        // We now iterate 'rows' directly which are already arrays.

        // Cari index kolom
        const titleIdx = headers.findIndex(h => h.trim().toLowerCase() === 'judul' || h.trim().toLowerCase() === 'title');
        const imgIdx = headers.findIndex(h => h.trim().toLowerCase() === 'gambar' || h.trim().toLowerCase() === 'image' || h.trim().toLowerCase() === 'thumbnail');
        const dateIdx = headers.findIndex(h => h.trim().toLowerCase() === 'tanggal' || h.trim().toLowerCase() === 'date');

        // ... (existing helper functions) ...

        if (titleIdx === -1) return context.next();

        // 4. Cari Artikel yang Cocok (Improved Fuzzy Matching)
        let foundArticle = null;

        // Buat slug dari parameter URL (hapus simbol, lowercase)
        const normalize = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const targetSlug = normalize(titleParam);

        for (let i = 1; i < rows.length; i++) {
            const rowData = rows[i]; // Sudah diparse jadi array
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

        // Helper untuk replace meta tag dengan aman (bisa property atau name)
        const replaceMeta = (key, content) => {
            const regex = new RegExp(`<meta\\s+(property|name)=["']${key}["']\\s+content=["'].*?["']\\s*\\/?>`, 'i');
            const attr = key.startsWith('twitter:') ? 'name' : 'property';
            updatedPage = updatedPage.replace(regex, `<meta ${attr}="${key}" content="${content}">`);
        };

        // A. Title Page
        updatedPage = updatedPage.replace(/<title>[\s\S]*?<\/title>/i, `<title>${foundArticle.title} - MQ News Today</title>`);

        // B. Open Graph Tags
        replaceMeta('og:title', foundArticle.title);

        let imgUrl = foundArticle.image;

        // Validasi URL Gambar
        if (imgIdx === -1 || !imgUrl) {
            imgUrl = "https://mqnewstoday.my.id/ALT_LogoMQN.png";
        } else if (imgUrl.length < 5) {
            imgUrl = "https://mqnewstoday.my.id/ALT_LogoMQN.png";
        }

        // Build Deskripsi Tanpa Debug Message (Clean Version)
        const desc = `Baca selengkapnya tentang ${foundArticle.title}. ${foundArticle.date}`;
        replaceMeta('og:description', desc);

        // Link Gambar
        replaceMeta('og:image', imgUrl);

        // C. Twitter Card Tags (Explicit Replacements)
        replaceMeta('twitter:title', foundArticle.title);
        replaceMeta('twitter:description', desc);
        replaceMeta('twitter:image', imgUrl);

        updatedPage += "\n<!-- Processed by Netlify Edge Functions -->";

        return new Response(updatedPage, response);

    } catch (error) {
        console.log("Edge Function Exception:", error);
        return context.next();
    }
};

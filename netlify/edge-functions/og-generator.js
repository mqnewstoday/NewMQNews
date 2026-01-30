import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

export default async (request, context) => {
    const url = new URL(request.url);

    // 1. Ambil Parameter Title dari URL
    const titleParam = url.searchParams.get("title");

    // Jika tidak ada title, biarkan loading biasa (default CSR)
    if (!titleParam) {
        return context.next();
    }

    // 2. Ambil Data CSV dari Google Sheets (Server-Side Fetching)
    // ID Sheet sesuai dengan yang ada di index.html/baca.html
    const sheetID = "1FDzhBlVOFlnlQgphN2gsGJUdDeFWonpoJcadY8JqUcM";
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetID}/export?format=csv`;

    try {
        const csvResponse = await fetch(csvUrl);
        if (!csvResponse.ok) return context.next();

        const csvText = await csvResponse.text();

        // 3. Parsing CSV Sederhana (Tanpa Library Berat)
        // Asumsi: Header ada di baris pertama
        const rows = csvText.split("\n");
        const headers = parseCSVRow(rows[0]);

        // Cari index kolom 'judul', 'gambar', 'isi'/'deskripsi'
        const titleIdx = headers.findIndex(h => h.toLowerCase() === 'judul' || h.toLowerCase() === 'title');
        const imgIdx = headers.findIndex(h => h.toLowerCase() === 'gambar' || h.toLowerCase() === 'image');
        const dateIdx = headers.findIndex(h => h.toLowerCase() === 'tanggal' || h.toLowerCase() === 'date');

        if (titleIdx === -1) return context.next(); // Gagal identifikasi kolom

        // 4. Cari Artikel yang Cocok
        let foundArticle = null;
        const searchTarget = titleParam.trim().toLowerCase();

        for (let i = 1; i < rows.length; i++) {
            const rowData = parseCSVRow(rows[i]);
            if (!rowData[titleIdx]) continue;

            if (rowData[titleIdx].trim().toLowerCase() === searchTarget) {
                foundArticle = {
                    title: rowData[titleIdx],
                    image: rowData[imgIdx] || "",
                    date: rowData[dateIdx] || ""
                };
                break;
            }
        }

        // Jika artikel tidak ditemukan, lanjut aja (nanti client-side yang handle 404)
        if (!foundArticle) return context.next();

        // 5. Modifikasi HTML Response
        // Kita ambil respon asli dari Netlify
        const response = await context.next();
        const pageToModify = await response.text();

        // Regex yang lebih aman (case insensitive & flexible spacing)
        let updatedPage = pageToModify;

        // A. Ganti Title
        updatedPage = updatedPage.replace(
            /<title>[\s\S]*?<\/title>/i,
            `<title>${foundArticle.title} - MQ News</title>`
        );

        // B. Ganti OG:Title
        updatedPage = updatedPage.replace(
            /<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i,
            `<meta property="og:title" content="${foundArticle.title}">`
        );

        // C. Ganti OG:Image (Pastikan URL Absolute)
        // Fallback logo jika gambar kosong atau invalid
        let imgUrl = foundArticle.image && foundArticle.image.length > 5 ? foundArticle.image : "https://mqnews-today.netlify.app/ALT_LogoMQN.png";

        // Facebook butuh URL absolute, jadi kalau di CSV cuma 'gambar.jpg', kita harus fix (tapi biasanya di CSV udah full url sih)

        updatedPage = updatedPage.replace(
            /<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/i,
            `<meta property="og:image" content="${imgUrl}">`
        );

        // D. Ganti OG:Description
        const desc = `Baca selengkapnya tentang ${foundArticle.title}. Diposting pada ${foundArticle.date}`;
        updatedPage = updatedPage.replace(
            /<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i,
            `<meta property="og:description" content="${desc}">`
        );

        // Update juga Twitter Card
        updatedPage = updatedPage.replace(
            /<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/i,
            `<meta name="twitter:image" content="${imgUrl}">`
        );

        // DEBUGGING: Tambah komentar di HTML biar tau ini hasil proses Edge Function
        updatedPage += "\n<!-- Processed by Netlify Edge Function -->";

        // Return HTML yang sudah dimodifikasi
        return new Response(updatedPage, response);

    } catch (error) {
        // Jika error, fallback ke default
        console.log("Edge Function Error:", error);
        return context.next();
    }
};

// Helper: Parse CSV Row (handling quotes sederhana)
function parseCSVRow(row) {
    const result = [];
    let cell = "";
    let inQuote = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(cell.trim());
            cell = "";
        } else {
            cell += char;
        }
    }
    result.push(cell.trim());
    return result;
}

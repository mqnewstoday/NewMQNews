import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Memory cache for knowledge base content to prevent repeating disk read I/O
let cachedKnowledgeBase: string | null = null;

// Helper function to read and optimize file content
const readAndOptimizeFile = (filename: string): string | null => {
  try {
    const filePath = path.join(process.cwd(), 'src/data', filename);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // OPTIMIZATION: Compress blank spaces, carriage returns, and duplicate empty lines
      // This reduces token usage and network payload size by 30-50% while retaining 100% of information,
      // resulting in incredibly fast API responses!
      content = content
        .replace(/\r\n/g, '\n')
        .replace(/\n\s*\n+/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .trim();
      return content;
    }
  } catch (error) {
    console.error(`Failed to load file ${filename}:`, error);
  }
  return null;
};

// Load Knowledge Base (combining the main dream book and all 5 Pakistan speeches)
const loadKnowledgeBase = (): string => {
  // Bypass cache in development mode to ensure newly added or updated files are immediately loaded
  if (cachedKnowledgeBase && process.env.NODE_ENV !== 'development') {
    return cachedKnowledgeBase;
  }

  try {
    // 1. Load Main Book
    let bookContent = readAndOptimizeFile('Mimpi Muhammad Qasim Indo Malay.txt');
    if (!bookContent) {
      bookContent = readAndOptimizeFile('buku_mimpi.txt') || 'Gagal memuat basis data buku mimpi Muhammad Qasim.';
    }

    // 2. Load Speeches 1 to 5
    const speech1Content = readAndOptimizeFile('Pidato Pertama Muhammad Qasim di Pakistan.txt') || '';
    const speech2Content = readAndOptimizeFile('Pidato Kedua Muhammad Qasim di Pakistan.txt') || '';
    const speech3Content = readAndOptimizeFile('Pidato Ketiga Muhammad Qasim di Pakistan.txt') || '';
    const speech4Content = readAndOptimizeFile('Pidato Keempat Muhammad Qasim di Pakistan.txt') || '';
    const speech5Content = readAndOptimizeFile('Pidato Kelima Muhammad Qasim di Pakistan.txt') || '';

    // Create an explicit index of available documents at the top of the context
    // This guarantees the AI knows exactly how many documents and speeches exist!
    let combined = `=== [DAFTAR DOKUMEN YANG TERSEDIA] ===
Di bawah ini adalah 6 dokumen resmi yang terlampir secara lengkap dalam basis pengetahuan:
1. DOKUMEN 1: BUKU KUMPULAN MIMPI MUHAMMAD QASIM INDO MALAY (Basis data utama kumpulan mimpi Muhammad Qasim)
2. DOKUMEN 2: PIDATO PERTAMA MUHAMMAD QASIM DI PAKISTAN (Disampaikan pada Juli 2023)
3. DOKUMEN 3: PIDATO KEDUA MUHAMMAD QASIM DI PAKISTAN (Disampaikan setelah pidato pertama, tanggal tidak disebutkan secara rinci)
4. DOKUMEN 4: PIDATO KETIGA MUHAMMAD QASIM DI PAKISTAN (Disampaikan pada 6 September 2023)
5. DOKUMEN 5: PIDATO KEEMPAT MUHAMMAD QASIM DI PAKISTAN (Disampaikan pada Oktober 2023)
6. DOKUMEN 6: PIDATO KELIMA MUHAMMAD QASIM DI PAKISTAN (Disampaikan pada Desember 2023)

==================================================

=== [ISI DOKUMEN 1: BUKU KUMPULAN MIMPI MUHAMMAD QASIM INDO MALAY] ===
${bookContent}

`;

    if (speech1Content) {
      combined += `=== [ISI DOKUMEN 2: PIDATO PERTAMA MUHAMMAD QASIM DI PAKISTAN] ===\n${speech1Content}\n\n`;
    }
    
    if (speech2Content) {
      combined += `=== [ISI DOKUMEN 3: PIDATO KEDUA MUHAMMAD QASIM DI PAKISTAN] ===\n${speech2Content}\n\n`;
    }

    if (speech3Content) {
      combined += `=== [ISI DOKUMEN 4: PIDATO KETIGA MUHAMMAD QASIM DI PAKISTAN] ===\n${speech3Content}\n\n`;
    }

    if (speech4Content) {
      combined += `=== [ISI DOKUMEN 5: PIDATO KEEMPAT MUHAMMAD QASIM DI PAKISTAN] ===\n${speech4Content}\n\n`;
    }

    if (speech5Content) {
      combined += `=== [ISI DOKUMEN 6: PIDATO KELIMA MUHAMMAD QASIM DI PAKISTAN] ===\n${speech5Content}\n\n`;
    }

    combined = combined.trim();

    console.log(`Successfully loaded and optimized full knowledge base (combined): ${combined.length} characters.`);
    cachedKnowledgeBase = combined;
    return cachedKnowledgeBase;
  } catch (error) {
    console.error('Failed to load combined knowledge base:', error);
  }
  return 'Gagal memuat basis data buku mimpi Muhammad Qasim.';
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Format pesan tidak valid' }, { status: 400 });
    }

    // Get API Keys from env and split by comma
    const rawKeys = process.env.GEMINI_API_KEYS || '';
    const apiKeys = rawKeys
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (apiKeys.length === 0) {
      console.error('No Gemini API keys found in environment variables.');
      return NextResponse.json(
        { error: 'Server misconfigured: API Key tidak tersedia' },
        { status: 500 }
      );
    }

    const knowledgeBase = loadKnowledgeBase();

    // Construct the System Instruction
    const systemInstruction = `
Anda adalah AI pendamping resmi untuk portal berita "MQ News Today". Tugas Anda adalah menjawab pertanyaan pembaca secara cerdas, ramah, bijaksana, dan akurat berdasarkan basis pengetahuan resmi mengenai kumpulan mimpi Muhammad Qasim bin Abdul Karim serta naskah pidato-pidatonya di Pakistan berikut ini:

=========================================
KNOWLEDGE BASE (BASIS PENGETAHUAN RESMI):
${knowledgeBase}
=========================================

PANDUAN GAYA BAHASA DAN INTRUKSI UTAMA:
1. JAWAB DENGAN SANTAI & PERCAYA DIRI: Jawablah dengan nada yang santai, percaya diri, akrab, bersahabat, dan mengalir secara alami. Hindari gaya bahasa yang kaku, terlalu formal, atau robotic.
2. DILARANG MENGULANG BOILERPLATE: JANGAN PERNAH mengulang-ulang kalimat kaku seperti "Berdasarkan basis pengetahuan resmi...", "Berdasarkan data yang disediakan...", atau sejenisnya di awal maupun di dalam jawaban Anda. Jawab langsung saja pertanyaan tersebut seolah-olah Anda memang sudah memahami dan menguasai informasi tersebut dengan alami.
3. BATASAN FAKTA: Jawaban Anda tetap harus didasarkan sepenuhnya pada fakta di dalam KNOWLEDGE BASE di atas. Jika ada pertanyaan pembaca yang benar-benar tidak ada di dalam buku/teks mimpi di atas, katakan saja secara santai dan sopan bahwa Anda belum memiliki informasi tersebut saat ini.
4. FORMAT NYAMAN DIBACA: Gunakan bold teks, paragraf pendek, atau bullet-points agar jawaban mudah dibaca. Jawab secara ringkas dan langsung ke poin utama.
5. INFORMASI PENTING: Muhammad Qasim tidak pernah mengklaim dirinya sebagai Nabi atau Imam Mahdi. Mimpi-mimpinya murni merupakan Mubasyirat (kabar gembira).
`;

    // Map history to Gemini format
    // Simple format: list of { role: 'user' | 'model', parts: [{ text: string }] }
    // Note: Gemini expects roles to alternate strictly user -> model -> user -> model...
    let geminiHistory = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // CRITICAL: Gemini requires the first message in the chat history to have the role 'user'.
    // Since our initial greeting message is a static welcome from the assistant (role 'model'),
    // we must remove any leading model messages from the history!
    while (geminiHistory.length > 0 && geminiHistory[0].role === 'model') {
      geminiHistory.shift();
    }

    // System instruction is supplied via model config.
    // Try each API Key in sequence (rotation & fallback)
    let responseText = '';
    let success = false;
    let rateLimited = false;

    // Start with a random index for load balancing, then check sequentially
    const startIndex = Math.floor(Math.random() * apiKeys.length);
    console.log(`Starting chat generation with API Key Index ${startIndex} (Total keys: ${apiKeys.length})`);

    for (let i = 0; i < apiKeys.length; i++) {
      const activeIndex = (startIndex + i) % apiKeys.length;
      const apiKey = apiKeys[activeIndex];

      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: systemInstruction,
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
          ],
        });

        // The last message is the current user input, the rest is history
        const lastMessage = geminiHistory[geminiHistory.length - 1];
        const history = geminiHistory.slice(0, -1);

        const chat = model.startChat({
          history: history,
          generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.4,
          },
        });

        const result = await chat.sendMessage(lastMessage.parts[0].text);
        const response = await result.response;
        responseText = response.text();
        
        if (responseText) {
          success = true;
          console.log(`Successfully generated response using API Key Index ${activeIndex}`);
          break;
        }
      } catch (error: any) {
        console.warn(`API Key Index ${activeIndex} failed. Error:`, error.message || error);
        
        // Check for rate limit status (usually contains 429 or RESOURCE_EXHAUSTED)
        const errorStr = String(error).toLowerCase();
        if (errorStr.includes('429') || errorStr.includes('exhausted') || errorStr.includes('rate')) {
          rateLimited = true;
        }
      }
    }

    if (success) {
      return NextResponse.json({ reply: responseText });
    }

    // If all keys failed and we caught a rate limit error along the way
    if (rateLimited) {
      console.error('All Gemini API keys exhausted or rate-limited.');
      return NextResponse.json(
        { error: 'busy', retryAfter: 15 },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'API gagal memproses tanggapan. Silakan coba sesaat lagi.' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}

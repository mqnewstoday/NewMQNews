import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Load Knowledge Base
const loadKnowledgeBase = (): string => {
  try {
    const filePath = path.join(process.cwd(), 'src/data/buku_mimpi.txt');
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (error) {
    console.error('Failed to load knowledge base:', error);
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
Anda adalah AI pendamping resmi untuk portal berita "MQ News Today". Tugas Anda adalah menjawab pertanyaan pembaca secara cerdas, ramah, bijaksana, dan akurat berdasarkan basis pengetahuan resmi mengenai mimpi-mimpi Muhammad Qasim bin Abdul Karim berikut ini:

=========================================
KNOWLEDGE BASE (BASIS PENGETAHUAN RESMI):
${knowledgeBase}
=========================================

PANDUAN MENJAWAB:
1. Jawablah menggunakan bahasa Indonesia yang ramah, sopan, dan mudah dipahami.
2. Jawaban Anda harus didasarkan sepenuhnya pada fakta di dalam KNOWLEDGE BASE di atas. Jika pertanyaan pembaca tidak dapat dijawab berdasarkan dokumen di atas, katakan secara jujur dan sopan bahwa Anda tidak memiliki informasi tersebut di dalam buku mimpi saat ini.
3. Hindari berspekulasi atau membuat narasi tambahan di luar teks yang disediakan.
4. Anda dapat menggunakan format bullet-points, bold teks, atau paragraf pendek agar jawaban enak dibaca.
5. Jawablah secara ringkas dan langsung ke inti pertanyaan.
6. Ingat, Muhammad Qasim tidak pernah mengklaim dirinya sebagai Nabi atau Imam Mahdi. Mimpi-mimpinya murni merupakan Mubasyirat (kabar gembira).
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
        });

        // The last message is the current user input, the rest is history
        const lastMessage = geminiHistory[geminiHistory.length - 1];
        const history = geminiHistory.slice(0, -1);

        const chat = model.startChat({
          history: history,
          generationConfig: {
            maxOutputTokens: 1000,
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

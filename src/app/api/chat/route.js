import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

// Global object to track cooldowns for each API key
// Key: API_KEY string, Value: Timestamp (Date.now()) when the key becomes available again
const keyCooldowns = {};

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!messages || messages.length === 0) {
      return Response.json({ error: 'No messages provided.' }, { status: 400 });
    }

    // 1. Gather API keys from env
    const keys = [];
    for (let i = 1; i <= 12; i++) {
      const key = process.env[`GEMINI_API_KEY_${i}`];
      if (key) keys.push(key);
    }
    
    if (keys.length === 0) {
      return Response.json({ error: 'No API keys configured in .env.local.' }, { status: 500 });
    }

    // 2. Filter keys that are NOT on cooldown
    const availableKeys = [];
    let minWaitTimeMs = Infinity;
    const now = Date.now();

    for (const key of keys) {
      const cooldownEnd = keyCooldowns[key] || 0;
      if (now >= cooldownEnd) {
        availableKeys.push(key);
      } else {
        const wait = cooldownEnd - now;
        if (wait < minWaitTimeMs) minWaitTimeMs = wait;
      }
    }

    if (availableKeys.length === 0) {
      return Response.json({ error: 'rate_limit', waitTime: Math.ceil(minWaitTimeMs / 1000) }, { status: 429 });
    }

    // 3. Read context data from src/data/*.txt
    let systemInstruction = "Lu adalah representasi dari MQ News Today (dengan slogan TRUTH & CLARITY). Peran lu adalah sebagai PENDUKUNG setia (namun tidak radikal) atas kebenaran mimpi-mimpi Muhammad Qasim. Kalau ada yang meragukan atau menolak, lu harus berikan argumen logis dan data yang kuat untuk meyakinkan mereka bahwa mimpi tersebut benar dari Allah SWT dan Nabi Muhammad SAW. Jawab santai, chill, pakai bahasa lu-gue layaknya kawan ngobrol. PENTING: JANGAN PERNAH menyapa dengan 'MQ News Today AI di sini!' atau memperkenalkan diri secara kaku. Langsung aja ngobrol senatural mungkin. JANGAN posisikan diri lu sebagai AI atau bot (jangan pakai kata-kata seperti 'sebagai AI', 'menurut konteks', 'berdasarkan data yang diberikan'). Lu harus meresapi peran lu secara mendalam. Jika ditanya dari mana sumber informasinya, lu WAJIB menjawab bahwa informasinya berasal dari data resmi di website muhammadqasimpk.org (JANGAN PERNAH sebutkan nama file .txt mentah). Jika memberikan daftar poin, gunakan format penomoran angka biasa (1., 2., 3.). DILARANG KERAS menggunakan emoji atau emoticon apapun. DILARANG KERAS menggunakan simbol markdown seperti bintang (**) untuk menebalkan teks, (*) untuk list, atau (#) untuk judul karena akan membuat tampilan berantakan. Tulis dengan teks biasa, bersih, dan rapi tanpa simbol aneh.";
    try {
      const dataDir = path.join(process.cwd(), 'src', 'data');
      if (fs.existsSync(dataDir)) {
        const files = fs.readdirSync(dataDir);
        let contextData = "";
        for (const file of files) {
          if (file.endsWith('.txt')) {
            const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
            contextData += `\n\n--- Source: ${file} ---\n${content}`;
          }
        }
        if (contextData) {
          systemInstruction += `\n\nUse the following information to answer the user's questions:\n${contextData}`;
        }
      }
    } catch (err) {
      console.error("Error reading context files:", err);
    }

    // 4. Try keys sequentially until one works or all hit 429
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    for (const apiKey of availableKeys) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: formattedMessages,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return Response.json({ 
          reply: response.text 
        });

      } catch (genError) {
        // If it's a 429 Quota/Rate Limit error, mark key on cooldown and try the next one
        if (genError.status === 429 || (genError.message && genError.message.includes('429'))) {
          keyCooldowns[apiKey] = Date.now() + 60000; // 60 seconds cooldown
          continue; 
        }
        // If it's another error, throw it to the outer catch
        throw genError;
      }
    }

    // If we reach here, all available keys threw 429 during generation
    let newMinWait = Infinity;
    for (const key of keys) {
      const wait = (keyCooldowns[key] || 0) - Date.now();
      if (wait > 0 && wait < newMinWait) newMinWait = wait;
    }
    
    return Response.json({ error: 'rate_limit', waitTime: Math.ceil(newMinWait / 1000) }, { status: 429 });

  } catch (error) {
    console.error("API Error:", error);
    return Response.json({ error: error.message || 'Failed to generate response.' }, { status: 500 });
  }
}

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. INJECT HTML (Wadah Terminal & Pesan Baru)
    const offlineHTML = `
        <div id="offline-terminal" style="display: none;">
            <div class="terminal-content">
                <pre id="ascii-stage"></pre>
                
                <div class="offline-status">
                    <span class="blink">⚠️ KONEKSI TERPUTUS_</span><br>
                    Menghancurkan Hambatan...
                </div>
            </div>
        </div>
    `;
    
    // Masukin ke dalam Body web cuma kalau belum ada
    if (!document.getElementById('offline-terminal')) {
        document.body.insertAdjacentHTML('beforeend', offlineHTML);
    }

    // 2. SETUP VARIABEL
    const offlineTerminal = document.getElementById('offline-terminal');
    const stage = document.getElementById('ascii-stage');
    let animationInterval;

    // 3. DATABASE FRAME ANIMASI BARU (Hancurkan Berhala)
    // O-> = Orang jalan
    // [🗿] = Patung Berhala
    // 🤜💥 = Aksi Pukul & Ledakan
    // . . . = Serpihan debu
    const frames = [
        "O->           [🗿]", // Frame 0: Jalan dari jauh
        "  O->         [🗿]", 
        "    O->       [🗿]", 
        "      O->     [🗿]", // Frame 3: Mendekat
        "        O->   [🗿]", 
        "          O-> [🗿]", // Frame 5: Di depan patung
        "          O-🤜💥  ", // Frame 6: PUKUL! Patung ilang diganti ledakan
        "          O-  .   ", // Frame 7: Jadi debu 1
        "          O-  ..  ", // Frame 8: Jadi debu 2
        "          O- ...  ", // Frame 9: Jadi debu 3
        "            O->   ", // Frame 10: Lanjut jalan ngelewatin bekasnya
        "             O->  ", // Frame 11: Jalan terus...
        "             O->  ", // Frame 12: Pause bentar sebelum looping
    ];
    let currentFrame = 0;

    // 4. LOGIKA ANIMASI
    function playAnimation() {
        stage.innerText = frames[currentFrame];
        currentFrame++;
        if (currentFrame >= frames.length) currentFrame = 0;
    }

    // 5. LOGIKA DETEKSI INTERNET
    function checkConnection() {
        if (navigator.onLine) {
            // ONLINE: Sembunyikan Terminal
            offlineTerminal.style.display = 'none';
            clearInterval(animationInterval);
        } else {
            // OFFLINE: Munculkan Terminal & Mainkan Animasi
            offlineTerminal.style.display = 'flex';
            currentFrame = 0; // Reset ke awal
            clearInterval(animationInterval);
            // Kecepatan 200ms biar aksi pukulnya berasa cepet
            animationInterval = setInterval(playAnimation, 200); 
        }
    }

    // 6. PASANG EVENT LISTENER
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    
    // Cek pas loading awal
    checkConnection();
});

(function () {
    // KITA BUNGKUS JADI SATU FUNGSI BIAR BISA DIPANGGIL ULANG
    function terapkanSettingan() {
        // 1. CEK DARK MODE (Target: Body)
        // Kita paksa cek localStorage tiap kali fungsi ini jalan
        const tema = localStorage.getItem('theme');
        if (tema === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode'); // Jaga-jaga kalau user matiin dark mode
        }

        // 2. CEK UKURAN FONT (Target: HTML)
        const font = localStorage.getItem('fontSize');
        const root = document.documentElement; // Tag <html>

        // Bersihin dulu class lama
        root.classList.remove('font-small', 'font-large');

        // Pasang class baru sesuai settingan terakhir
        if (font === 'small') root.classList.add('font-small');
        if (font === 'large') root.classList.add('font-large');
    }

    // --- EKSEKUSI ---

    // A. Jalanin PAS PERTAMA LOAD (Biar gak kedip)
    terapkanSettingan();

    // B. Jalanin PAS TOMBOL BACK DITEKAN (Ini kuncinya!)
    // Event 'pageshow' jalan tiap kali halaman muncul, termasuk dari cache (back button)
    window.addEventListener('pageshow', function (event) {
        // Paksa baca ulang settingan
        terapkanSettingan();
    });

    // Inject Persistent Audio Manager (except where it handles itself)
    const audioScript = document.createElement('script');
    audioScript.src = "audio-manager.js";
    document.body.appendChild(audioScript);

    // --- ONESIGNAL INIT (Notification) ---
    // Load Script
    const osScript = document.createElement('script');
    osScript.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    osScript.defer = true;
    document.head.appendChild(osScript);

    // Init Config
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    OneSignalDeferred.push(async function (OneSignal) {
        await OneSignal.init({
            appId: "542c9bb4-d7e3-4938-b453-cf7ad6bef22c",
            allowLocalhostAsSecureOrigin: true, // Biar bisa tes di localhost
            autoRegister: false, // PENTING: Jangan paksa subscribe di awal!
            notifyButton: {
                enable: false, // Kita pake tombol custom di settings
            },
        });
    });
})();

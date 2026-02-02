/**
 * AUDIO MANAGER - PERSISTENT PLAYBACK
 * Handles simulated persistent audio playback across pages via localStorage.
 */

(function () {
    // 1. CONFIGURATION
    const EXCLUDED_PAGES = [
        'register.html',
        'login.html',
        'forgot-password.html',
        'baca.html',
        'edit-profile.html',
        'mimpi.html',
        'audio.html' // Audio page handles its own player, but syncs to this logic
    ];

    const STORAGE_KEY = 'mq_audio_state';
    const SYNC_INTERVAL_MS = 1000;

    // Check if current page is excluded
    const path = window.location.pathname;
    const pageName = path.split('/').pop() || 'index.html';

    // If exact match or contains (for query params case, strictly split check is safer)
    // We strictly check the filename.
    const isExcluded = EXCLUDED_PAGES.some(ex => pageName.toLowerCase().startsWith(ex.toLowerCase()) || pageName.toLowerCase() === ex.toLowerCase());

    // If on audio.html, we don't inject the mini player, strictly SYNC only.
    // If on other excluded pages, we might need to STOP audio if it was playing?
    // User said: "jangan bisa play dihalaman halaman itu" -> Do not play.
    if (isExcluded) {
        // Specifically for audio.html, we let it be (it has its own player)
        // For others, likely we should pause if there's global audio playing?
        // But since this script "re-initializes" on every page load, if we simply DON'T run the logic, the audio won't effectively "continue".
        // The default behavior of a new page load is silence. So doing nothing here ensures silence. 
        // EXCEPTION: sync state from audio.html needs to happen INSIDE audio.html. 
        // But this script is for the "Floating Player" on OTHER pages.
        // So simply returning here is correct for excluded pages.
        return;
    }

    // 2. STATE MANAGEMENT
    let audioState = {
        isPlaying: false,
        currentTime: 0,
        trackIndex: 0,
        playlist: [],
        lastUpdate: 0
    };

    let audioObj = null;
    let syncTimer = null;

    // Load state
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) audioState = JSON.parse(saved);
    } catch (e) {
        console.error("Audio State Parse Error", e);
    }

    // Check age of state (if too old > 30 mins, ignore resume)
    const now = Date.now();
    if (now - (audioState.lastUpdate || 0) > 30 * 60 * 1000) {
        audioState.isPlaying = false; // Reset if old
    }

    // If nothing valid was playing, pause and exit
    if (!audioState.playlist || audioState.playlist.length === 0) return;

    // 3. CREATE FLOATING PLAYER UI
    createFloatingPlayer();

    // 4. AUDIO INITIALIZATION
    const currentTrack = audioState.playlist[audioState.trackIndex];
    if (!currentTrack) return;

    audioObj = new Audio(currentTrack.url);
    audioObj.currentTime = audioState.currentTime;

    updateMiniUI(currentTrack);

    // Setup Listeners
    audioObj.addEventListener('timeupdate', () => {
        saveState();
    });

    audioObj.addEventListener('ended', () => {
        // Auto Next (Simple version)
        if (audioState.trackIndex < audioState.playlist.length - 1) {
            audioState.trackIndex++;
            playTrackAtIndex(audioState.trackIndex);
        } else {
            audioState.isPlaying = false;
            updatePlayButtonUI(false);
            saveState();
        }
    });

    audioObj.addEventListener('play', () => {
        audioState.isPlaying = true;
        updatePlayButtonUI(true);
        saveState();
    });

    audioObj.addEventListener('pause', () => {
        audioState.isPlaying = false;
        updatePlayButtonUI(false);
        saveState();
    });

    // Auto-Resume logic
    if (audioState.isPlaying) {
        // Attempt play
        const playPromise = audioObj.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    // Success
                    updatePlayButtonUI(true);
                })
                .catch(error => {
                    // Auto-play blocked
                    console.log("Auto-resume blocked by browser policy");
                    audioState.isPlaying = false;
                    updatePlayButtonUI(false);
                    saveState(); // Correct the state to paused
                });
        }
    }

    function saveState() {
        if (!audioObj) return;
        audioState.currentTime = audioObj.currentTime;
        audioState.lastUpdate = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(audioState));
    }

    function playTrackAtIndex(idx) {
        if (idx < 0 || idx >= audioState.playlist.length) return;
        const track = audioState.playlist[idx];
        audioObj.src = track.url;
        audioObj.currentTime = 0;
        audioState.trackIndex = idx;
        audioObj.play();
        updateMiniUI(track);
    }

    // 5. UI FUNCTIONS
    function createFloatingPlayer() {
        const style = document.createElement('style');
        style.textContent = `
            #mq-global-player {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 300px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                padding: 10px;
                z-index: 9999;
                transition: all 0.3s ease;
                font-family: 'Lato', sans-serif;
            }
            body.dark-mode #mq-global-player {
                background: rgba(30, 30, 30, 0.95);
                border-color: #333;
                color: white;
            }
            .gp-thumb {
                width: 40px;
                height: 40px;
                background: #eee;
                border-radius: 6px;
                object-fit: cover;
                margin-right: 10px;
                cursor: pointer;
            }
            .gp-info {
                flex: 1;
                overflow: hidden;
                margin-right: 10px;
                cursor: pointer;
            }
            .gp-title {
                font-size: 0.85rem;
                font-weight: bold;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: var(--text-main, #333);
            }
            .gp-desc {
                font-size: 0.7rem;
                color: #888;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            body.dark-mode .gp-title { color: #eee; }
            .gp-controls {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .gp-btn {
                background: none;
                border: none;
                cursor: pointer;
                padding: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: inherit;
            }
            .gp-btn:hover { opacity: 0.8; }
            .gp-icon { width: 24px; height: 24px; fill: currentColor; }
            
            /* Responsive Mobile: Bottom Full Width */
            @media (max-width: 600px) {
                #mq-global-player {
                    bottom: 0;
                    right: 0;
                    left: 0;
                    width: 100%;
                    border-radius: 0;
                    border-top-left-radius: 12px;
                    border-top-right-radius: 12px;
                    border-bottom: none;
                }
            }
        `;
        document.head.appendChild(style);

        const div = document.createElement('div');
        div.id = 'mq-global-player';
        div.innerHTML = `
            <img src="" class="gp-thumb" id="gp-img">
            <div class="gp-info" id="gp-info">
                <div class="gp-title" id="gp-title">Loading...</div>
                <div class="gp-desc" id="gp-desc">...</div>
            </div>
            <div class="gp-controls">
                <button class="gp-btn" id="gp-play-btn">
                     <svg class="gp-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
                <button class="gp-btn" id="gp-close-btn" style="opacity:0.5; transform:scale(0.8);">
                    <svg class="gp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        `;
        document.body.appendChild(div);

        // Bind Events
        const openPlayer = () => {
            const t = document.getElementById('gp-title').innerText;
            // Save state first to ensure latest time is captured
            saveState();
            window.location.href = 'audio.html#track=' + encodeURIComponent(t) + '&open=true';
        };

        document.getElementById('gp-img').onclick = openPlayer;
        document.getElementById('gp-info').onclick = openPlayer;
        document.getElementById('gp-play-btn').onclick = toggleGlobalPlay;
        document.getElementById('gp-close-btn').onclick = closeGlobalPlayer;
    }

    function toggleGlobalPlay(e) {
        if (e) e.stopPropagation();
        if (audioObj.paused) audioObj.play();
        else audioObj.pause();
    }

    function closeGlobalPlayer(e) {
        if (e) e.stopPropagation();
        if (audioObj) {
            audioObj.pause();
            audioState.isPlaying = false;
            saveState();
        }
        const el = document.getElementById('mq-global-player');
        if (el) el.style.display = 'none';
    }

    // Save state on unload to minimize gap
    window.addEventListener('beforeunload', () => {
        saveState();
    });

    function updateMiniUI(track) {
        document.getElementById('gp-title').innerText = track.title;
        document.getElementById('gp-desc').innerText = track.desc || track.artist || "";
        document.getElementById('gp-img').src = track.thumb;
    }

    function updatePlayButtonUI(playing) {
        const btn = document.getElementById('gp-play-btn');
        if (!btn) return;
        if (playing) {
            btn.innerHTML = `<svg class="gp-icon" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
        } else {
            btn.innerHTML = `<svg class="gp-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
        }
    }

})();

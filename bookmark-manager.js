
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, deleteDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Universal Bookmark Manager
 * Handles saving/removing bookmarks to Firestore.
 */

class BookmarkManager {
    constructor() {
        this.user = null;
        this.isAuthReady = false;
        // Cache to store set of bookmarked IDs for fast UI lookup
        // Structure: { 'news': Set(), 'audio': Set(), 'mimpi': Set() }
        this.cache = {
            news: new Set(),
            audio: new Set(),
            mimpi: new Set()
        };

        // Listen to Auth State
        onAuthStateChanged(auth, (user) => {
            this.user = user;
            this.isAuthReady = true;

            if (user) {
                // Fetch all bookmarks to populate cache
                this._fetchAllBookmarks();
            } else {
                this._clearCache();
            }

            // Dispatch event for UI updates
            window.dispatchEvent(new CustomEvent('auth-ready', { detail: user }));
        });
    }

    _clearCache() {
        this.cache.news.clear();
        this.cache.audio.clear();
        this.cache.mimpi.clear();
    }

    async _fetchAllBookmarks() {
        if (!this.user) return;

        try {
            const categories = ['news', 'audio', 'mimpi'];

            for (const cat of categories) {
                const snapshot = await getDocs(collection(db, "users", this.user.uid, "bookmarks_" + cat));
                snapshot.forEach(doc => {
                    this.cache[cat].add(doc.id);
                });
            }

            // Dispatch event that bookmarks are loaded
            window.dispatchEvent(new CustomEvent('bookmarks-loaded'));
            console.log("Bookmarks cache loaded:", this.cache);
        } catch (e) {
            console.error("Error loading bookmarks:", e);
        }
    }

    // Helper: Normalize Title for ID
    _sanitizeId(title) {
        return title.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 100);
    }

    /**
     * Check if an item is bookmarked (Synchronous - uses Cache)
     * Suitable for lists/grids rendering
     */
    isBookmarkedSync(category, title) {
        if (!this.user) return false;
        const docId = this._sanitizeId(title);
        return this.cache[category].has(docId);
    }

    /**
     * Check if an item is bookmarked (Async - direct DB)
     */
    async isBookmarked(category, title) {
        if (!this.user) return false;
        // ... (Fallthrough to sync check if cache loaded, otherwise DB)
        return this.isBookmarkedSync(category, title);
    }

    /**
     * Toggle Bookmark (Save/Unsave)
     * @param {string} category - 'news', 'audio', 'mimpi'
     * @param {object} data - { title, url, image, date, desc }
     * @returns {Promise<string>} - 'saved', 'removed', or 'unauth'
     */
    async toggleBookmark(category, data) {
        if (!this.user) {
            this._showLoginPopup();
            return 'unauth';
        }

        const title = data.title || data.judul;
        if (!title) return 'error';

        const docId = this._sanitizeId(title);
        const ref = doc(db, "users", this.user.uid, "bookmarks_" + category, docId);

        try {
            // Check cache first
            const exists = this.cache[category].has(docId);

            if (exists) {
                // DELETE
                await deleteDoc(ref);
                this.cache[category].delete(docId); // Update Cache
                this._showNotif(`Dihapus dari simpanan ${category}.`, 'error');
                return 'removed';
            } else {
                // SAVE
                // Clean data before saving
                const safeData = {
                    title: title,
                    url: data.url || window.location.href,
                    image: data.image || data.gambar || data.thumbnail || '',
                    date: data.date || data.tanggal || new Date().toISOString(),
                    desc: data.desc || data.narasi || data.isi || data.description || '', // Fallback description
                    savedAt: new Date().toISOString()
                };

                // Truncate desc if too long (save storage)
                if (safeData.desc.length > 200) safeData.desc = safeData.desc.substring(0, 200) + "...";

                await setDoc(ref, safeData);
                this.cache[category].add(docId); // Update Cache
                this._showNotif(`Berhasil disimpan di ${category}!`, 'success');
                return 'saved';
            }
        } catch (e) {
            console.error("Bookmark Error:", e);
            this._showNotif("Gagal menyimpan. Periksa koneksi.", 'error');
            return 'error';
        }
    }

    _showLoginPopup() {
        // Create popup if not exists
        if (!document.getElementById('auth-popup-overlay')) {
            const html = `
            <div id="auth-popup-overlay" class="custom-modal-overlay" style="display:flex;">
                <div class="custom-modal-box">
                    <div style="margin-bottom:15px; color:var(--primary);">
                         <svg viewBox="0 0 24 24" width="50" height="50" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M18 8l2 2 4-4"></path>
                         </svg>
                    </div>
                    <h3 class="modal-title">Fitur Member</h3>
                    <p class="modal-desc">Login untuk menyimpan artikel dan mengaksesnya di semua perangkat Anda.</p>
                    <div class="modal-actions">
                        <button onclick="document.getElementById('auth-popup-overlay').remove()" class="modal-btn btn-cancel">Nanti</button>
                        <button onclick="window.location.href='login.html'" class="modal-btn btn-yes">Login / Daftar</button>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', html);
        }
    }

    _showNotif(msg, type) {
        // Reuse existing notifBox if available, or force create one?
        // Assuming pages already have #notifBox based on previous files
        const box = document.getElementById('notifBox');
        if (box) {
            const text = document.getElementById('notifText');
            const icon = document.getElementById('notifIcon');

            text.innerText = msg;
            box.className = `custom-notif active ${type}`;

            // Icon Logic
            if (type === 'success') {
                icon.innerHTML = `<svg style="width:20px;height:20px;fill:#2e7d32" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
            } else {
                icon.innerHTML = `<svg style="width:20px;height:20px;fill:#d32f2f" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
            }

            setTimeout(() => {
                box.classList.remove('active');
                box.classList.remove('success');
                box.classList.remove('error');
            }, 3000);
        } else {
            alert(msg); // Fallback
        }
    }
}

// Export Singleton
const bookmarkManager = new BookmarkManager();
window.bookmarkManager = bookmarkManager; // Expose globally
export default bookmarkManager;

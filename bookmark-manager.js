
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Universal Bookmark Manager (V2 - SINGLE DOC ARRAY)
 * Optimized for COST EFFICIENCY (1 Read per Category Load)
 */

class BookmarkManager {
    constructor() {
        this.user = null;
        this.isAuthReady = false;
        // Cache for fast UI lookup: { 'news': Set(ids), 'audio': Set(ids), 'mimpi': Set(ids) }
        this.cache = {
            news: new Set(),
            audio: new Set(),
            mimpi: new Set()
        };

        // Full Data Cache (To avoid re-fetch on simple UI toggles if possible)
        this.dataCache = {
            news: [],
            audio: [],
            mimpi: []
        };

        // Listen to Auth State
        onAuthStateChanged(auth, (user) => {
            this.user = user;
            this.isAuthReady = true;

            if (user) {
                this._fetchAllBookmarks();
            } else {
                this._clearCache();
            }

            window.dispatchEvent(new CustomEvent('auth-ready', { detail: user }));
        });
    }

    _clearCache() {
        this.cache.news.clear();
        this.cache.audio.clear();
        this.cache.mimpi.clear();
        this.dataCache = { news: [], audio: [], mimpi: [] };
    }

    async _fetchAllBookmarks() {
        if (!this.user) return;

        try {
            const categories = ['news', 'audio', 'mimpi'];

            for (const cat of categories) {
                // READ SINGLE DOC (1 Read Cost)
                const docRef = doc(db, "users", this.user.uid, "bookmarks", cat);
                const snap = await getDoc(docRef);

                if (snap.exists()) {
                    const data = snap.data();
                    const list = data.list || []; // Array of objects

                    this.dataCache[cat] = list; // Store full objects
                    this.cache[cat].clear();

                    list.forEach(item => {
                        this.cache[cat].add(item.id);
                    });
                } else {
                    this.dataCache[cat] = [];
                    this.cache[cat].clear();
                }
            }

            window.dispatchEvent(new CustomEvent('bookmarks-loaded'));
            console.log("Bookmarks V2 loaded:", this.cache);
        } catch (e) {
            console.error("Error loading bookmarks V2:", e);
        }
    }

    // Helper: Normalize Title for ID
    _sanitizeId(title) {
        return title.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 100);
    }

    // Synchronous Check
    isBookmarkedSync(category, title) {
        if (!this.user) return false;
        const docId = this._sanitizeId(title);
        return this.cache[category].has(docId);
    }

    async isBookmarked(category, title) {
        if (!this.user) return false;
        return this.isBookmarkedSync(category, title);
    }

    /**
     * Toggle Bookmark (Save/Unsave) -> Updates Array in Single Doc
     */
    async toggleBookmark(category, data) {
        if (!this.user) {
            this._showLoginPopup();
            return 'unauth';
        }

        const title = data.title || data.judul;
        if (!title) return 'error';

        const docId = this._sanitizeId(title);
        const docRef = doc(db, "users", this.user.uid, "bookmarks", category);

        try {
            const exists = this.cache[category].has(docId);

            if (exists) {
                // DELETE: FIND ITEM TO REMOVE
                // ArrayRemove needs EXACT object match, which is hard.
                // Better strategy: Read -> Filter -> Write (1 Read + 1 Write)
                // OR: Store plain IDs in one array and data in another? No, complex.
                // BEST FOR ARRAY: We filter the local cache and re-upload the array (Write Cost).

                const currentList = this.dataCache[category];
                const newList = currentList.filter(item => item.id !== docId);

                await setDoc(docRef, { list: newList }); // Overwrite array with new list

                // Update Local State
                this.dataCache[category] = newList;
                this.cache[category].delete(docId);

                this._showNotif(`Dihapus dari simpanan ${category}.`, 'error');
                return 'removed';

            } else {
                // SAVE: ADD TO ARRAY (arrayUnion is clean)
                const safeData = {
                    id: docId, // Critical for ID matching
                    title: title,
                    url: data.url || window.location.href,
                    image: data.image || data.gambar || data.thumbnail || '',
                    date: data.date || data.tanggal || new Date().toISOString(),
                    desc: data.desc || data.narasi || data.isi || data.description || '',
                    savedAt: new Date().toISOString()
                };

                if (safeData.desc.length > 200) safeData.desc = safeData.desc.substring(0, 200) + "...";

                // Create doc if not exists, merge: true
                await setDoc(docRef, {
                    list: arrayUnion(safeData)
                }, { merge: true });

                // Update Local State
                this.dataCache[category].push(safeData);
                this.cache[category].add(docId);

                this._showNotif(`Berhasil disimpan di ${category}!`, 'success');
                return 'saved';
            }
        } catch (e) {
            console.error("Bookmark V2 Error:", e);
            this._showNotif("Gagal menyimpan. Periksa koneksi.", 'error');
            return 'error';
        }
    }

    // --- UTILS (Popup & Notif same as before) ---
    _showLoginPopup() {
        let popup = document.getElementById('auth-popup-overlay');
        if (!popup) {
            const html = `
            <div id="auth-popup-overlay" class="custom-modal-overlay">
                <div class="custom-modal-box">
                    <h3 class="modal-title">Fitur Login</h3>
                    <p class="modal-desc">Login untuk menyimpan artikel.</p>
                    <div class="modal-actions">
                        <button id="btn-cancel-auth" class="modal-btn btn-cancel">Nanti</button>
                        <button onclick="window.location.href='login.html'" class="modal-btn btn-yes">Login</button>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', html);
            popup = document.getElementById('auth-popup-overlay');
            document.getElementById('btn-cancel-auth').onclick = () => popup.classList.remove('active');
        }
        setTimeout(() => popup.classList.add('active'), 10);
    }

    _showNotif(msg, type) {
        if (window.showCustomNotif) {
            window.showCustomNotif(msg, type);
            return;
        }
        console.log(`[${type}] ${msg}`);
        // Fallback alert removed mostly
    }

    // EXPOSE DATA FOR SIMPAN.HTML
    getBookmarkList(category) {
        return this.dataCache[category] || [];
    }
}

const bookmarkManager = new BookmarkManager();
window.bookmarkManager = bookmarkManager;
export default bookmarkManager;

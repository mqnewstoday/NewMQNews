import { db, auth } from "./firebase-config.js";
import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp, startAfter, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

class CommentManager {
    constructor() {
        this.commentsList = [];
        this.lastVisible = null;
        this.currentTargetId = null;
        this.containerId = null;
        this.limit = 6;
        this.isLoading = false;
    }

    init(targetId, containerId) {
        if (!targetId || !containerId) return;
        this.currentTargetId = this._sanitizeId(targetId);
        this.containerId = containerId;

        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._start());
        } else {
            this._start();
        }
    }

    _start() {
        this.renderUI();
        // Allow time for auth to resolve before loading (optional but nice for username)
        // Check auth status
        setTimeout(() => {
            this.loadComments(true);
        }, 500);
    }

    _sanitizeId(str) {
        return str.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 100);
    }

    renderUI() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="comments-wrapper" style="margin-top:30px; border-top:1px solid var(--border); padding-top:20px;">
                <h3 style="font-family:'Cinzel', serif; color:var(--primary); margin-bottom:15px;">KOMENTAR</h3>
                
                <div class="comment-form" style="margin-bottom:25px;">
                    <textarea id="comment-input" class="form-input" placeholder="Tulis komentar Anda..." rows="3" style="width:100%; padding:12px; border-radius:8px; border:1px solid var(--border); font-family:inherit; resize:vertical; background:var(--input-bg); color:var(--text-main);"></textarea>
                    <button id="btn-post-comment" style="margin-top:10px; background:var(--primary); color:white; border:none; padding:8px 20px; border-radius:50px; cursor:pointer; font-weight:bold;">Kirim Komentar</button>
                    <div id="comment-status" style="margin-top:5px; font-size:0.8rem;"></div>
                </div>

                <div id="comment-list-ui">
                    <!-- Comments injected here -->
                    <div class="skeleton-text" style="height:60px; margin-bottom:10px;"></div>
                    <div class="skeleton-text" style="height:60px; margin-bottom:10px;"></div>
                </div>

                <button id="btn-load-more-comments" style="display:none; width:100%; background:transparent; border:1px solid var(--border); color:var(--text-muted); padding:10px; border-radius:8px; margin-top:15px; cursor:pointer;">
                    Baca komentar lainnya...
                </button>
            </div>
        `;

        document.getElementById('btn-post-comment').onclick = () => this.postComment();
        document.getElementById('btn-load-more-comments').onclick = () => this.loadComments(false);
    }

    async loadComments(isReset = false) {
        if (isReset) {
            this.commentsList = [];
            this.lastVisible = null;
            document.getElementById('comment-list-ui').innerHTML = ''; // Clear skeleton
        }

        const listContainer = document.getElementById('comment-list-ui');
        const loadMoreBtn = document.getElementById('btn-load-more-comments');
        const statusEl = document.getElementById('comment-status');

        try {
            let q = query(
                collection(db, "comments"),
                where("targetId", "==", this.currentTargetId),
                orderBy("timestamp", "desc"),
                limit(this.limit)
            );

            if (this.lastVisible && !isReset) {
                q = query(
                    collection(db, "comments"),
                    where("targetId", "==", this.currentTargetId),
                    orderBy("timestamp", "desc"),
                    startAfter(this.lastVisible),
                    limit(this.limit)
                );
            }

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                if (isReset) listContainer.innerHTML = '<p style="color:var(--text-muted); font-style:italic;">Belum ada komentar. Jadilah yang pertama!</p>';
                loadMoreBtn.style.display = 'none';
                return;
            }

            this.lastVisible = snapshot.docs[snapshot.docs.length - 1];

            // Check if we likely have more (if we got exactly LIMIT, maybe there's more)
            if (snapshot.docs.length < this.limit) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
            }


            snapshot.forEach(d => {
                this._appendCommentElement(d);
            });
        } catch (e) {
            console.error("Load comments error", e);
            listContainer.innerHTML = '<p>Gagal memuat komentar.</p>';
        } finally {
            this.isLoading = false;
        }
    }

    _appendCommentElement(docSnapshot) {
        const data = docSnapshot.data();
        const container = document.getElementById('comment-list-ui');
        const div = document.createElement('div');
        div.id = `comment-${docSnapshot.id}`;
        div.className = 'comment-card';
        // Inline styles moved to CSS class 'comment-card' ideally, but keeping inline for now or relying on theme.css override
        div.style.padding = "15px";
        div.style.marginBottom = "10px";
        div.style.background = "var(--bg-card)";
        div.style.borderRadius = "8px";
        div.style.border = "1px solid var(--border)";
        div.style.position = "relative"; // For positioning delete button

        const dateStr = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString() : 'Baru saja';
        const name = data.username || "Anonymous";
        const text = data.text || "";

        // Check ownership
        let deleteBtn = "";
        const currentUser = auth.currentUser;
        if (currentUser && data.uid === currentUser.uid) {
            deleteBtn = `
            <button onclick="window.commentManager.deleteComment('${docSnapshot.id}')" 
                style="border:none; background:transparent; cursor:pointer; font-size:1.2rem; padding:5px; color:#d32f2f; transition:transform 0.2s;" 
                onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'"
                title="Hapus Komentar">
                🗑️
            </button>`;
        }

        // Reply Button (Future Feature Placeholder)
        // const replyBtn = `<button style="font-size:0.8rem; color:var(--primary); background:none; border:none; cursor:pointer; margin-top:5px;">Balas</button>`;

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <div style="display:flex; flex-direction:column;">
                     <span class="com-name" style="font-weight:bold; color:var(--primary);">${name}</span>
                     <span class="com-date" style="font-size:0.75rem; color:var(--text-muted);">${dateStr}</span>
                </div>
                ${deleteBtn}
            </div>
            <div class="com-body" style="font-size:0.9rem; line-height:1.5; color:var(--text-main);">${text.replace(/\n/g, '<br>')}</div>
        `;
        container.appendChild(div);
    }

    async postComment() {
        const input = document.getElementById('comment-input');
        const status = document.getElementById('comment-status');
        const text = input ? input.value.trim() : "";

        if (!text || text.length < 3) {
            // Using global notif if available, else alert
            if (window.showCustomNotif) window.showCustomNotif("Komentar terlalu pendek (min 3 karakter).", 'error');
            else alert("Komentar terlalu pendek (min 3 karakter).");
            return;
        }

        const btn = document.getElementById('btn-post-comment');
        if (btn) btn.disabled = true;

        if (status) {
            status.innerText = "Memeriksa...";
            status.style.color = "var(--text-muted)";
        }

        try {
            const currentUser = auth.currentUser;
            let uid = "guest";
            let username = "Anonymous";

            // --- 1. DETERMINE USER IDENTITY ---
            if (currentUser) {
                uid = currentUser.uid;
                if (currentUser.displayName) {
                    username = currentUser.displayName;
                } else {
                    // Try fetch profile
                    try {
                        const userSnap = await getDoc(doc(db, "users", uid));
                        if (userSnap.exists()) {
                            const d = userSnap.data();
                            username = d.nama || d.name || "Member MQ News";
                        } else username = "Member MQ News";
                    } catch (e) { username = "Member MQ News"; }
                }
            } else {
                // GUEST HANDLING
                // We use a simple local storage marker or a fingerprint for guests if needed
                // For now, let's treat "guest" as a shared UID for the query, but that would group ALL guests.
                // BETTER APPROACH FOR GUESTS: Check LocalStorage for *this* article.
                const guestStorageKey = `mq_comment_${this.currentTargetId}`;
                const guestCommentCount = parseInt(localStorage.getItem(guestStorageKey) || '0');

                if (guestCommentCount >= 1) {
                    // Trigger Login Popup for Guest Limit
                    // If page has showLoginPopup function (from bookmark-manager usually), use it.
                    // Or create a simple alert/confirm to redirect.
                    if (window.bookmarkManager && window.bookmarkManager._showLoginPopup) {
                        window.bookmarkManager._showLoginPopup(); // Re-use existing popup
                        if (window.showCustomNotif) window.showCustomNotif("Batas komentar tamu habis. Silahkan login.", 'error');
                    } else if (window.showLoginPopup) { // Fallback if exposed differently
                        window.showLoginPopup();
                    } else {
                        if (confirm("Batas 1 komentar untuk tamu. Login untuk komentar lagi?")) {
                            window.location.href = "login.html";
                        }
                    }

                    if (status) status.innerText = "";
                    if (btn) btn.disabled = false;
                    return;
                }
            }

            // --- 2. CHECK COMMENT LIMIT FOR LOGGED IN USER ---
            if (currentUser) {
                // Query Firestore to count comments by this UID on this TargetID
                // Note: Firestore count aggregation is cheaper/better, but simple getDocs limit is fine for small numbers.
                const qLimit = query(
                    collection(db, "comments"),
                    where("targetId", "==", this.currentTargetId),
                    where("uid", "==", uid)
                );

                const snapLimit = await getDocs(qLimit);
                if (!snapLimit.empty && snapLimit.size >= 2) {
                    if (window.showCustomNotif) window.showCustomNotif("Batas 2 komentar per artikel untuk akun ini.", 'error');
                    else alert("Batas 2 komentar per artikel tercapai.");

                    if (status) status.innerText = "";
                    if (btn) btn.disabled = false;
                    return;
                }
            }

            // --- 3. POST COMMENT ---
            if (status) status.innerText = "Mengirim...";

            await addDoc(collection(db, "comments"), {
                targetId: this.currentTargetId,
                text: text,
                username: username,
                uid: uid,
                timestamp: serverTimestamp()
            });

            // --- 4. SUCCESS HANDLING & LIMIT UPDATE ---
            if (!currentUser) {
                // If guest, increment local storage count
                const guestStorageKey = `mq_comment_${this.currentTargetId}`;
                localStorage.setItem(guestStorageKey, '1'); // Mark as commented
            }

            if (input) input.value = "";
            if (status) {
                status.innerText = "Komentar terkirim!";
                status.style.color = "green";
            }
            if (window.showCustomNotif) window.showCustomNotif("Komentar berhasil dikirim!", 'success');

            // Convert local storage guest comments to real check? No, local storage is enough for guest restriction.

            // Reload list
            await this.loadComments(true);

            setTimeout(() => {
                if (status) status.innerText = "";
            }, 3000);

        } catch (e) {
            console.error("Post error:", e);
            if (status) {
                status.innerText = "Gagal mengirim. Coba lagi.";
                status.style.color = "red";
            }
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    async deleteComment(commentId) {
        // Use custom confirmation if available (set by the page)
        if (window.showConfirmDelete) {
            window.showConfirmDelete(commentId);
            return;
        }

        // Fallback to standard confirm
        if (!confirm("Hapus komentar ini?")) return;
        await this.performDelete(commentId);
    }

    async performDelete(commentId) {
        try {
            await deleteDoc(doc(db, "comments", commentId));

            // Remove from UI
            const el = document.getElementById(`comment-${commentId}`);
            if (el) el.remove();

            // Optional: Show toast notif
            if (window.showCustomNotif) window.showCustomNotif("Komentar dihapus.", 'success');
            else alert("Komentar dihapus.");

        } catch (e) {
            console.error("Delete failed:", e);
            alert("Gagal menghapus komentar. Pastikan ini komentar Anda.");
        }
    }
}

const commentManager = new CommentManager();
export default commentManager;

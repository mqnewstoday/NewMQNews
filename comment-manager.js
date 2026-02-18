import { db, auth } from "./firebase-config.js";
import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp, startAfter, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

            snapshot.forEach(doc => {
                const data = doc.data();
                this._appendCommentElement(data);
            });

        } catch (e) {
            console.error("Error loading comments:", e);
            if (isReset) listContainer.innerHTML = '<p style="color:red;">Gagal memuat komentar.</p>';
        }
    }

    _appendCommentElement(data) {
        const container = document.getElementById('comment-list-ui');
        const div = document.createElement('div');
        div.className = 'comment-card';
        div.style.padding = "15px";
        div.style.marginBottom = "10px";
        div.style.background = "var(--bg-card)";
        div.style.borderRadius = "8px";
        div.style.border = "1px solid var(--border)";

        const dateStr = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString() : 'Baru saja';
        const name = data.username || "Anonymous";
        const text = data.text || "";

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span class="com-name" style="font-weight:bold; color:var(--primary);">${name}</span>
                <span class="com-date" style="font-size:0.75rem; color:var(--text-muted);">${dateStr}</span>
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
            alert("Komentar terlalu pendek (min 3 karakter).");
            return;
        }

        if (status) {
            status.innerText = "Mengirim...";
            status.style.color = "var(--text-muted)";
        }

        // Disable button
        const btn = document.getElementById('btn-post-comment');
        if (btn) btn.disabled = true;

        let username = "Anonymous";
        let uid = "guest";

        // Check Auth and Fetch Correct Name
        if (auth.currentUser) {
            uid = auth.currentUser.uid;

            // 1. Try Auth Display Name
            if (auth.currentUser.displayName) {
                username = auth.currentUser.displayName;
            } else {
                // 2. Fetch from Firestore Profile
                try {
                    const userRef = doc(db, "users", uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        username = userData.nama || userData.name || "Member MQ News";
                    } else {
                        username = "Member MQ News";
                    }
                } catch (e) {
                    username = "Member MQ News";
                }
            }
        }

        try {
            await addDoc(collection(db, "comments"), {
                targetId: this.currentTargetId,
                text: text,
                username: username,
                uid: uid,
                timestamp: serverTimestamp() // Firestore Server Time
            });

            if (input) input.value = "";
            if (status) {
                status.innerText = "Komentar terkirim!";
                status.style.color = "green";
            }

            // Reload list from scratch to show new comment at top
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
}

const commentManager = new CommentManager();
export default commentManager;

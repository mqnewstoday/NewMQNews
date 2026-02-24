import { db, auth } from "./firebase-config.js";
import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

class CommentManager {
    constructor() {
        this.commentsList = [];
        this.lastVisible = null;
        this.currentTargetId = null;
        this.containerId = null;
        this.limit = 5; // STRICT LIMIT 5
        this.isLoading = false;
    }

    init(targetId, containerId) {
        if (!targetId || !containerId) return;
        this.currentTargetId = targetId; // No sanitize needed if trusted
        this.containerId = containerId;
        this._start();
    }

    _start() {
        this.renderUI();
        // Wait for potential auth initialization
        setTimeout(() => {
            this.loadComments(true);
        }, 1000);
    }

    renderUI() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const isGuest = !auth.currentUser;

        container.innerHTML = `
            <div class="comments-wrapper" style="margin-top:30px; border-top:1px solid var(--border); padding-top:20px;">
                <h3 style="font-family:'Cinzel', serif; color:var(--primary); margin-bottom:15px;">KOMENTAR TERBARU</h3>
                
                <div class="comment-form" style="margin-bottom:25px; position:relative;">
                    <textarea id="comment-input" class="form-input" placeholder="${isGuest ? 'Login untuk berkomentar...' : 'Tulis komentar Anda...'}" 
                        ${isGuest ? 'readonly' : ''}
                        rows="3" style="width:100%; padding:12px; border-radius:8px; border:1px solid var(--border); font-family:inherit; resize:vertical; background:var(--input-bg); color:var(--text-main);"></textarea>
                    
                    <button id="btn-post-comment" style="margin-top:10px; background:var(--primary); color:white; border:none; padding:8px 20px; border-radius:50px; cursor:pointer; font-weight:bold; ${isGuest ? 'opacity:0.6;' : ''}">Kirim Komentar</button>
                    <div id="comment-status" style="margin-top:5px; font-size:0.8rem;"></div>
                    
                    ${isGuest ? `<div id="comment-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:5; cursor:pointer;" onclick="window.commentManager.handleGuestInteraction()"></div>` : ''}
                </div>

                <div id="comment-list-ui">
                    <div class="skeleton-text" style="height:60px; margin-bottom:10px;"></div>
                </div>
                
                <div style="text-align:center; font-size:0.8rem; color:var(--text-muted); margin-top:15px; font-style:italic;">
                    Menampilkan 5 komentar terbaru.
                </div>
            </div>
        `;

        // Only bind if not guest
        if (!isGuest) {
            document.getElementById('btn-post-comment').onclick = () => this.postComment();
        }
    }

    handleGuestInteraction() {
        // Show universal login popup from bookmark manager for consistency
        if (window.bookmarkManager && window.bookmarkManager._showLoginPopup) {
            // Pass specific message as requested by user
            window.bookmarkManager._showLoginPopup("Login untuk berkomentar.");
        } else {
            // Fallback if bookmark manager not ready
            if (confirm("Login untuk bergabung dalam diskusi?")) {
                window.location.href = "login.html";
            }
        }
    }

    async loadComments(isReset = true) {
        // ALL USERS CAN READ (Guest Read allowed again)

        // ALWAYS RESET: Strategy is just show top 5
        this.commentsList = [];
        const listContainer = document.getElementById('comment-list-ui');
        if (listContainer) listContainer.innerHTML = '';

        try {
            // Simple Query: Top 5 Descending
            const q = query(
                collection(db, "comments"),
                where("targetId", "==", this.currentTargetId),
                orderBy("timestamp", "desc"),
                limit(this.limit)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                listContainer.innerHTML = '<div style="text-align:center; color:var(--text-muted);">Belum ada komentar. Jadilah yang pertama!</div>';
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                data.id = doc.id;
                this.commentsList.push(data);
                this._appendCommentElement(doc);
            });

        } catch (error) {
            console.error("Error loading comments:", error);
            listContainer.innerHTML = '<div style="color:red; text-align:center;">Gagal memuat komentar.</div>';
        }
    }



    _appendCommentElement(docSnapshot) {
        const data = docSnapshot.data();
        const container = document.getElementById('comment-list-ui');

        // Create element
        const div = document.createElement('div');
        div.id = `comment-${docSnapshot.id}`;
        div.className = 'comment-card';
        div.style.padding = "15px";
        div.style.marginBottom = "10px";
        div.style.background = "var(--input-bg)"; // Slightly darker than card
        div.style.borderRadius = "8px";
        div.style.border = "1px solid var(--border)";
        div.style.position = "relative";

        const dateStr = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString() : 'Baru saja';
        const name = data.displayName || data.username || "Anonymous"; // Use displayName consistent with auth
        const text = data.text || "";
        const photo = data.photoURL || data.userPhoto || ""; // Use photoURL consistent with auth

        // Logic for Avatar / No Image
        let avatarHTML = "";
        if (photo) {
            avatarHTML = `<img src="${photo}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        } else {
            // Fallback
            avatarHTML = `<div style="font-size:0.6rem; color:var(--text-muted);">NO IMG</div>`;
        }

        // Check ownership for delete button
        let deleteBtn = "";
        const currentUser = auth.currentUser;
        if (currentUser && data.uid === currentUser.uid) {
            deleteBtn = `
            <button onclick="window.commentManager.deleteComment('${docSnapshot.id}')" 
                style="border:none; background:transparent; cursor:pointer; font-size:1rem; padding:5px; color:#d32f2f; transition:transform 0.2s;" 
                title="Hapus Komentar">
                🗑️
            </button>`;
        }

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <!-- AVATAR BOX -->
                    <div class="com-avatar" style="width:36px; height:36px; border-radius:50%; background:var(--input-bg); border:1px solid var(--border); overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center;">
                        ${avatarHTML}
                    </div>
                    <div style="display:flex; flex-direction:column;">
                         <span class="com-name" style="font-weight:bold; color:var(--primary); font-size:0.9rem;">${name}</span>
                         <span class="com-date" style="font-size:0.7rem; color:var(--text-muted);">${dateStr}</span>
                    </div>
                </div>
                ${deleteBtn}
            </div>
            <div class="com-body" style="font-size:0.9rem; line-height:1.5; color:var(--text-main); padding-left:46px;">${text.replace(/\n/g, '<br>')}</div>
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
            let userPhotoUrl = "";
            if (currentUser) {
                uid = currentUser.uid;
                // Fetch latest data from Firestore Database
                try {
                    const userSnap = await getDoc(doc(db, "users", uid));
                    if (userSnap.exists()) {
                        const d = userSnap.data();
                        username = d.nama || d.name || currentUser.displayName || "Member MQ News";
                        userPhotoUrl = d.fotoURL || currentUser.photoURL || "";
                    } else {
                        username = currentUser.displayName || "Member MQ News";
                        userPhotoUrl = currentUser.photoURL || "";
                    }
                } catch (e) {
                    username = currentUser.displayName || "Member MQ News";
                    userPhotoUrl = currentUser.photoURL || "";
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
                userPhoto: userPhotoUrl,
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
window.commentManager = commentManager; // Expose globally
export default commentManager;

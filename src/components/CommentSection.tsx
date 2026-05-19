'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createPortal } from 'react-dom';
import './CommentSection.css';

interface Comment {
  id: string;
  name: string;
  text: string;
  timestamp: number;
}

interface CommentSectionProps {
  itemId: string;
  category: 'audio' | 'artikel' | 'mubasyirat';
}

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyl9DM70aeZcnccVl6CLSnGg45VNLcZ8OOAZXX27Ja4CpedbklI2jhQN98HcjkTXuPEWQ/exec';

export default function CommentSection({ itemId, category }: CommentSectionProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 10;

  // Limit alert states
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showToastLimit, setShowToastLimit] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Auto-fill logged-in user's name
  useEffect(() => {
    if (user) {
      setName(user.displayName || user.email?.split('@')[0] || 'Pembaca Setia');
    } else {
      setName('');
    }
  }, [user]);

  // Comment limits check helpers (backed by LocalStorage per content)
  const getCommentCount = (): number => {
    if (user) {
      const keyUser = `mq_comments_count_${itemId}_${user.uid}`;
      return parseInt(localStorage.getItem(keyUser) || '0', 10);
    } else {
      const keyGuest = `mq_comments_count_${itemId}_guest`;
      return parseInt(localStorage.getItem(keyGuest) || '0', 10);
    }
  };

  const incrementCommentCount = () => {
    if (user) {
      const keyUser = `mq_comments_count_${itemId}_${user.uid}`;
      const current = parseInt(localStorage.getItem(keyUser) || '0', 10);
      localStorage.setItem(keyUser, (current + 1).toString());
    } else {
      const keyGuest = `mq_comments_count_${itemId}_guest`;
      const current = parseInt(localStorage.getItem(keyGuest) || '0', 10);
      localStorage.setItem(keyGuest, (current + 1).toString());
    }
  };

  // Generate deterministic background color based on name string
  const getAvatarBg = (userName: string) => {
    const colors = [
      '#9d1b1b', // Red-maroon
      '#1b3f9d', // Blue
      '#1b9d5c', // Green
      '#8022aa', // Purple
      '#cc6a00', // Orange
      '#008080', // Teal
      '#6b7280'  // Slate
    ];
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Human readable time offset
  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const sec = 1000;
    const min = 60 * sec;
    const hr = 60 * min;
    const day = 24 * hr;

    if (diff < 5 * sec) return 'Baru saja';
    if (diff < min) return `${Math.floor(diff / sec)} detik yang lalu`;
    if (diff < 60 * min) return `${Math.floor(diff / min)} menit yang lalu`;
    if (diff < 24 * hr) return `${Math.floor(diff / hr)} jam yang lalu`;
    return `${Math.floor(diff / day)} hari yang lalu`;
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SCRIPT_URL}?kontenId=${encodeURIComponent(itemId)}&tipeHalaman=${encodeURIComponent(category)}`);
      const data = await res.json();

      const mapped: Comment[] = data.map((c: any, idx: number) => ({
        id: `sheet-${idx}-${c.timestamp}`,
        name: c.nama || 'Anonim',
        text: c.pesan || '',
        timestamp: c.timestamp ? new Date(c.timestamp).getTime() : Date.now()
      }));

      // Sort comments by timestamp descending (newest first)
      mapped.sort((a, b) => b.timestamp - a.timestamp);

      setComments(mapped);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    setCurrentPage(1); // Reset page back to 1 on content change
  }, [itemId, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || submitting) return;

    // Verify comment limits first
    const currentCount = getCommentCount();
    if (user) {
      // Logged in user limit: 2 comments
      if (currentCount >= 2) {
        setShowToastLimit(true);
        setTimeout(() => setShowToastLimit(false), 4000);
        return;
      }
    } else {
      // Guest user limit: 1 comment
      if (currentCount >= 1) {
        setShowGuestModal(true);
        return;
      }
    }

    setSubmitting(true);

    const payload = {
      tipeHalaman: category,
      kontenId: itemId,
      nama: name.trim(),
      pesan: text.trim()
    };

    try {
      // Send as POST request using no-cors mode to safely bypass browser redirect CORS policies
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Clear text field and show success
      setText('');
      setSubmitted(true);
      incrementCommentCount();
      setTimeout(() => setSubmitted(false), 3000);

      // Re-fetch comments to show the new comment on the page.
      // We wait 1.2s to ensure the Google Sheet write thread completes!
      setTimeout(() => {
        fetchComments();
      }, 1200);

    } catch (err) {
      console.error('Error saving comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(comments.length / commentsPerPage);
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <section className="comment-section" id={`comments-${itemId}`}>
      <h3 className="comment-section__title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Diskusi & Komentar ({comments.length})
      </h3>

      {/* Comment Form */}
      <form className="comment-form" onSubmit={handleSubmit}>
        <h4 className="comment-form__title">Bagikan Pendapat Anda</h4>
        <div className="comment-form__grid">
          <div className="comment-form__group">
            <label htmlFor="comment-name" className="comment-form__label">Nama Lengkap</label>
            <input
              id="comment-name"
              type="text"
              className="comment-form__input"
              placeholder={user ? "Nama profil terisi otomatis" : "Masukkan nama Anda..."}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting || !!user} // Locked when logged in for security and premium UX
            />
          </div>
        </div>

        <div className="comment-form__group" style={{ marginTop: 'var(--space-sm)' }}>
          <label htmlFor="comment-text" className="comment-form__label">Pesan / Komentar</label>
          <textarea
            id="comment-text"
            rows={4}
            className="comment-form__input comment-form__textarea"
            placeholder="Tulis pendapat atau pertanyaan Anda di sini..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            disabled={submitting}
          />
        </div>

        <div className="comment-form__actions">
          <button type="submit" className="btn btn-primary comment-form__submit-btn" disabled={submitting}>
            {submitting ? 'Mengirim...' : 'Kirim Komentar'}
            {!submitting && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '6px' }}>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
          {submitted && (
            <span className="comment-form__success-msg animate-fade-in">
              ✓ Komentar berhasil dikirim!
            </span>
          )}
        </div>
      </form>

      {/* Comment List */}
      <div className="comment-list">
        {loading ? (
          <div className="comment-section__loading">
            <div className="comment-spinner"></div>
            <span>Memuat komentar...</span>
          </div>
        ) : comments.length > 0 ? (
          currentComments.map((comment, index) => (
            <div
              key={comment.id}
              className="comment-bubble"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className="comment-bubble__avatar"
                style={{ backgroundColor: getAvatarBg(comment.name) }}
              >
                {comment.name.charAt(0).toUpperCase()}
              </div>
              <div className="comment-bubble__body">
                <div className="comment-bubble__header">
                  <span className="comment-bubble__name">{comment.name}</span>
                  <span className="comment-bubble__dot">•</span>
                  <time className="comment-bubble__time">{getRelativeTime(comment.timestamp)}</time>
                </div>
                <p className="comment-bubble__text">{comment.text}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="comment-list__empty">
            Belum ada komentar di halaman ini. Yuk tulis komentar pertamamu!
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="comment-pagination animate-fade-in">
          <button
            type="button"
            className="comment-pagination__btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            title="Komentar Terbaru"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Komentar Terbaru
          </button>
          <span className="comment-pagination__info">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            type="button"
            className="comment-pagination__btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            title="Komentar Lainnya"
          >
            Komentar Lainnya
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '6px' }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}

      {/* Guest Limit Alert Modal Dialog (Identical to save/logout prompt, teleported to body) */}
      {mounted && showGuestModal && createPortal(
        <div className="custom-dialog-overlay">
          <div className="custom-dialog-box animate-scale-in" role="dialog" aria-modal="true">
            <div className="custom-dialog-icon custom-dialog-icon--warning" style={{ color: 'var(--color-primary)', background: 'rgba(157, 27, 27, 0.08)' }}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="custom-dialog-title">Batas Komentar Tamu</h3>
            <p className="custom-dialog-message">
              Pembaca tamu hanya diperbolehkan menulis 1 komentar per konten. Silakan masuk atau mendaftar sekarang untuk bisa berdiskusi lebih banyak!
            </p>
            <div className="custom-dialog-actions">
              <button
                type="button"
                className="custom-dialog-btn custom-dialog-btn--cancel"
                onClick={() => setShowGuestModal(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="custom-dialog-btn custom-dialog-btn--confirm"
                onClick={() => {
                  setShowGuestModal(false);
                  router.push('/login');
                }}
              >
                Masuk / Daftar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Registered User Limit Alert Toast (Identical to subscription active status toggle toast) */}
      {showToastLimit && (
        <div className="toast animate-slide-in-right">
          Batas komentar tercapai. Pembaca terdaftar dibatasi maksimal 2 komentar per konten.
        </div>
      )}
    </section>
  );
}

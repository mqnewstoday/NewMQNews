'use client';

import { useState, useEffect } from 'react';
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    try {
      const res = await fetch(`${SCRIPT_URL}?kontenId=${encodeURIComponent(itemId)}&tipeHalaman=${encodeURIComponent(category)}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Data komentar dari server tidak valid.');
      }
      
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
      console.warn('Silent notice: Failed to retrieve comments from Google App Script.', err);
      setError('Komentar tidak dapat dimuat saat ini. Pastikan koneksi internet Anda aktif atau nonaktifkan pemblokir iklan (ad-blocker) yang menghalangi Google Apps Script.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    
    // Safely execute within useEffect hook boundary
    const executeFetch = async () => {
      if (active) {
        await fetchComments();
      }
    };
    
    executeFetch().catch((err) => {
      console.error('Unhandled hook fetch exception:', err);
    });

    return () => {
      active = false;
    };
  }, [itemId, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || submitting) return;

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
      setTimeout(() => setSubmitted(false), 3000);
      
      // Re-fetch comments to show the new comment on the page.
      // We wait 1.2s to ensure the Google Sheet write thread completes!
      setTimeout(() => {
        fetchComments().catch(() => {});
      }, 1200);

    } catch (err) {
      console.error('Error saving comment:', err);
    } finally {
      setSubmitting(false);
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
              placeholder="Masukkan nama Anda..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
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
        ) : error ? (
          <div className="comment-section__error" style={{
            background: 'rgba(157, 27, 27, 0.08)',
            border: '1px solid rgba(157, 27, 27, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            fontSize: '0.88rem',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.6',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment, index) => (
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
    </section>
  );
}

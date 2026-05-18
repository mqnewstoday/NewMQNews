'use client';

import { useState, useEffect } from 'react';
import BookmarkButton from './BookmarkButton';
import './ArticleShareActions.css';

interface ArticleShareActionsProps {
  articleId: string;
  title: string;
  type?: 'berita' | 'mubasyirat' | 'audio';
}

export default function ArticleShareActions({ articleId, title, type = 'berita' }: ArticleShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleCopyLink = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error('Failed to copy link:', err));
  };

  const handleWhatsAppShare = () => {
    if (!currentUrl) return;
    const text = `${title}\n\nBaca selengkapnya di sini:\n${currentUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="article-share-actions">
      {/* Save Bookmark */}
      <BookmarkButton articleId={articleId} size="medium" showLabel type={type} />

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`btn btn-outline share-action-btn share-action-btn--copy ${copied ? 'share-action-btn--copied' : ''}`}
        title="Salin tautan ke clipboard"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="share-action-btn__icon">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <span className="share-action-btn__label">
          {copied ? 'Tersalin!' : 'Salin Link'}
        </span>
      </button>

      {/* Share to WhatsApp */}
      <button
        onClick={handleWhatsAppShare}
        className="btn btn-outline share-action-btn share-action-btn--whatsapp"
        title="Bagikan ke WhatsApp"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="share-action-btn__icon">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        <span className="share-action-btn__label">WhatsApp</span>
      </button>
    </div>
  );
}

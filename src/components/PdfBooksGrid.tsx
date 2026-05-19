'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './PdfBooksGrid.css';

interface Book {
  id: string | number;
  name: string;
  imageUrl: string;
  pdfUrl: string;
}

interface PdfBooksGridProps {
  books: Book[];
}

export default function PdfBooksGrid({ books }: PdfBooksGridProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Safe body scroll locking when modal is open
  useEffect(() => {
    if (selectedBook) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedBook]);

  const handleOpenPreview = (e: React.MouseEvent, book: Book) => {
    e.preventDefault();
    setIframeLoading(true);
    setSelectedBook(book);
  };

  const handleClosePreview = () => {
    setSelectedBook(null);
  };

  // Extract Google Drive ID to generate standard embed preview URL
  const getGoogleDriveEmbedUrl = (url: string): string => {
    if (!url) return '';
    const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      return `https://drive.google.com/file/d/${fileDMatch[1]}/preview`;
    }
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }
    return url;
  };

  // Extract Google Drive ID to generate a direct download URL bypassing external file preview pages
  const getGoogleDriveDownloadUrl = (url: string): string => {
    if (!url) return '';
    const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileDMatch[1]}`;
    }
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
    }
    return url;
  };

  return (
    <>
      <div className="pdf-books-grid">
        {books.map((book) => (
          <div key={book.id} className="pdf-book-card" id={`pdf-book-${book.id}`}>
            <div className="pdf-book-card__img-container">
              <img 
                src={book.imageUrl} 
                alt={book.name} 
                className="pdf-book-card__img"
                loading="lazy"
              />
            </div>
            <h3 className="pdf-book-card__title">{book.name}</h3>
            <button 
              onClick={(e) => handleOpenPreview(e, book)}
              className="pdf-book-card__btn"
              style={{ cursor: 'pointer', border: 'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Baca / View PDF
            </button>
          </div>
        ))}
      </div>

      {mounted && selectedBook && createPortal(
        <div className="pdf-preview-overlay" onClick={handleClosePreview}>
          <div className="pdf-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-preview-header">
              <div className="pdf-preview-header__left">
                <span className="pdf-preview-badge">PDF Preview</span>
                <h3 className="pdf-preview-title">{selectedBook.name}</h3>
              </div>
              <button className="pdf-preview-close" onClick={handleClosePreview} aria-label="Tutup">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="pdf-preview-body">
              {iframeLoading && (
                <div className="pdf-preview-spinner-container">
                  <div className="pdf-preview-spinner"></div>
                  <span className="pdf-preview-loading-text">Memuat dokumen dari Google Drive...</span>
                </div>
              )}
              <iframe
                src={getGoogleDriveEmbedUrl(selectedBook.pdfUrl)}
                className={`pdf-preview-iframe ${iframeLoading ? 'pdf-preview-iframe--loading' : ''}`}
                frameBorder="0"
                allowFullScreen
                onLoad={() => setIframeLoading(false)}
                title={selectedBook.name}
              ></iframe>
            </div>

            <div className="pdf-preview-footer">
              <button className="btn btn-outline pdf-preview-btn-close" onClick={handleClosePreview}>
                Tutup
              </button>
              <a
                href={getGoogleDriveDownloadUrl(selectedBook.pdfUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary pdf-preview-btn-download"
                download
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Unduh PDF
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

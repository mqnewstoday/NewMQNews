'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { AudioItem } from '@/utils/sheetsApi';
import './AudioPlayerDetail.css';

interface AudioPlayerDetailProps {
  item: AudioItem;
  prevId: string | null;
  nextId: string | null;
}

export default function AudioPlayerDetail({ item, prevId, nextId }: AudioPlayerDetailProps) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    const text = `${item.title}\n\nDengarkan audionya di sini:\n${currentUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const { user } = useAuth();

  // Check bookmarks on mount/id change and sync with Firestore
  useEffect(() => {
    const local = JSON.parse(localStorage.getItem('mq_audio_bookmarks') || '[]') as string[];
    setIsBookmarked(local.includes(item.id));

    async function syncWithFirestore() {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            const remote = (data.audio_bookmarks || []) as string[];
            
            const merged = Array.from(new Set([...local, ...remote]));
            localStorage.setItem('mq_audio_bookmarks', JSON.stringify(merged));
            setIsBookmarked(merged.includes(item.id));
            
            if (remote.length !== merged.length) {
              await setDoc(userRef, { audio_bookmarks: merged }, { merge: true });
            }
          } else {
            await setDoc(userRef, { audio_bookmarks: local }, { merge: true });
          }
        } catch (error) {
          console.error("Error syncing audio bookmarks with Firestore:", error);
        }
      }
    }

    syncWithFirestore();
  }, [item.id, user]);

  // Load and play status updates
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [item.id]);

  // Toggle bookmark state in LocalStorage & Firestore
  const handleBookmarkToggle = async () => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    const saved = JSON.parse(localStorage.getItem('mq_audio_bookmarks') || '[]') as string[];
    let updated: string[];

    if (isBookmarked) {
      updated = saved.filter((id) => id !== item.id);
      setIsBookmarked(false);
    } else {
      updated = [...saved, item.id];
      setIsBookmarked(true);
    }

    localStorage.setItem('mq_audio_bookmarks', JSON.stringify(updated));

    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { audio_bookmarks: updated }, { merge: true });
      } catch (error) {
        console.error("Error saving audio bookmark to Firestore:", error);
      }
    }
  };

  // Audio Playback Helpers
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Audio play error:', err));
    }
  };

  const skipTime = (amount: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + amount));
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    // Auto-advance if next audio is available!
    if (nextId) {
      router.push(`/audio/${nextId}`);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="audio-player-detail"
      style={{
        backgroundImage: `linear-gradient(var(--audio-player-overlay), var(--audio-player-overlay)), url(${item.thumbnail})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={item.embedLink}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      <div className="audio-player-detail__layout">
        {/* Thumbnail area (Vinyl record disc) */}
        <div className="audio-player-detail__thumb-container" onClick={() => setIsModalOpen(true)} title="Klik untuk memperbesar">
          <div className={`audio-player-detail__vinyl-disc ${isPlaying ? 'audio-player-detail__vinyl-disc--playing' : ''}`}>
            <img
              src={item.thumbnail}
              alt={item.title}
              className="audio-player-detail__img"
            />
          </div>
          {isPlaying && (
            <div className="audio-player-detail__waveform">
              <span className="wave-bar"></span>
              <span className="wave-bar"></span>
              <span className="wave-bar"></span>
              <span className="wave-bar"></span>
              <span className="wave-bar"></span>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="audio-player-detail__info">
          <h1 className="audio-player-detail__title">{item.title}</h1>
          <p className="audio-player-detail__desc">{item.description}</p>

          {/* Progress bar */}
          <div className="audio-player-detail__progress-container">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              className="audio-player-detail__seek-bar"
            />
            <div className="audio-player-detail__time-labels">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Navigation and Audio Controls */}
          <div className="audio-player-detail__controls">
            {/* Prev Track */}
            <button
              onClick={() => prevId && router.push(`/audio/${prevId}`)}
              className="control-btn control-btn--nav"
              disabled={!prevId}
              title="Audio Sebelumnya"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="19 20 9 12 19 4 19 20" />
                <line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" strokeWidth="3" />
              </svg>
            </button>

            {/* Skip Back 10s */}
            <button
              onClick={() => skipTime(-10)}
              className="control-btn control-btn--skip"
              title="Mundur 10 Detik"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <text x="7.5" y="15.5" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none">10</text>
              </svg>
            </button>

            {/* Play / Pause Toggle */}
            <button
              onClick={togglePlay}
              className={`control-btn control-btn--play-pause ${isPlaying ? 'playing' : ''}`}
              title={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isPlaying ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white" style={{ marginLeft: '4px' }}>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            {/* Skip Forward 10s */}
            <button
              onClick={() => skipTime(10)}
              className="control-btn control-btn--skip"
              title="Maju 10 Detik"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <text x="9.5" y="15.5" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none">10</text>
              </svg>
            </button>

            {/* Next Track */}
            <button
              onClick={() => nextId && router.push(`/audio/${nextId}`)}
              className="control-btn control-btn--nav"
              disabled={!nextId}
              title="Audio Berikutnya"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 4 15 12 5 20 5 4" />
                <line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="3" />
              </svg>
            </button>
          </div>

          {/* Action Buttons: Download & Bookmark */}
          <div className="audio-player-detail__actions">
            {/* Download */}
            <a
              href={item.embedLink}
              download={`${item.title}.mp3`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline audio-action-btn"
              title="Unduh File Audio"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Unduh Audio
            </a>

            {/* Bookmark / Save */}
            <button
              onClick={handleBookmarkToggle}
              className={`btn btn-outline audio-action-btn ${isBookmarked ? 'audio-action-btn--saved' : ''} ${animating ? 'audio-action-btn--animating' : ''}`}
              title={isBookmarked ? 'Hapus dari Simpanan' : 'Simpan Audio'}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isBookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {isBookmarked ? 'Tersimpan' : 'Simpan'}
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className={`btn btn-outline audio-action-btn audio-action-btn--copy ${copied ? 'audio-action-btn--copied' : ''}`}
              title="Salin tautan ke clipboard"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copied ? 'Tersalin!' : 'Salin Link'}
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="btn btn-outline audio-action-btn audio-action-btn--whatsapp"
              title="Bagikan ke WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen Spectrum & Vinyl Popup Modal */}
      {isModalOpen && (
        <div className="audio-player-modal" onClick={() => setIsModalOpen(false)}>
          <div className="audio-player-modal__close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          
          <div className="audio-player-modal__content" onClick={(e) => e.stopPropagation()}>
            {/* Circular Spectrum Ring */}
            <div className="audio-player-modal__spectrum-ring">
              {[...Array(32)].map((_, i) => (
                <div
                  key={i}
                  className={`modal-spectrum-bar ${isPlaying ? 'modal-spectrum-bar--playing' : ''}`}
                  style={{
                    transform: `rotate(${i * 11.25}deg) translateY(-140px)`,
                    animationDelay: `${(i % 8) * 0.08}s`,
                  }}
                />
              ))}
            </div>
            
            {/* Spinning Vinyl Disc inside Modal */}
            <div className={`audio-player-detail__vinyl-disc audio-player-detail__vinyl-disc--modal ${isPlaying ? 'audio-player-detail__vinyl-disc--playing' : ''}`}>
              <img
                src={item.thumbnail}
                alt={item.title}
                className="audio-player-detail__img"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

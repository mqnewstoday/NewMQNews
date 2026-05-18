'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './BookmarkButton.css';

interface BookmarkButtonProps {
  articleId: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  type?: 'berita' | 'mubasyirat' | 'audio';
}

export default function BookmarkButton({ 
  articleId, 
  size = 'medium', 
  showLabel = false,
  type = 'berita'
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [animating, setAnimating] = useState(false);
  const { user } = useAuth();

  const getStorageKey = () => {
    if (type === 'mubasyirat') return 'mq_mubasyirat_bookmarks';
    if (type === 'audio') return 'mq_audio_bookmarks';
    return 'mq_bookmarks';
  };

  const getFirestoreField = () => {
    if (type === 'mubasyirat') return 'mubasyirat_bookmarks';
    if (type === 'audio') return 'audio_bookmarks';
    return 'bookmarks';
  };

  useEffect(() => {
    const key = getStorageKey();
    const local = JSON.parse(localStorage.getItem(key) || '[]') as string[];
    setBookmarked(local.includes(articleId));

    async function syncWithFirestore() {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            const firestoreField = getFirestoreField();
            const remote = (data[firestoreField] || []) as string[];
            
            const merged = Array.from(new Set([...local, ...remote]));
            localStorage.setItem(key, JSON.stringify(merged));
            setBookmarked(merged.includes(articleId));
            
            if (remote.length !== merged.length) {
              await setDoc(userRef, { [firestoreField]: merged }, { merge: true });
            }
          } else {
            const firestoreField = getFirestoreField();
            await setDoc(userRef, { [firestoreField]: local }, { merge: true });
          }
        } catch (error) {
          console.error("Error syncing bookmarks with Firestore:", error);
        }
      }
    }

    syncWithFirestore();
  }, [articleId, user, type]);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    const key = getStorageKey();
    const firestoreField = getFirestoreField();
    const bookmarks = JSON.parse(localStorage.getItem(key) || '[]') as string[];

    let updated: string[];
    if (bookmarked) {
      updated = bookmarks.filter((id: string) => id !== articleId);
      setBookmarked(false);
    } else {
      updated = [...bookmarks, articleId];
      setBookmarked(true);
    }

    localStorage.setItem(key, JSON.stringify(updated));

    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { [firestoreField]: updated }, { merge: true });
      } catch (error) {
        console.error("Error saving bookmark to Firestore:", error);
      }
    }
  };

  return (
    <button
      className={`bookmark-btn bookmark-btn--${size} ${bookmarked ? 'bookmark-btn--active' : ''} ${animating ? 'bookmark-btn--animating' : ''}`}
      onClick={toggleBookmark}
      aria-label={bookmarked ? 'Hapus bookmark' : 'Tambah bookmark'}
      title={bookmarked ? 'Hapus bookmark' : 'Tambah bookmark'}
      id={`bookmark-btn-${articleId}`}
    >
      <svg
        className="bookmark-btn__icon"
        viewBox="0 0 24 24"
        fill={bookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {showLabel && (
        <span className="bookmark-btn__label">
          {bookmarked ? 'Tersimpan' : 'Simpan'}
        </span>
      )}
    </button>
  );
}

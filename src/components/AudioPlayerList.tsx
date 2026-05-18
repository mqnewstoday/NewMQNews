import Link from 'next/link';
import type { AudioItem } from '@/utils/sheetsApi';

interface AudioPlayerListProps {
  items: AudioItem[];
}

export default function AudioPlayerList({ items }: AudioPlayerListProps) {
  return (
    <div className="audio-list-grid">
      {items.map((item) => (
        <Link key={item.id} href={`/audio/${item.id}`} className="audio-player-card" id={`audio-player-${item.id}`}>
          <div className="audio-player-card__thumb">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="audio-player-card__img"
              loading="lazy"
            />
            <div className="audio-player-card__play-btn-overlay">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
          <div className="audio-player-card__content">
            <div>
              <h3 className="audio-player-card__title" title={item.title}>{item.title}</h3>
              <p className="audio-player-card__desc">{item.description}</p>
            </div>
            <span className="btn btn-outline btn-sm audio-player-card__action-btn" style={{ alignSelf: 'flex-start', padding: '6px 14px', fontSize: '0.78rem', marginTop: 'var(--space-xs)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Dengarkan
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import type { BannerItem } from '@/utils/sheetsApi';
import './BannerSlider.css';

interface BannerSliderProps {
  banners: BannerItem[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  return (
    <section className="banner-slider-container" id="hero-slider">
      <div className="container">
        <div className="banner-slider">
          <div className="banner-slider__track">
            {banners.map((banner, index) => {
              const isActive = index === currentIndex;
              return (
                <a
                  key={index}
                  href={banner.link_url}
                  target={banner.link_url.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className={`banner-slider__slide ${isActive ? 'banner-slider__slide--active' : ''}`}
                  style={{ display: isActive ? 'block' : 'none' }}
                >
                  <img
                    src={banner.image_url}
                    alt={banner.caption || 'MQ News Today Banner'}
                    className="banner-slider__image"
                  />
                  {banner.caption && (
                    <div className="banner-slider__caption">
                      <span className="banner-slider__caption-text">{banner.caption}</span>
                    </div>
                  )}
                </a>
              );
            })}
          </div>

          {banners.length > 1 && (
            <div className="banner-slider__dots">
              {banners.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`banner-slider__dot ${index === currentIndex ? 'banner-slider__dot--active' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

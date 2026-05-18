import Link from 'next/link';
import './CategoryNav.css';

interface CategoryNavProps {
  categories?: string[];
  activeCategory?: string;
}

const BERITA_CATEGORIES = ['Semua', 'Geopolitik', 'Eskatologi', 'Mimpi Qasim', 'Timur Tengah', 'Trending', 'Video'];

export default function CategoryNav({ activeCategory }: CategoryNavProps) {
  return (
    <nav className="category-nav" id="category-nav">
      <div className="container">
        <div className="category-nav__inner">
          {BERITA_CATEGORIES.map((cat) => {
            const href = cat === 'Semua' ? '/berita' : `/berita?kategori=${cat.toLowerCase().replace(/\s+/g, '-')}`;
            const isActive = cat === 'Semua' 
              ? !activeCategory 
              : activeCategory?.toLowerCase() === cat.toLowerCase();
            
            return (
              <Link
                key={cat}
                href={href}
                className={`category-nav__item ${isActive ? 'category-nav__item--active' : ''}`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

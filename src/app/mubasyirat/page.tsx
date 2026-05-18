import Link from 'next/link';
import { fetchMubasyirat } from '@/utils/sheetsApi';
import type { MubasyiratItem } from '@/utils/sheetsApi';
import BackButton from '@/components/BackButton';
import Pagination from '@/components/Pagination';
import MubasyiratFilters from '@/components/MubasyiratFilters';
import './mubasyirat.css';

export const revalidate = 300;

export default async function MubasyiratPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const page = parseInt((params.page as string) || '1', 10);
  const ITEMS_PER_PAGE = 8;

  const mubasyiratItems = await fetchMubasyirat();
  
  // 1. Extract unique themes dynamically from the spreadsheet
  const themes = Array.from(
    new Set(mubasyiratItems.map((item) => item.category).filter(Boolean))
  ) as string[];

  // 2. Define valid years according to constraints:
  // "1980/1981, 1993, 1994, 1998, skip 2000 (2001 hingga 2009), skip 2010 (2011 hingga 2022)"
  const VALID_YEARS = [
    '1980/1981', '1993', '1994', '1998',
    '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009',
    '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'
  ];

  // 3. Filter items based on selected Theme and Year
  const currentTheme = (params.tema as string) || 'semua';
  const currentYear = (params.tahun as string) || 'semua';

  let filteredItems = mubasyiratItems;

  if (currentTheme !== 'semua') {
    filteredItems = filteredItems.filter(
      (item) => item.category?.toLowerCase() === currentTheme.toLowerCase()
    );
  }

  if (currentYear !== 'semua') {
    filteredItems = filteredItems.filter((item) => {
      if (!item.year) return false;
      const itemYearStr = item.year.toString().trim();
      
      if (currentYear === '1980/1981') {
        return itemYearStr.includes('1980') || itemYearStr.includes('1981');
      }
      
      return itemYearStr === currentYear;
    });
  }

  // Apply search query filtering if present
  const query = params.q as string;
  if (query) {
    filteredItems = filteredItems.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      item.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  // 4. Paginate the filtered list
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  return (
    <div className="mubasyirat-page container section">
      {/* Smart Back Button */}
      <BackButton />

      <div className="mubasyirat-page__header" style={{ marginTop: 'var(--space-sm)' }}>
        <h1 className="mubasyirat-page__title">
          {query ? `Hasil Pencarian: "${query}"` : 'Koleksi Mubasyirat'}
        </h1>
        <p className="mubasyirat-page__desc">
          Kumpulan mimpi-mimpi rahmani Muhammad Qasim yang menceritakan tentang masa depan umat Islam, nubuat akhir zaman, dan petunjuk kebenaran.
        </p>
      </div>

      {/* Premium Intersection Filtering Dashboard */}
      <MubasyiratFilters 
        themes={themes}
        validYears={VALID_YEARS}
        currentTheme={currentTheme}
        currentYear={currentYear}
      />

      {currentItems.length > 0 ? (
        <>
          <div className="mubasyirat-grid">
            {currentItems.map((item) => (
              <MubasyiratCard key={item.id} item={item} />
            ))}
          </div>
          <Pagination totalPages={totalPages} currentPage={page} />
        </>
      ) : (
        <div className="mubasyirat-page__empty" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4xl) var(--space-xl)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 'var(--space-md)', opacity: 0.7 }}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '8px' }}>Tidak Ada Hasil</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto', marginBottom: 'var(--space-lg)' }}>
            Mimpi dengan tema <strong>"{currentTheme === 'semua' ? 'Semua Tema' : currentTheme}"</strong> di tahun <strong>"{currentYear === 'semua' ? 'Semua Tahun' : 'Tahun ' + currentYear}"</strong> tidak ditemukan atau belum ditambahkan ke sheet.
          </p>
          <Link 
            href="/mubasyirat" 
            className="btn btn--primary" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '12px 24px',
              fontWeight: 600
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            Atur Ulang Filter
          </Link>
        </div>
      )}
    </div>
  );
}

function MubasyiratCard({ item }: { item: MubasyiratItem }) {
  return (
    <Link href={`/mubasyirat/${item.id}`} className="mubasyirat-card" id={`mubasyirat-card-${item.id}`}>
      <div className="mubasyirat-card__thumb">
        {/* Blurred backdrop background */}
        <div
          className="mubasyirat-card__blur-bg"
          style={{
            backgroundImage: `url(${item.imageUrl})`,
            position: 'absolute',
            inset: 0,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(16px)',
            opacity: 0.5,
            transform: 'scale(1.15)',
            zIndex: 1,
          }}
        />
        {/* Actual contain image */}
        <img
          src={item.imageUrl}
          alt={item.title}
          className="mubasyirat-card__image"
          loading="lazy"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            zIndex: 2,
          }}
        />
        <div className="mubasyirat-card__overlay" style={{ zIndex: 3 }} />
        {item.category && (
          <span className="category-tag mubasyirat-card__tag" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, background: 'var(--color-secondary)', color: '#1a2e00', fontSize: '0.65rem' }}>
            {item.category}
          </span>
        )}
        {item.year && (
          <span className="year-tag mubasyirat-card__year-tag" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'rgba(0,0,0,0.6)', color: '#ffffff', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
            {item.year}
          </span>
        )}
      </div>
      <div className="mubasyirat-card__body">
        <h4 className="mubasyirat-card__title">{item.title}</h4>
        <p className="mubasyirat-card__excerpt">{item.excerpt}</p>
      </div>
    </Link>
  );
}

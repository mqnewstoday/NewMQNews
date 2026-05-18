'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface FiltersProps {
  themes: string[];
  validYears: string[];
  currentTheme: string;
  currentYear: string;
}

export default function MubasyiratFilters({ themes, validYears, currentTheme, currentYear }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (theme: string, year: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (theme && theme !== 'semua') {
      params.set('tema', theme);
    } else {
      params.delete('tema');
    }

    if (year && year !== 'semua') {
      params.set('tahun', year);
    } else {
      params.delete('tahun');
    }

    // Always reset to page 1 when filter parameters change
    params.set('page', '1');

    router.push(`/mubasyirat?${params.toString()}`);
  };

  return (
    <div className="mubasyirat-filters" id="mubasyirat-filters">
      <div className="filter-group">
        <label htmlFor="theme-select">Tema Mimpi</label>
        <select 
          id="theme-select" 
          className="filter-select"
          value={currentTheme}
          onChange={(e) => handleFilterChange(e.target.value, currentYear)}
        >
          <option value="semua">Semua Tema</option>
          {themes.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="year-select">Tahun Kejadian</label>
        <select 
          id="year-select" 
          className="filter-select"
          value={currentYear}
          onChange={(e) => handleFilterChange(currentTheme, e.target.value)}
        >
          <option value="semua">Semua Tahun</option>
          {validYears.map((year) => (
            <option key={year} value={year}>
              Tahun {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

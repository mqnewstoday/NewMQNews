import { Metadata } from 'next';
import Link from 'next/link';
import { fetchArticlesByCategory, fetchArticles, fetchCategories } from '@/utils/sheetsApi';
import ArticleCard from '@/components/ArticleCard';
import CategoryNav from '@/components/CategoryNav';
import BackButton from '@/components/BackButton';
import './kategori.css';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${categoryName} — Berita ${categoryName} Terbaru`,
    description: `Baca berita ${categoryName.toLowerCase()} terbaru dan terlengkap hanya di MQ News Today. Update setiap hari.`,
    openGraph: {
      title: `Berita ${categoryName} — MQ News Today`,
      description: `Kumpulan berita ${categoryName.toLowerCase()} terbaru.`,
    },
  };
}

export async function generateStaticParams() {
  const categories = await fetchCategories();
  return categories.map((cat) => ({
    category: cat.toLowerCase(),
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  const articles = await fetchArticlesByCategory(category);
  const allCategories = await fetchCategories();

  return (
    <div className="category-page">
      {/* Category Nav */}
      <CategoryNav categories={allCategories} activeCategory={category} />

      <div className="container section">
        {/* Smart Back Button */}
        <BackButton />

        {/* Breadcrumb */}
        <nav className="breadcrumb" id="breadcrumb" style={{ marginTop: 'var(--space-xs)' }}>
          <Link href="/">Beranda</Link>
          <span className="separator">/</span>
          <span className="current">{categoryName}</span>
        </nav>

        {/* Page Header */}
        <div className="category-page__header">
          <h1 className="category-page__title">
            <span className="category-page__title-accent" />
            {categoryName}
          </h1>
          <p className="category-page__desc">
            Menampilkan {articles.length} artikel dalam kategori {categoryName}
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-3">
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        ) : (
          <div className="category-page__empty">
            <div className="category-page__empty-icon">📰</div>
            <h3>Belum Ada Artikel</h3>
            <p>Belum ada artikel dalam kategori {categoryName}. Silakan cek kategori lainnya.</p>
            <Link href="/" className="btn btn-primary">
              Kembali ke Beranda
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { fetchArticles, fetchArticlesByCategory, fetchArticleBySlug, fetchAudio, fetchMubasyirat } from '@/utils/sheetsApi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');
    const featured = searchParams.get('featured');
    const type = searchParams.get('type');

    // Fetch all collections
    if (type === 'all') {
      const [articles, audio, mubasyirat] = await Promise.all([
        fetchArticles(),
        fetchAudio(),
        fetchMubasyirat(),
      ]);
      return NextResponse.json({ articles, audio, mubasyirat });
    }

    // Fetch single article by slug
    if (slug) {
      const article = await fetchArticleBySlug(slug);
      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      return NextResponse.json({ article });
    }

    // Fetch articles by category
    if (category) {
      const articles = await fetchArticlesByCategory(category);
      return NextResponse.json({ articles, total: articles.length });
    }

    // Fetch all articles
    let articles = await fetchArticles();

    // Filter featured
    if (featured === 'true') {
      articles = articles.filter((a) => a.featured);
    }

    return NextResponse.json({
      articles,
      total: articles.length,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

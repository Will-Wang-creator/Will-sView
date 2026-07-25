export interface ArticleLocaleContent {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  preview: string;
  content: string;
  tags: string[];
}

export interface Article extends ArticleLocaleContent {
  slug: string;
  publishedAt: string;
  isPremium: boolean;
}

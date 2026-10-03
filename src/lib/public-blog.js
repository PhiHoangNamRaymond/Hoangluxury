import { sortArticles } from "./blog-article.js";

const feedFields = "id,slug,title,excerpt,cover_path,cover_alt,destinations,topics,featured,publish_at,created_at,author_id,reading_minutes";
export const validBlogSlug = (slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 120;

export function normalizePublicArticle(row, authors = [], imageUrl = () => "") {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || "",
    body: row.body || "",
    date: row.publish_at || row.created_at,
    imageUrl: imageUrl(row.cover_path),
    imageAlt: row.cover_alt || row.title,
    author: authors.find((author) => author.id === row.author_id)?.full_name || "Hoang Travel Team",
    destinations: row.destinations || [],
    topics: row.topics || [],
    featured: Boolean(row.featured),
    readingMinutes: row.reading_minutes || 1,
    metaDescription: (row.excerpt || row.title).slice(0, 160),
  };
}

// client PHẢI là client anon không lưu session. RLS dùng giờ DB để chặn hẹn lịch.
export async function fetchPublicBlog(client, { slug, signal, imageUrl } = {}) {
  if (!client) return { articles: [], article: null };
  if (slug !== undefined && !validBlogSlug(slug)) return { articles: [], article: null };
  let rows = [];
  if (slug !== undefined) {
    const { data, error } = await client.from("articles").select(`${feedFields},body`)
      .eq("status", "published").eq("slug", slug).abortSignal(signal).maybeSingle();
    if (error) throw error;
    if (data) rows = [data];
  } else {
    // Range pagination: không mất bài khi vượt giới hạn 1.000 bản ghi mặc định.
    for (let start = 0; ; start += 100) {
      const { data, error } = await client.from("articles").select(feedFields)
        .eq("status", "published").order("created_at", { ascending: false }).order("id")
        .range(start, start + 99).abortSignal(signal);
      if (error) throw error;
      rows.push(...(data || []));
      if (!data || data.length < 100) break;
    }
  }
  if (!rows.length) return { articles: [], article: null };
  const { data: authors, error } = await client.rpc("public_article_authors").abortSignal(signal);
  if (error) throw error;
  const articles = sortArticles(rows.filter((row) => validBlogSlug(row.slug))
    .map((row) => normalizePublicArticle(row, authors || [], imageUrl)));
  return { articles, article: articles[0] || null };
}

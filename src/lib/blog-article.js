/** Bài mới nhất trước; không ngày xuống cuối, title dùng để ổn định thứ tự. */
export function sortArticles(articles) {
  return [...articles].sort((a, b) => {
    if (!a.date && !b.date) return a.title.localeCompare(b.title);
    if (!a.date) return 1;
    if (!b.date) return -1;
    return Date.parse(b.date) - Date.parse(a.date) || a.title.localeCompare(b.title);
  });
}

export const blogArticleUrl = (slug) => `/blog/${slug}/`;

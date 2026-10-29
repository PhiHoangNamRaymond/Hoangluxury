/** Bài mới nhất trước; không ngày xuống cuối, title dùng để ổn định thứ tự. */
export function sortArticles(articles) {
  return [...articles].sort((a, b) => {
    if (!a.date && !b.date) return a.title.localeCompare(b.title);
    if (!a.date) return 1;
    if (!b.date) return -1;
    return Date.parse(b.date) - Date.parse(a.date) || a.title.localeCompare(b.title);
  });
}

/* Blog ở /blog/, mỗi bài nằm dưới địa điểm đầu tiên của bài:
   /blog/sapa/sapa-travel-guide-everything-you-need-to-know/ (khách duyệt 29/10/2026;
   trước đó /hoangphoto/blog/<bài>/ và /blog/<bài>/ — trang cũ chuyển sang URL mới). */
export const blogPagePath = "/blog/";
// Bài chưa gắn địa điểm nằm dưới mục chung này.
const fallbackBlogSection = "northern-vietnam";

export const blogDestinationSlug = (destination) =>
  String(destination || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const blogArticleUrl = (article) =>
  `${blogPagePath}${blogDestinationSlug(article.destinations?.[0]) || fallbackBlogSection}/${article.slug}/`;

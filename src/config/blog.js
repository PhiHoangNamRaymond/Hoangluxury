import { blogArticleUrl } from "../lib/blog-article.js";
import { blogDestinations, blogTopics } from "./blog-taxonomy.js";

// Nội dung lấy trực tiếp từ Supabase, không bundle Markdown/nháp vào JavaScript.
export { blogArticleUrl, blogDestinations, blogTopics };

/* Lọc theo hai trục độc lập: điểm đến, chủ đề, hoặc cả hai. */
export function filterBlogArticles(articles, { destination = null, topic = null } = {}, query = "", sort = "newest") {
  const search = query.trim().toLocaleLowerCase();
  const filtered = articles.filter((article) => {
    if (destination && !article.destinations.includes(destination)) return false;
    if (topic && !article.topics.includes(topic)) return false;
    const haystack = `${article.title} ${article.excerpt} ${article.destinations.join(" ")} ${article.topics.join(" ")}`;
    return haystack.toLocaleLowerCase().includes(search);
  });
  return sort === "oldest" ? [...filtered].reverse() : filtered;
}

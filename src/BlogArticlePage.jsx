import React, { useEffect, useMemo } from "react";
import { renderMarkdown } from "./lib/markdown.js";
import usePublicBlog from "./hooks/usePublicBlog.js";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import JourneyCallToAction from "./components/home/JourneyCallToAction.jsx";
import { blogArticleUrl } from "./config/blog.js";
import { whatsappUrl } from "./data.js";
import usePageEntered from "./hooks/usePageEntered.js";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function ArrowIcon() {
  return (
    <svg className="hlt-article-arrow" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12h15m-6-6 6 6-6 6" />
    </svg>
  );
}

export default function BlogArticlePage({ slug }) {
  const pageEntered = usePageEntered();
  const { article, loading, error, retry } = usePublicBlog(slug);
  const { articles: blogArticles } = usePublicBlog();
  const html = useMemo(() => (article ? renderMarkdown(article.body) : ""), [article]);

  useEffect(() => {
    if (loading || error) return undefined;
    const previousTitle = document.title;
    const changes = [];
    const setMeta = (selector, attribute, value) => {
      const node = document.querySelector(selector);
      if (!node) return;
      const before = node.getAttribute(attribute);
      node.setAttribute(attribute, value);
      changes.push(() => before === null ? node.removeAttribute(attribute) : node.setAttribute(attribute, before));
    };
    document.title = article ? `${article.title} | Hoang Luxury Travel` : "Article not found | Hoang Luxury Travel";
    let robots;
    let jsonLd;
    if (article) {
      setMeta('meta[name="description"]', "content", article.metaDescription);
      setMeta('meta[property="og:title"]', "content", document.title);
      setMeta('meta[property="og:description"]', "content", article.metaDescription);
      if (article.imageUrl) setMeta('meta[property="og:image"]', "content", article.imageUrl);
      jsonLd = document.createElement("script");
      jsonLd.type = "application/ld+json";
      jsonLd.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", headline: article.title,
        description: article.excerpt, datePublished: article.date, image: article.imageUrl || undefined,
        author: { "@type": "Person", name: article.author }, url: `https://hoangluxury.travel${blogArticleUrl(slug)}` });
      document.head.append(jsonLd);
    } else {
      robots = document.createElement("meta");
      robots.name = "robots";
      robots.content = "noindex, follow";
      document.head.append(robots);
    }
    return () => {
      document.title = previousTitle;
      changes.forEach((restore) => restore());
      robots?.remove();
      jsonLd?.remove();
    };
  }, [article, loading, error, slug]);

  if (!article) return (
    <div className={`hlt-site hlt-blog-site hlt-page-slide-down${pageEntered ? " is-entered" : ""}`}>
      <Header />
      <main className="hlt-article-main">
        <div className="hlt-article-missing" role="status">
          <span className="hlt-article-missing-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <path d="M12 6h16l8 8v28H12z" />
              <path d="M28 6v8h8M19 24h10M19 31h7" />
            </svg>
          </span>
          <h1>{loading ? "Loading story…" : error ? "Unable to load this story" : "Article not found"}</h1>
          <p>
            {error || (!loading && "This story may have been moved, or it hasn't been published yet.")}
          </p>
          <div className="hlt-article-missing-actions">
            {error && (
              <button type="button" className="hlt-article-cta" onClick={retry}>
                Try again
              </button>
            )}
            {!loading && (
              <>
                <a className="hlt-article-cta" href="/blog/">
                  Browse all stories
                  <ArrowIcon />
                </a>
                <a className="hlt-article-back" href="/">Back to homepage</a>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  const index = blogArticles.findIndex((item) => item.slug === article.slug);
  const related = blogArticles.filter((item) => item.slug !== article.slug).slice(0, 3);
  const next = blogArticles[(index + 1) % blogArticles.length];

  return (
    <div className={`hlt-site hlt-blog-site hlt-page-slide-down${pageEntered ? " is-entered" : ""}`}>
      <Header />

      <main className="hlt-article-main">
        <article className="hlt-article">
          <div className="hlt-article-shell">
            <nav className="hlt-article-crumbs" aria-label="Breadcrumb">
              <a href="/blog/">Travel Blog</a>
              <span aria-hidden="true">/</span>
              <span>{article.destinations[0] || article.topics[0] || "Article"}</span>
            </nav>

            <header className="hlt-article-head">
              <ul className="hlt-article-tags">
                {[...article.destinations, ...article.topics].map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <h1>{article.title}</h1>
              {article.excerpt && <p className="hlt-article-lead">{article.excerpt}</p>}
              <p className="hlt-article-meta">
                <span>{article.author}</span>
                {article.date && (
                  <>
                    <span aria-hidden="true">·</span>
                    <time dateTime={article.date}>{formatDate(article.date)}</time>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>{article.readingMinutes} min read</span>
              </p>
            </header>

            {article.imageUrl && (
              <figure className="hlt-article-cover">
                <img src={article.imageUrl} alt={article.imageAlt} fetchPriority="high" />
              </figure>
            )}

            {/* HTML được lọc trước khi render, kể cả nội dung do writer nhập. */}
            <div className="hlt-article-body" dangerouslySetInnerHTML={{ __html: html }} />

            <footer className="hlt-article-foot">
              <a className="hlt-article-cta" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                Plan this journey with us
                <ArrowIcon />
              </a>
              <a className="hlt-article-back" href="/blog/">
                All articles
              </a>
            </footer>
          </div>
        </article>

        {related.length > 0 && (
          <section className="hlt-article-related" aria-labelledby="article-related-title">
            <div className="hlt-blog-container">
              <div className="hlt-blog-section-heading">
                <h2 id="article-related-title">Keep Reading</h2>
                <span />
                <a href={blogArticleUrl(next.slug)}>
                  Next article
                  <ArrowIcon />
                </a>
              </div>
              <div className="hlt-article-related-grid">
                {related.map((item) => (
                  <a className="hlt-article-related-card" href={blogArticleUrl(item.slug)} key={item.slug}>
                    {item.imageUrl ? <img src={item.imageUrl} alt="" loading="lazy" /> : <span className="hlt-article-related-blank" />}
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.destinations[0] || item.topics[0] || "Travel journal"}</small>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <JourneyCallToAction />
      <Footer />
    </div>
  );
}

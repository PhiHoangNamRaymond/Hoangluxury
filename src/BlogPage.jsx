import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import { aboutImages, journeyCardImages, journeyExperienceImages, cruiseImages, serviceImages } from "./config/assets.js";
import { blogArticles, blogCategories, filterBlogArticles } from "./config/blog.js";
import { getJourneyPageUrl, whatsappUrl } from "./data.js";
import usePageEntered from "./hooks/usePageEntered.js";

const images = { hero: aboutImages.hero, sapa: journeyCardImages[0], haLong: journeyCardImages[1], ninhBinh: journeyCardImages[2], haGiang: journeyCardImages[3], terraces: journeyCardImages[6], dining: cruiseImages.expDining, drive: serviceImages.sapa, driver: journeyExperienceImages[2] };
const destinations = [
  ["Ha Giang", "Passes · Landscapes", 3], ["Ha Long", "Islands · Cruises", 1],
  ["Ninh Binh", "Rivers · Temples", 2], ["Cat Ba", "Islands · Beaches", 4],
  ["Cao Bang", "Waterfalls · Valleys", 5], ["Mu Cang Chai", "Terraces · Rice fields", 6],
  ["Ta Xua", "Clouds · Mountain peaks", 8], ["Moc Chau", "Tea hills · Countryside", 7],
];
const explorations = [
  ["Destinations", "Explore Northern Vietnam’s most beautiful places.", "terraces", null, "compass"],
  ["Travel Guides", "Practical advice for your journey.", "sapa", "Travel Tips", "book"],
  ["Itineraries", "Thoughtfully designed routes.", "ninhBinh", "Itineraries", "map"],
  ["Food & Culture", "Taste the stories of Northern Vietnam.", "dining", "Food & Culture", "heart"],
];

function Icon({ name, ...props }) {
  const paths = {
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    search: <><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m16 8-3 5-5 3 3-5 5-3Z" /></>,
    mountain: <><path d="m2 20 7-12 4 5 3-9 6 16H2Z" /><path d="m7 11 2 3 2-3" /></>,
    heart: <path d="M12 21S2 15 2 8a5 5 0 0 1 10-1A5 5 0 0 1 22 8c0 7-10 13-10 13Z" />,
    book: <><path d="M12 5v16M12 5C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 1Z" /></>,
    map: <><path d="m2 5 7-3 6 3 7-3v17l-7 3-6-3-7 3V5Zm7-3v17m6-14v17" /></>,
    chat: <><path d="M21 11a9 9 0 0 1-13 8l-6 2 2-6A9 9 0 1 1 21 11Z" /><path d="M8 7c0 5 2 7 7 7l1-2-3-1-1 1-2-2 1-1-1-3-2 1Z" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}

function PlanButton({ children = "Plan your journey" }) {
  return <a className="hlt-blog-gold-btn" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><Icon name="chat" />{children}<Icon name="arrow" /></a>;
}

function SectionHeading({ children, action, onAction }) {
  return <div className="hlt-blog-section-heading"><h2>{children}</h2><span />{action && <button type="button" onClick={onAction}>{action}<Icon name="arrow" /></button>}</div>;
}

export default function BlogPage() {
  const pageEntered = usePageEntered();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [limit, setLimit] = useState(6);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const dialogRef = useRef(null);
  const articlesRef = useRef(null);
  const lastTrigger = useRef(null);
  const filtered = useMemo(() => filterBlogArticles(category === "All" && !query.trim() ? blogArticles.slice(1) : blogArticles, category, query, sort), [category, query, sort]);
  const featured = blogArticles[0];
  const showFeatured = category === "All" && !query.trim();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!selectedArticle || !dialog) return;
    lastTrigger.current = document.activeElement;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      lastTrigger.current?.focus();
    };
  }, [selectedArticle]);

  function filterBy(value, scroll = false) {
    setCategory(value);
    setQuery("");
    setLimit(6);
    if (scroll) articlesRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }

  return (
    <div className={`hlt-site hlt-blog-site hlt-page-slide-down${pageEntered ? " is-entered" : ""}`}>
      <Header />
      <main className="hlt-blog-main">
        <section className="hlt-blog-hero" style={{ "--blog-image": `url("${images.hero}")` }}>
          <div className="hlt-blog-container hlt-blog-hero-inner">
            <p className="hlt-blog-eyebrow">Travel Blog</p>
            <h1>Travel Stories, Guides<br /><em>&amp;</em> Local Insights</h1>
            <p className="hlt-blog-hero-intro">Expert articles, insider tips and authentic travel stories<br className="hlt-blog-desktop-break" /> about Sapa, Ha Giang, Ha Long, Ninh Binh and<br className="hlt-blog-desktop-break" /> Northern Vietnam.</p>
            <div className="hlt-blog-values">
              {[["compass", "Real stories", "From local perspectives"], ["mountain", "Practical guides", "For a smoother journey"], ["heart", "A deeper connection", "To Vietnam"]].map(([icon, title, text]) => <div key={title}><Icon name={icon} /><span><strong>{title}</strong><small>{text}</small></span></div>)}
            </div>
            <p className="hlt-blog-signature">More than a trip.<br /><span>A deeper connection.</span></p>
          </div>
        </section>

        <div className="hlt-blog-container hlt-blog-editorial" ref={articlesRef}>
          <div className="hlt-blog-toolbar">
            <label className="hlt-blog-search"><Icon name="search" /><span className="hlt-blog-sr">Search articles, destinations or topics</span><input type="search" placeholder="Search articles, destinations, or topics…" value={query} onChange={(event) => { setQuery(event.target.value); setLimit(6); }} /></label>
            <div className="hlt-blog-filters" role="group" aria-label="Filter articles by topic">{blogCategories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => filterBy(item)}>{item}</button>)}</div>
            <label className="hlt-blog-sort"><span className="hlt-blog-sr">Sort articles</span><select value={sort} onChange={(event) => { setSort(event.target.value); setLimit(6); }}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
          </div>

          <div className="hlt-blog-columns">
            <div className="hlt-blog-feed">
              {showFeatured && <button type="button" className="hlt-blog-featured" onClick={() => setSelectedArticle(featured)}>
                <img src={images[featured.image]} alt="Golden rice terraces in the mountains of Northern Vietnam" fetchPriority="high" />
                <span className="hlt-blog-tag">Travel Guides</span>
                <div className="hlt-blog-featured-copy"><p className="hlt-blog-eyebrow">The editor’s pick</p><h2>{featured.title}</h2><p>{featured.excerpt}</p><div className="hlt-blog-byline"><span className="hlt-blog-author-mark">H</span><span>By Hoang Travel Team</span><span>Travel journal</span><Icon name="arrow" /></div></div>
              </button>}
              <SectionHeading action="View all articles" onAction={() => { filterBy("All"); setLimit(blogArticles.length); }}>{category === "All" ? "Latest Articles" : category}</SectionHeading>
              {(query || category !== "All") && <p className="hlt-blog-results" role="status">{filtered.length} article{filtered.length !== 1 ? "s" : ""}{query.trim() && <> matching “{query.trim()}”</>}</p>}
              <div className="hlt-blog-article-grid">
                {filtered.slice(0, limit).map((article) => <article className="hlt-blog-card" key={article.id}><button type="button" onClick={() => setSelectedArticle(article)}><div className="hlt-blog-card-image"><img src={images[article.image]} alt={article.title} loading="lazy" /></div><div className="hlt-blog-card-copy"><span className="hlt-blog-tag">{article.category}</span><h3>{article.title}</h3><p>{article.excerpt}</p><span className="hlt-blog-card-link">Read story <Icon name="arrow" /></span></div></button></article>)}
              </div>
              {!filtered.length && <div className="hlt-blog-empty"><Icon name="search" /><h3>No stories found</h3><p>Try another destination or explore all our stories.</p><button type="button" className="hlt-blog-dark-btn" onClick={() => filterBy("All")}>Reset filters</button></div>}
              {limit < filtered.length && <div className="hlt-blog-load"><button type="button" className="hlt-blog-dark-btn" onClick={() => setLimit((value) => value + 6)}><Icon name="plus" />Load more articles</button></div>}
            </div>

            <aside className="hlt-blog-sidebar" aria-label="Travel inspiration">
              <section className="hlt-blog-plan" style={{ "--blog-image": `url("${images.hero}")` }}><h2>Plan Your Journey</h2><p>Turn inspiration into a perfectly planned trip. Our team is here to create a private, seamless journey just for you.</p><PlanButton /></section>
              <section><SectionHeading action="View all" onAction={() => { filterBy("All", true); setLimit(blogArticles.length); }}>Popular Reads</SectionHeading><ol className="hlt-blog-popular">{[blogArticles[1], blogArticles[7], blogArticles[8], blogArticles[4], blogArticles[3]].map((article, index) => <li key={article.id}><button type="button" onClick={() => setSelectedArticle(article)}><span className="hlt-blog-rank">{index + 1}</span><img src={images[article.image]} alt="" loading="lazy" /><span><strong>{article.title}</strong><small>{article.category}</small></span></button></li>)}</ol></section>
              <section className="hlt-blog-destinations"><SectionHeading>Explore Northern Vietnam</SectionHeading><div className="hlt-blog-destination-panel"><p>Nine incredible destinations. Countless unforgettable stories.</p><a className="hlt-blog-destination-feature" href={getJourneyPageUrl("Sapa")}><img src={images.sapa} alt="Sapa valley at sunset" loading="lazy" /><div><small>Featured destination</small><h3>Sapa</h3><p>Mountains · Terraces · Culture</p><span>Explore Sapa <Icon name="arrow" /></span></div></a><div className="hlt-blog-destination-grid">{destinations.map(([name, description, index]) => <a href={getJourneyPageUrl(name)} key={name}><img src={journeyCardImages[index]} alt="" loading="lazy" /><span><strong>{name}</strong><small>{description}</small></span></a>)}</div><a className="hlt-blog-all-destinations" href="/journeys/">Explore all destinations<Icon name="arrow" /></a></div></section>
            </aside>
          </div>
        </div>

        <section className="hlt-blog-banner" style={{ "--blog-image": `url("${images.hero}")` }}><div className="hlt-blog-container"><div><p className="hlt-blog-eyebrow">Local expertise. Meaningful journeys.</p><h2>Thoughtful Travel. A Deeper Connection.</h2><p>Inspired by what you’ve read? Let us turn it into a private journey<br className="hlt-blog-desktop-break" /> designed around you.</p></div><PlanButton /></div></section>
        <section className="hlt-blog-container hlt-blog-explore"><SectionHeading action="More travel inspiration" onAction={() => filterBy("All", true)}>Continue Exploring</SectionHeading><div className="hlt-blog-explore-grid">{explorations.map(([title, text, image, filter, icon]) => {
          const content = <><img src={images[image]} alt="" loading="lazy" /><div><h3><Icon name={icon} />{title}</h3><p>{text}</p><Icon name="arrow" /></div></>;
          return filter ? <button type="button" key={title} onClick={() => filterBy(filter, true)}>{content}</button> : <a href="/journeys/" key={title}>{content}</a>;
        })}</div></section>
      </main>
      <Footer />
      <dialog ref={dialogRef} className="hlt-blog-reader" aria-labelledby="hlt-blog-reader-title" onCancel={() => setSelectedArticle(null)} onClick={(event) => { if (event.target === event.currentTarget) setSelectedArticle(null); }}>
        {selectedArticle && <article><button type="button" className="hlt-blog-reader-close" aria-label="Close article" onClick={() => setSelectedArticle(null)} autoFocus><Icon name="close" /></button><img className="hlt-blog-reader-image" src={images[selectedArticle.image]} alt="" /><div className="hlt-blog-reader-body"><span className="hlt-blog-tag">{selectedArticle.category}</span><h2 id="hlt-blog-reader-title">{selectedArticle.title}</h2><p className="hlt-blog-reader-lead">{selectedArticle.excerpt}</p><p className="hlt-blog-reader-author">By Hoang Travel Team</p>{selectedArticle.sections.map(([heading, text]) => <section key={heading}><h3>{heading}</h3><p>{text}</p></section>)}<PlanButton /></div></article>}
      </dialog>
    </div>
  );
}

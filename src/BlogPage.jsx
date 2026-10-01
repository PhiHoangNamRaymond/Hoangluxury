import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import JourneyCallToAction from "./components/home/JourneyCallToAction.jsx";
import { aboutImages, journeyCardImages, journeyExperienceImages, cruiseImages, serviceImages } from "./config/assets.js";
import { blogArticles, blogDestinations, blogTopics, filterBlogArticles } from "./config/blog.js";
import { getJourneyPageUrl, whatsappUrl } from "./data.js";
import usePageEntered from "./hooks/usePageEntered.js";

const images = { hero: aboutImages.hero, sapa: journeyCardImages[0], haLong: journeyCardImages[1], ninhBinh: journeyCardImages[2], haGiang: journeyCardImages[3], terraces: journeyCardImages[6], dining: cruiseImages.expDining, drive: serviceImages.sapa, driver: journeyExperienceImages[2] };
const destinations = [
  ["Ha Giang", "Passes · Landscapes", 3], ["Ha Long", "Islands · Cruises", 1],
  ["Ninh Binh", "Rivers · Temples", 2], ["Cat Ba", "Islands · Beaches", 4],
  ["Cao Bang", "Waterfalls · Valleys", 5], ["Mu Cang Chai", "Terraces · Rice fields", 6],
  ["Ta Xua", "Clouds · Mountain peaks", 8], ["Moc Chau", "Tea hills · Countryside", 7],
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
    pin: <><path d="M12 21.5s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9.2" r="2.5" /></>,
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
  const [destination, setDestination] = useState(null);
  const [topic, setTopic] = useState(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [limit, setLimit] = useState(6);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const dialogRef = useRef(null);
  const articlesRef = useRef(null);
  const lastTrigger = useRef(null);
  const noFilter = !destination && !topic && !query.trim();
  const filtered = useMemo(
    () => filterBlogArticles(noFilter ? blogArticles.slice(1) : blogArticles, { destination, topic }, query, sort),
    [destination, topic, query, sort, noFilter],
  );
  const featured = blogArticles[0];
  const showFeatured = noFilter;
  const feedTitle = [destination, topic].filter(Boolean).join(" · ") || "Latest Articles";

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

  function scrollToArticles(scroll) {
    if (!scroll) return;
    articlesRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "start",
    });
  }

  /* Bấm lại đúng nút đang bật thì bỏ lọc trục đó. */
  function toggleDestination(value, scroll = false) {
    setDestination((current) => (current === value ? null : value));
    setLimit(6);
    scrollToArticles(scroll);
  }

  function toggleTopic(value, scroll = false) {
    setTopic((current) => (current === value ? null : value));
    setLimit(6);
    scrollToArticles(scroll);
  }

  function resetFilters(scroll = false) {
    setDestination(null);
    setTopic(null);
    setQuery("");
    setLimit(6);
    scrollToArticles(scroll);
  }

  return (
    <div className={`hlt-site hlt-blog-site hlt-page-slide-down${pageEntered ? " is-entered" : ""}`}>
      <Header />
      <main className="hlt-blog-main">
        <section className="hlt-blog-hero" style={{ "--blog-image": `url("${images.hero}")` }}>
          <div className="hlt-blog-container hlt-blog-hero-inner">
            <p className="hlt-blog-eyebrow">Travel Blog</p>
            <h1>Travel Stories, Guides<br /><em>&amp;</em> Local Tips</h1>
            <p className="hlt-blog-hero-intro">Discover local stories, practical travel tips and easy-to-follow guides<br className="hlt-blog-desktop-break" /> for Sapa, Ha Giang, Ha Long Bay, Ninh Binh and other destinations<br className="hlt-blog-desktop-break" /> across Northern Vietnam.</p>
            <p className="hlt-blog-signature">More than a trip.<br /><span>Stories worth discovering.</span></p>
          </div>
        </section>

        <div className="hlt-blog-container hlt-blog-editorial" ref={articlesRef}>
          <div className="hlt-blog-toolbar">
            <div className="hlt-blog-toolbar-top">
              <label className="hlt-blog-search"><Icon name="search" /><span className="hlt-blog-sr">Search articles, destinations or topics</span><input type="search" placeholder="Search articles, destinations, or topics…" value={query} onChange={(event) => { setQuery(event.target.value); setLimit(6); }} /></label>
              <label className="hlt-blog-sort"><span className="hlt-blog-sr">Sort articles</span><select value={sort} onChange={(event) => { setSort(event.target.value); setLimit(6); }}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
            </div>
            <div className="hlt-blog-filter-row" role="group" aria-label="Filter articles by destination">
              <span className="hlt-blog-filter-label"><Icon name="pin" />Destinations</span>
              <div className="hlt-blog-filter-items">
                {blogDestinations.map((item) => <button key={item} type="button" aria-pressed={destination === item} onClick={() => toggleDestination(item)}>{item}</button>)}
              </div>
            </div>
            <div className="hlt-blog-filter-row" role="group" aria-label="Filter articles by topic">
              <span className="hlt-blog-filter-label"><Icon name="book" />Topics</span>
              <div className="hlt-blog-filter-items">
                {blogTopics.map((item) => <button key={item} type="button" aria-pressed={topic === item} onClick={() => toggleTopic(item)}>{item}</button>)}
              </div>
            </div>
          </div>


          <div className="hlt-blog-columns">
            <div className="hlt-blog-feed">
              {showFeatured && <button type="button" className="hlt-blog-featured" onClick={() => setSelectedArticle(featured)}>
                <img src={images[featured.image]} alt="Golden rice terraces in the mountains of Northern Vietnam" fetchPriority="high" />
                <span className="hlt-blog-tag">Travel Guides</span>
                <div className="hlt-blog-featured-copy"><p className="hlt-blog-eyebrow">The editor’s pick</p><h2>{featured.title}</h2><p>{featured.excerpt}</p><div className="hlt-blog-byline"><span className="hlt-blog-author-mark">H</span><span>By Hoang Travel Team</span><span>Travel journal</span><Icon name="arrow" /></div></div>
              </button>}
              <SectionHeading action="View all articles" onAction={() => { resetFilters(); setLimit(blogArticles.length); }}>{feedTitle}</SectionHeading>
              {!noFilter && <p className="hlt-blog-results" role="status">{filtered.length} article{filtered.length !== 1 ? "s" : ""}{query.trim() && <> matching “{query.trim()}”</>}</p>}
              <div className="hlt-blog-article-grid">
                {filtered.slice(0, limit).map((article) => <article className="hlt-blog-card" key={article.id}><button type="button" onClick={() => setSelectedArticle(article)}><div className="hlt-blog-card-image"><img src={images[article.image]} alt={article.title} loading="lazy" /></div><div className="hlt-blog-card-copy"><span className="hlt-blog-tag">{article.category}</span><h3>{article.title}</h3><p>{article.excerpt}</p><span className="hlt-blog-card-link">Read story <Icon name="arrow" /></span></div></button></article>)}
              </div>
              {!filtered.length && <div className="hlt-blog-empty"><Icon name="search" /><h3>No stories found</h3><p>Try another destination or explore all our stories.</p><button type="button" className="hlt-blog-dark-btn" onClick={() => resetFilters()}>Reset filters</button></div>}
              {limit < filtered.length && <div className="hlt-blog-load"><button type="button" className="hlt-blog-dark-btn" onClick={() => setLimit((value) => value + 6)}><Icon name="plus" />Load more articles</button></div>}
            </div>

            <aside className="hlt-blog-sidebar" aria-label="Travel inspiration">
              <section className="hlt-blog-plan" style={{ "--blog-image": `url("${images.hero}")` }}><h2>Plan Your Journey</h2><p>Turn inspiration into a perfectly planned trip. Our team is here to create a private, seamless journey just for you.</p><PlanButton /></section>
              <section><SectionHeading action="View all" onAction={() => { resetFilters(true); setLimit(blogArticles.length); }}>Popular Reads</SectionHeading><ol className="hlt-blog-popular">{[blogArticles[1], blogArticles[7], blogArticles[8], blogArticles[4], blogArticles[3]].map((article, index) => <li key={article.id}><button type="button" onClick={() => setSelectedArticle(article)}><span className="hlt-blog-rank">{index + 1}</span><img src={images[article.image]} alt="" loading="lazy" /><span><strong>{article.title}</strong><small>{article.category}</small></span></button></li>)}</ol></section>
              <section className="hlt-blog-destinations"><SectionHeading>Explore Northern Vietnam</SectionHeading><div className="hlt-blog-destination-panel"><p>Nine incredible destinations. Countless unforgettable stories.</p><a className="hlt-blog-destination-feature" href={getJourneyPageUrl("Sapa")}><img src={images.sapa} alt="Sapa valley at sunset" loading="lazy" /><div><small>Featured destination</small><h3>Sapa</h3><p>Mountains · Terraces · Culture</p><span>Explore Sapa <Icon name="arrow" /></span></div></a><div className="hlt-blog-destination-grid">{destinations.map(([name, description, index]) => <div key={name}><img src={journeyCardImages[index]} alt="" loading="lazy" /><span><strong>{name}</strong><small>{description}</small></span></div>)}</div><span className="hlt-blog-all-destinations">Explore all destinations<Icon name="arrow" /></span></div></section>
            </aside>
          </div>
        </div>

      </main>

      <JourneyCallToAction />
      <Footer />
      <dialog ref={dialogRef} className="hlt-blog-reader" aria-labelledby="hlt-blog-reader-title" onCancel={() => setSelectedArticle(null)} onClick={(event) => { if (event.target === event.currentTarget) setSelectedArticle(null); }}>
        {selectedArticle && <article><button type="button" className="hlt-blog-reader-close" aria-label="Close article" onClick={() => setSelectedArticle(null)} autoFocus><Icon name="close" /></button><img className="hlt-blog-reader-image" src={images[selectedArticle.image]} alt="" /><div className="hlt-blog-reader-body"><span className="hlt-blog-tag">{selectedArticle.category}</span><h2 id="hlt-blog-reader-title">{selectedArticle.title}</h2><p className="hlt-blog-reader-lead">{selectedArticle.excerpt}</p><p className="hlt-blog-reader-author">By Hoang Travel Team</p>{selectedArticle.sections.map(([heading, text]) => <section key={heading}><h3>{heading}</h3><p>{text}</p></section>)}<PlanButton /></div></article>}
      </dialog>
    </div>
  );
}

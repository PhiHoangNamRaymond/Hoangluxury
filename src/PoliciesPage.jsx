import React, { useEffect, useState } from "react";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import ExperienceSlider from "./components/home/ExperienceSlider.jsx";
import JourneyCallToAction from "./components/home/JourneyCallToAction.jsx";
import { legacyPolicyHash, legacyPolicyPath, privacyPolicyPath, termsPath } from "./config/policies.js";
import { termsIntro, termsSections } from "./config/terms-of-service.js";
import { privacyIntro, privacySections } from "./config/privacy-policy.js";
import policyBanner from "../assets/opt/hlt-policy-banner.png";
import "./styles/policies-page.css";

function PolicyPage({ kind }) {
  const showTerms = kind === "terms";
  const focusedSections = showTerms ? termsSections : privacySections;
  // Liên kết cũ /policies/#privacy (hoặc mục Privacy) mở nhầm trang Terms: chuyển đúng trang.
  useEffect(() => {
    if (showTerms && legacyPolicyPath(window.location.hash) === privacyPolicyPath) {
      window.location.replace(privacyPolicyPath + legacyPolicyHash(window.location.hash));
      return undefined;
    }
    const id = window.location.hash.slice(1);
    const frame = id ? window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView()) : 0;
    return () => window.cancelAnimationFrame(frame);
  }, [showTerms]);

  // Mục đang đọc được tô sáng trong "On this page" (theo thiết kế 23/11/2026).
  const [activeId, setActiveId] = useState(focusedSections[0]?.id);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveId(visible[0].target.id);
    }, { rootMargin: "-120px 0px -60% 0px" });
    focusedSections.forEach(({ id }) => { const node = document.getElementById(id); if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, [focusedSections]);

  const page = showTerms ? {
    title: "Terms of Service",
    intro: "The terms and conditions for using our website and booking private transportation services.",
    anchor: "terms",
    paragraphs: termsIntro,
    badges: ["Privacy First", "Data Security", "Transparency & Trust"],
  } : {
    title: "Privacy Policy",
    intro: "Find out how we handle your personal information and protect your privacy.",
    anchor: "privacy",
    paragraphs: privacyIntro,
    badges: ["Privacy First", "Secure Handling", "Customer Control"],
  };
  const related = showTerms
    ? { title: "Privacy Policy", href: privacyPolicyPath }
    : { title: "Terms of Service", href: termsPath };

  return (
    <div className="hlt-site hlt-policies-site">
      <Header />
      <main>
        <div className="hlt-policies-hero">
          <img className="hlt-policies-hero-art" src={policyBanner} alt="" fetchPriority="high" decoding="async" data-no-skeleton />
          <div className="hlt-policies-container">
            <p className="hlt-policies-kicker">HOANG LUXURY TRAVEL</p>
            <h1>{page.title}</h1>
            <p className="hlt-policies-hero-intro">{page.intro}</p>
            <nav className="hlt-policies-breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a><span aria-hidden="true">/</span><a href={related.href}>{related.title}</a><span aria-hidden="true">/</span><span aria-current="page">{page.title}</span>
            </nav>
            <a className="hlt-policies-hero-scroll" href={`#${page.anchor}`} aria-label={`Read the ${page.title}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </a>
          </div>
        </div>
        <div className="hlt-policies-container hlt-policies-layout">
          <nav className="hlt-policies-nav" aria-label="On this page">
            <h2>On this page</h2>
            {focusedSections.map(({ id, title }, index) => (
              <a key={id} href={`#${id}`} className={activeId === id ? "is-active" : undefined} aria-current={activeId === id ? "location" : undefined}>
                <span aria-hidden="true">0{index + 1}</span>{title}
              </a>
            ))}
            <p className="hlt-policies-related">Read also: <a href={related.href}>{related.title} <span aria-hidden="true">↗</span></a></p>
          </nav>
          <div className="hlt-policies-content">
            <section id={page.anchor} className="hlt-policy-panel hlt-terms-intro" aria-labelledby={`${page.anchor}-title`}>
              <div className="hlt-terms-intro-top">
                <p className="hlt-policies-kicker">Guest information · Hoang Luxury Travel</p>
                <p className="hlt-terms-updated">Last updated: <time dateTime="2026-11-25">25/11/2026</time></p>
              </div>
              <h2 id={`${page.anchor}-title`}>{page.title}</h2>
              {page.paragraphs.map((item, itemIndex) => <PolicyBlock key={itemIndex} item={item} />)}
              <p className="hlt-terms-badges">
                {page.badges.map((badge, index) => <span key={badge} className="hlt-terms-badge">
                  {index > 0 && <span className="hlt-terms-badge-separator" aria-hidden="true">✦</span>}
                  {badge}
                  {index === page.badges.length - 1 && <span className="hlt-terms-badge-separator is-mobile-end" aria-hidden="true">✦</span>}
                </span>)}
              </p>
            </section>
            {focusedSections.map(({ id, title, paragraphs }, index) => <section key={id} id={id} className="hlt-terms-section" aria-labelledby={`${id}-title`}>
              <h2 id={`${id}-title`}>{index + 1}. {title}</h2>
              {paragraphs.map((item, itemIndex) => <PolicyBlock key={itemIndex} item={item} />)}
            </section>)}
          </div>
        </div>
      </main>
      <JourneyCallToAction className="is-home" secondary="form" headingLevel="h2" title="Ready To Start Your Journey?" trackingPage={showTerms ? "terms" : "privacy"} />
      <ExperienceSlider />
      <Footer />
    </div>
  );
}

/* Đoạn có **chữ đậm**: tách theo dấu ** để in đậm đúng phần khách đánh dấu. */
function RichText({ text }) {
  return text.split("**").map((part, index) => (index % 2 ? <strong key={index}>{part}</strong> : part));
}

/* Một khối nội dung chính sách (định dạng ở config/terms-of-service.js):
   chuỗi = đoạn văn; { h3 } = tiêu đề phụ; { list } = gạch đầu dòng;
   { contact } = dòng Email / Hotline có link. */
function PolicyBlock({ item }) {
  if (typeof item === "string") return <p><RichText text={item} /></p>;
  if (item.h3) return <h3 className="hlt-terms-subheading">{item.h3}</h3>;
  if (item.list) return <ul className="hlt-terms-list">{item.list.map((entry) => <li key={entry}><RichText text={entry} /></li>)}</ul>;
  if (item.contact) return <p className="hlt-terms-contact">
    <span><strong>Email:</strong> <a href="mailto:info@hoangluxury.travel">info@hoangluxury.travel</a></span>
    <span><strong>Hotline:</strong> <a href="tel:+84839779888">+84 839 779 888</a></span>
  </p>;
  return null;
}

export function PrivacyPolicyPage() {
  return <PolicyPage kind="privacy" />;
}

export function TermsPage() {
  return <PolicyPage kind="terms" />;
}

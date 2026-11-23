import React, { useEffect, useState } from "react";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import { legacyPolicyHash, legacyPolicyPath, privacyPolicyPath, termsPath } from "./config/policies.js";
import { termsIntro, termsSections } from "./config/terms-of-service.js";
import { privacyIntro, privacySections } from "./config/privacy-policy.js";
import { whatsappUrl } from "./data.js";
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
    badges: ["Clear Terms", "Transparent Pricing", "Dedicated Support"],
    help: "Our team is ready to help with bookings, service details and questions about these terms.",
  } : {
    title: "Privacy Policy",
    intro: "How we collect, use, protect and manage your personal information.",
    anchor: "privacy",
    paragraphs: privacyIntro,
    badges: ["Privacy First", "Secure Handling", "Customer Control"],
    help: "We are happy to assist with your personal information and privacy-related questions.",
  };

  return (
    <div className="hlt-site hlt-policies-site">
      <Header />
      <main>
        <div className="hlt-policies-hero">
          <svg className="hlt-policies-hero-art" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
            <circle cx="1130" cy="70" r="46" />
            <path className="is-far" d="M0 170 130 92l90 52 120-86 150 92 110-58 140 80 130-96 150 88 120-62 140 80 160-74v132H0Z" />
            <path className="is-near" d="M0 200 160 128l120 60 150-80 170 92 140-54 160 70 150-84 170 76 120-40v142H0Z" />
          </svg>
          <div className="hlt-policies-container">
            <p className="hlt-policies-kicker">Guest information</p>
            <h1>{page.title}</h1>
            <p className="hlt-policies-hero-intro">{page.intro}</p>
            <nav className="hlt-policies-breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a><span aria-hidden="true">/</span><span>Legal</span><span aria-hidden="true">/</span><span aria-current="page">{page.title}</span>
            </nav>
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
            <p className="hlt-policies-related">Read also: <a href={showTerms ? privacyPolicyPath : termsPath}>{showTerms ? "Privacy Policy" : "Terms of Service"} <span aria-hidden="true">↗</span></a></p>
          </nav>
          <div className="hlt-policies-content">
            <section id={page.anchor} className="hlt-policy-panel hlt-terms-intro" aria-labelledby={`${page.anchor}-title`}>
              <div className="hlt-terms-intro-top">
                <p className="hlt-policies-kicker">Guest information · Hoang Luxury Travel</p>
                <p className="hlt-terms-updated">Last updated: [Day/Month/Year of publication]</p>
              </div>
              <h2 id={`${page.anchor}-title`}>{page.title}</h2>
              {page.paragraphs.map((item, itemIndex) => <PolicyBlock key={itemIndex} item={item} />)}
              <p className="hlt-terms-badges">
                {page.badges.map((badge, index) => <React.Fragment key={badge}>
                  {index > 0 && <span aria-hidden="true">✦</span>}{badge}
                </React.Fragment>)}
              </p>
            </section>
            {focusedSections.map(({ id, title, paragraphs }, index) => <section key={id} id={id} className="hlt-terms-section" aria-labelledby={`${id}-title`}>
              <h2 id={`${id}-title`}>{index + 1}. {title}</h2>
              {paragraphs.map((item, itemIndex) => <PolicyBlock key={itemIndex} item={item} />)}
            </section>)}
          </div>
        </div>
        <section className="hlt-policies-help" aria-labelledby="policies-help-title">
          <div className="hlt-policies-container hlt-policies-help-inner">
            <div>
              <h2 id="policies-help-title">Need assistance?</h2>
              <p>{page.help}</p>
            </div>
            <ul className="hlt-policies-help-contact">
              <li><a href="tel:+84839779888">+84 839 779 888</a></li>
              <li><a href="mailto:info@hoangluxury.travel">info@hoangluxury.travel</a></li>
            </ul>
            <a className="hlt-policies-help-btn" href={whatsappUrl} target="_blank" rel="noopener noreferrer">Contact us now <span aria-hidden="true">→</span></a>
          </div>
        </section>
      </main>
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

import React, { useEffect, useState } from "react";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import { policySections } from "./config/policies.js";
import { termsSections } from "./config/terms-of-service.js";
import { privacySections } from "./config/privacy-policy.js";
import "./styles/policies-page.css";

export default function PoliciesPage() {
  const getMode = () => {
    const hash = window.location.hash;
    if (hash === "#terms" || termsSections.some(({ id }) => hash === `#${id}`)) return "terms";
    if (hash === "#privacy" || privacySections.some(({ id }) => hash === `#${id}`)) return "privacy";
    return "overview";
  };
  const [mode, setMode] = useState(getMode);
  useEffect(() => {
    const onHashChange = () => setMode(getMode());
    window.addEventListener("hashchange", onHashChange);
    const id = window.location.hash.slice(1);
    const frame = window.requestAnimationFrame(() => {
      if (id !== "terms") document.getElementById(id)?.scrollIntoView();
    });
    return () => { window.removeEventListener("hashchange", onHashChange); window.cancelAnimationFrame(frame); };
  }, []);
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, [mode]);
  const showTerms = mode === "terms";
  const showPrivacy = mode === "privacy";
  const focusedSections = showTerms ? termsSections : showPrivacy ? privacySections : policySections;

  return (
    <div className="hlt-site hlt-policies-site">
      <Header />
      <main>
        <div className="hlt-policies-hero">
          <div className="hlt-policies-container">
            <p className="hlt-policies-kicker">Guest information</p>
            <h1>{showTerms ? "Terms of Service" : showPrivacy ? "Privacy Policy" : "Terms & Policies"}</h1>
            <p>{showTerms ? "The terms and conditions for using our website and booking private transportation services." : showPrivacy ? "How we collect, use, protect and manage your personal information." : "Booking terms, privacy information and guidance on cancellations and refunds, all in one place."}</p>
          </div>
        </div>
        <div className="hlt-policies-container hlt-policies-layout">
          <nav className="hlt-policies-nav" aria-label="On this page">
            <h2>On this page</h2>
            {focusedSections.map(({ id, title }, index) => (
              <a key={id} href={`#${id}`}><span aria-hidden="true">0{index + 1}</span>{title}</a>
            ))}
            {(showTerms || showPrivacy) && <p className="hlt-policies-related">Read also: <a href={`/policies/#${showTerms ? "privacy" : "terms"}`}>{showTerms ? "Privacy Policy" : "Terms of Service"}</a></p>}
          </nav>
          <div className="hlt-policies-content">
            <aside className="hlt-policies-notice">
              <strong>Policy preview</strong>
              <p>The full policies have not been finalised. For a booking, ask us to confirm the terms that apply before you pay.</p>
            </aside>
            {showTerms ? <>
              <section id="terms" className="hlt-policy-panel hlt-terms-intro" aria-labelledby="terms-title">
                <p className="hlt-policies-kicker">Guest information · Hoang Luxury Travel</p>
                <h2 id="terms-title">Terms of Service</h2>
                <p>Welcome to Hoang Luxury Travel (HLT). Please read these Terms of Service before using our website or booking our services.</p>
                <p>Submitting a booking request does not confirm a reservation. Please review the itinerary, price and applicable conditions in the written confirmation before paying.</p>
                <p className="hlt-terms-review">Review draft — publication date and final wording to be confirmed by Hoang Luxury Travel.</p>
              </section>
              {termsSections.map(({ id, title, paragraphs }, index) => <section key={id} id={id} className="hlt-terms-section" aria-labelledby={`${id}-title`}>
                <h2 id={`${id}-title`}>{index + 1}. {title}</h2>
                {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </section>)}
            </> : showPrivacy ? <>
              <section id="privacy" className="hlt-policy-panel hlt-terms-intro" aria-labelledby="privacy-title">
                <p className="hlt-policies-kicker">Guest information · Hoang Luxury Travel</p>
                <h2 id="privacy-title">Privacy Policy</h2>
                <p>At Hoang Luxury Travel (HLT), we believe that privacy and the protection of personal information are essential parts of a premium service experience.</p>
                <p>You can explore our website without actively providing personal information. When you contact us or request a booking, we ask for information relevant to providing advice, arranging travel and supporting your journey.</p>
                <p className="hlt-terms-review">Review draft — publication date and final wording to be confirmed by Hoang Luxury Travel.</p>
              </section>
              {privacySections.map(({ id, title, paragraphs }, index) => <section key={id} id={id} className="hlt-terms-section" aria-labelledby={`${id}-title`}>
                <h2 id={`${id}-title`}>{index + 1}. {title}</h2>
                {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </section>)}
            </> : policySections.map(({ id, title, intro, topics }, index) => (
              <section key={id} id={id} aria-labelledby={`policy-${id}-title`} className="hlt-policy-panel">
                <header>
                  <span aria-hidden="true">0{index + 1}</span>
                  <div><h2 id={`policy-${id}-title`}>{title}</h2><p>{intro}</p></div>
                </header>
                {topics.map(([heading, text]) => <div key={heading} className="hlt-policy-topic">
                  <h3>{heading}</h3><p>{text}</p>
                </div>)}
              </section>
            ))}
            <section className="hlt-policies-help" aria-label="Contact Hoang Luxury Travel">
              <div><h2>Need help with a booking?</h2><p>Send us a message with your booking reference.</p></div>
              <a href="mailto:info@hoangluxury.travel">Email us <span aria-hidden="true">→</span></a>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

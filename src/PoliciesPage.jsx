import React, { useEffect } from "react";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import { policySections } from "./config/policies.js";
import "./styles/policies-page.css";

export default function PoliciesPage() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!policySections.some((section) => section.id === id)) return undefined;
    const frame = window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="hlt-site hlt-policies-site">
      <Header />
      <main>
        <div className="hlt-policies-hero">
          <div className="hlt-policies-container">
            <p className="hlt-policies-kicker">Hoang Luxury Travel · Guest information</p>
            <h1>Terms &amp; Policies</h1>
            <p>Booking terms, privacy information and guidance on cancellations and refunds, all in one place.</p>
          </div>
        </div>
        <div className="hlt-policies-container hlt-policies-layout">
          <nav className="hlt-policies-nav" aria-label="On this page">
            <h2>On this page</h2>
            {policySections.map(({ id, title }, index) => (
              <a key={id} href={`#${id}`}><span aria-hidden="true">0{index + 1}</span>{title}</a>
            ))}
          </nav>
          <div className="hlt-policies-content">
            <aside className="hlt-policies-notice">
              <strong>Policy preview</strong>
              <p>The full policies have not been finalised. For a booking, ask us to confirm the terms that apply before you pay.</p>
            </aside>
            {policySections.map(({ id, title, intro, topics }, index) => (
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
              <a href="mailto:hoangluxury.travel@gmail.com">Email us <span aria-hidden="true">→</span></a>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

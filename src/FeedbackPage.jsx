import React, { useEffect, useState } from "react";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import { feedbackReviewImages, servicesBackgroundUrl } from "./config/assets.js";

const feedbackStats = [
  { icon: "world", value: "12,686+", label: "Successful Transfers" },
  { icon: "flag", value: "20+", label: "Countries Served" },
  { icon: "star", value: "4.9/5", label: "Guest Rating" },
  { icon: "support", value: "24/7", label: "Customer Support" },
];

const guestReviews = [
  {
    title: "Seamless & Reliable",
    quote: "Our private transfer was perfect from start to finish. The driver was punctual, professional, and the car was spotless and comfortable. Booking was easy and the support team was very responsive. Highly recommended!",
    name: "Michael Anderson",
    country: "United States",
    date: "May 12, 2024",
    dateDisplay: "May 2024",
    dateIso: "2024-05-12",
  },
  {
    title: "Impeccable Service",
    quote: "The service was truly excellent. The vehicle was clean and comfortable, and our driver was incredibly kind. Everything from booking to arrival went smoothly.",
    name: "Ji-hoon Kim",
    country: "South Korea",
    date: "Apr 28, 2024",
    dateDisplay: "Apr 2024",
    dateIso: "2024-04-28",
  },
  {
    title: "Beyond Expectations",
    quote: "From booking to drop-off, every detail was seamless. The vehicle was immaculate, our driver was thoughtful, and the entire journey exceeded our expectations.",
    name: "Emma & Lucas",
    country: "Australia",
    date: "Apr 18, 2024",
    dateDisplay: "Apr 2024",
    dateIso: "2024-04-18",
  },
  {
    title: "First-Class Journey",
    quote: "A wonderful experience. The driver was punctual and professional, the vehicle was clean and comfortable, and communication with the team was effortless throughout.",
    name: "Zhang Wei",
    country: "China",
    date: "Apr 05, 2024",
    dateDisplay: "Apr 2024",
    dateIso: "2024-04-05",
  },
  {
    title: "Luxury in Every Detail",
    quote: "The best transfer service we experienced in Northern Vietnam. Our van was luxurious and spotless, the driver arrived early, and every detail felt carefully handled.",
    name: "David Thompson",
    country: "United Kingdom",
    date: "Mar 30, 2024",
    dateDisplay: "Mar 2024",
    dateIso: "2024-03-30",
  },
  {
    title: "Perfect Family Transfer",
    quote: "Our whole family was delighted with the journey. The children were comfortable, the vehicle was spotless, and our thoughtful driver made us feel completely at ease.",
    name: "So-young Park",
    country: "South Korea",
    date: "Mar 21, 2024",
    dateDisplay: "Mar 2024",
    dateIso: "2024-03-21",
  },
  {
    title: "Safe & Scenic",
    quote: "Safe driving, beautiful routes, and excellent service throughout our journey. We always felt comfortable, informed, and very well taken care of.",
    name: "Sophie Martin",
    country: "France",
    date: "Mar 15, 2024",
    dateDisplay: "Mar 2024",
    dateIso: "2024-03-15",
  },
  {
    title: "Exceptional Care",
    quote: "The service was highly professional and communication was seamless. Our driver carefully attended to every need, making the journey comfortable, memorable, and thoroughly enjoyable.",
    name: "Li Ming",
    country: "China",
    date: "Mar 02, 2024",
    dateDisplay: "Mar 2024",
    dateIso: "2024-03-02",
  },
].map((review, index) => ({ ...review, image: feedbackReviewImages[index] }));

function FeedbackIcon({ type }) {
  if (type === "world") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="24" />
        <path d="M9 28h13l5 5-2 8 6 8M23 10l4 8-5 6-8-2M38 9l-3 8 6 6 9-1 5 7-8 7-2 12" />
      </svg>
    );
  }

  if (type === "flag") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M18 55V10M18 14c10-7 18 7 30-1v25c-12 8-20-6-30 1M12 55h14" />
      </svg>
    );
  }

  if (type === "star") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="m32 8 7.4 15 16.6 2.4-12 11.7 2.8 16.5L32 45.8l-14.8 7.8L20 37.1 8 25.4 24.6 23 32 8Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M10 34v-5a22 22 0 0 1 44 0v5M10 34h8v15h-3a5 5 0 0 1-5-5V34ZM54 34h-8v15h3a5 5 0 0 0 5-5V34ZM46 49c-3 5-8 7-14 7" />
      <path d="M25 25h14a6 6 0 0 1 6 6v7a6 6 0 0 1-6 6H28l-7 5 2-8a6 6 0 0 1-4-6v-4a6 6 0 0 1 6-6Z" />
      <circle cx="28" cy="34" r="1" /><circle cx="34" cy="34" r="1" /><circle cx="40" cy="34" r="1" />
    </svg>
  );
}

function FeedbackFormOrnament() {
  return (
    <svg className="hlt-feedback-form-ornament" viewBox="0 0 220 32" aria-hidden="true">
      <path d="M1 16h72M147 16h72" />
      <path d="m8 12-8 4 8 4M212 12l8 4-8 4" />
      <path d="M74 16c12 0 15-10 24-10 7 0 12 4 12 10s-5 10-11 10c-5 0-8-3-8-7 0-3 2-5 5-5 2 0 4 2 4 4" />
      <path d="M146 16c-12 0-15-10-24-10-7 0-12 4-12 10s5 10 11 10c5 0 8-3 8-7 0-3-2-5-5-5-2 0-4 2-4 4" />
      <path d="M110 1v30M104 6l6-5 6 5M104 26l6 5 6-5" />
    </svg>
  );
}

function FeedbackFrameCorner({ position }) {
  return (
    <svg
      className={`hlt-feedback-frame-corner is-${position}`}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path d="M47 5H20L15 1l-5 4H1v9l4 5v28" />
      <path d="M1 9h8l6 6 6-6h12M9 1v8l6 6-6 6v12" />
      <path d="m4 4 7 7m-7 3 10-10M15 1v8M1 15h8" />
    </svg>
  );
}

function CountryFlag({ country }) {
  if (country === "United States") {
    return (
      <svg className="hlt-feedback-review-flag" viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="20" fill="#fff" />
        <path d="M0 1h30M0 5h30M0 9h30M0 13h30M0 17h30" stroke="#b22234" strokeWidth="2" />
        <rect width="13" height="10" fill="#3c3b6e" />
        <path d="M2 2h1m2 0h1m2 0h1m2 0h1M3 5h1m2 0h1m2 0h1M2 8h1m2 0h1m2 0h1m2 0h1" stroke="#fff" strokeWidth="1" />
      </svg>
    );
  }

  if (country === "South Korea") {
    return (
      <svg className="hlt-feedback-review-flag" viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="20" fill="#fff" />
        <path d="M15 5a5 5 0 0 1 0 10 2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5Z" fill="#cd2e3a" />
        <path d="M15 15a5 5 0 0 1 0-10 2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 1 0 5Z" fill="#0047a0" />
        <path d="m4 5 4-3m-3 5 4-3m12 12 4-3m-3 5 4-3M4 15l4 3m-3-5 4 3m12-12 4 3m-3-5 4 3" stroke="#111" strokeWidth="1" />
      </svg>
    );
  }

  if (country === "Australia") {
    return (
      <svg className="hlt-feedback-review-flag" viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="20" fill="#012169" />
        <path d="M0 0 14 9M14 0 0 9" stroke="#fff" strokeWidth="2.2" />
        <path d="M0 0 14 9M14 0 0 9" stroke="#c8102e" strokeWidth="1" />
        <path d="M7 0v9M0 4.5h14" stroke="#fff" strokeWidth="3" />
        <path d="M7 0v9M0 4.5h14" stroke="#c8102e" strokeWidth="1.5" />
        <path d="m21 5 .7 1.6 1.8.1-1.4 1.2.5 1.8L21 8.8l-1.6.9.5-1.8-1.4-1.2 1.8-.1L21 5Zm5 8 .5 1.1 1.2.1-.9.8.3 1.2-1.1-.6-1.1.6.3-1.2-.9-.8 1.2-.1.5-1.1Z" fill="#fff" />
      </svg>
    );
  }

  if (country === "China") {
    return (
      <svg className="hlt-feedback-review-flag" viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="20" fill="#de2910" />
        <path d="m6 3 1.1 2.2 2.4.3-1.7 1.7.4 2.4L6 8.5 3.8 9.6l.4-2.4-1.7-1.7 2.4-.3L6 3Zm6 0 .35.7.8.1-.6.55.15.8-.7-.4-.7.4.15-.8-.6-.55.8-.1L12 3Z" fill="#ffde00" />
      </svg>
    );
  }

  if (country === "United Kingdom") {
    return (
      <svg className="hlt-feedback-review-flag" viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="20" fill="#012169" />
        <path d="M0 0 30 20M30 0 0 20" stroke="#fff" strokeWidth="4" />
        <path d="M0 0 30 20M30 0 0 20" stroke="#c8102e" strokeWidth="1.6" />
        <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6" />
        <path d="M15 0v20M0 10h30" stroke="#c8102e" strokeWidth="3" />
      </svg>
    );
  }

  return (
    <svg className="hlt-feedback-review-flag" viewBox="0 0 30 20" aria-hidden="true">
      <rect width="10" height="20" fill="#0055a4" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#ef4135" />
    </svg>
  );
}

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Guest Feedback | Hoang Luxury Travel";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="hlt-site hlt-feedback-site">
      <Header />
      <main
        className="hlt-feedback-main"
        style={{ "--feedback-background": `url(${servicesBackgroundUrl})` }}
      >
        <section className="hlt-feedback-trust" aria-labelledby="feedback-title">
          <div className="hlt-container hlt-feedback-trust-inner">
            <h1 id="feedback-title">
              <span>Trusted by Travelers</span>
              <span>From Around the World</span>
            </h1>
            <p>Private journeys, thoughtfully delivered across Northern Vietnam.</p>

            <div className="hlt-feedback-stats" aria-label="Hoang Luxury Travel service statistics">
              {feedbackStats.map((stat) => (
                <article key={stat.label}>
                  <FeedbackIcon type={stat.icon} />
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="guest-reviews" className="hlt-feedback-reviews" aria-labelledby="guest-reviews-title">
          <div className="hlt-container hlt-feedback-reviews-inner">
            <header>
              <h2 id="guest-reviews-title">What Our Guests Say</h2>
              <p>Real stories from real journeys across Northern Vietnam.</p>
            </header>

            <div className="hlt-feedback-review-grid">
              {guestReviews.map((review) => (
                <article className="hlt-feedback-review-card" key={`${review.name}-${review.date}`}>
                  <img src={review.image} alt="" loading="lazy" decoding="async" />
                  <div className="hlt-feedback-review-body">
                    <h3>{review.title}</h3>
                    <div className="hlt-feedback-stars" aria-label="5 out of 5 stars">★★★★★</div>
                    <blockquote>{review.quote}</blockquote>
                    <div className="hlt-feedback-review-author">
                      <CountryFlag country={review.country} />
                      <span>
                        <strong>{review.name}</strong>
                        <small>{review.country}</small>
                      </span>
                      <time dateTime={review.dateIso}>{review.dateDisplay}</time>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="hlt-feedback-form-section" aria-labelledby="feedback-form-title">
          <form className="hlt-feedback-form" onSubmit={(event) => event.preventDefault()}>
            <FeedbackFrameCorner position="top-left" />
            <FeedbackFrameCorner position="top-right" />
            <FeedbackFrameCorner position="bottom-right" />
            <FeedbackFrameCorner position="bottom-left" />

            <header>
              <FeedbackFormOrnament />
              <h2 id="feedback-form-title">Every Experience Matters to Us</h2>
              <p>
                We want every journey with Hoang Luxury Travel to deliver an experience worthy of the trust you place
                in us. If any detail has not left you completely satisfied, please share it with us. Our management
                team will personally review your feedback with care, make the appropriate improvements, and continue
                refining the quality of our service.
              </p>
            </header>

            <div className="hlt-feedback-form-fields">
              <label className="hlt-feedback-booking-id">
                <span>Booking ID</span>
                <span className="hlt-feedback-form-control">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="4" y="7" width="16" height="14" rx="2" />
                    <path d="M9 7V4h6v3M8 11h8M8 11v6M16 11v6" />
                  </svg>
                  <input
                    required
                    name="bookingId"
                    placeholder="Enter your Booking ID — e.g. HLT-1008-RSKS003"
                    autoComplete="off"
                    maxLength="80"
                  />
                </span>
              </label>

              <fieldset className="hlt-feedback-rating">
                <legend>How Was Your Experience</legend>
                <div aria-label="Choose a rating from 1 to 5 stars">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label
                      className={value <= rating ? "is-selected" : ""}
                      key={value}
                      title={`${value} ${value === 1 ? "star" : "stars"}`}
                    >
                      <input
                        required
                        type="radio"
                        name="rating"
                        value={value}
                        checked={rating === value}
                        onChange={() => setRating(value)}
                      />
                      <svg viewBox="0 0 48 48" aria-hidden="true">
                        <path d="m24 4.5 5.9 12 13.2 1.9-9.5 9.3 2.2 13.1L24 34.6l-11.8 6.2 2.2-13.1-9.5-9.3 13.2-1.9L24 4.5Z" />
                      </svg>
                      <span className="hlt-sr-only">{value} out of 5 stars</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="hlt-feedback-experience">
                <span>Tell Us About Your Experience</span>
                <span className="hlt-feedback-form-control is-textarea">
                  <textarea
                    required
                    name="experience"
                    placeholder="Please share your experience, including anything you particularly enjoyed or anything we could improve..."
                    maxLength="5000"
                  />
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 20h4L20 8l-4-4L4 16v4ZM14 6l4 4" />
                  </svg>
                </span>
              </label>
            </div>

            <button type="submit">Send My Feedback</button>

            <p className="hlt-feedback-private">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              Your feedback will be reviewed privately by the Hoang Luxury Travel management team.
            </p>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}

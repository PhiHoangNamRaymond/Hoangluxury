import React, { useEffect, useState } from "react";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import { feedbackReviewImages, feedbackStatIcons, servicesBackgroundUrl } from "./config/assets.js";
import usePageEntered from "./hooks/usePageEntered.js";

const feedbackStats = [
  { icon: feedbackStatIcons[0], value: "Licensed", label: "Transport Operator" },
  { icon: feedbackStatIcons[1], value: "20+", label: "Guest Nationalities" },
  { icon: feedbackStatIcons[2], value: "4.9/5", label: "Guest Rating" },
  { icon: feedbackStatIcons[3], value: "100% Private", label: "Private Car" },
];

// Review thật của khách, theo thứ tự ảnh trong feedbackReviewImages.
// Không đăng tên khách và ngày; "guest" hiển thị ở dòng tác giả.
// lang: review tiếng Hàn / tiếng Trung giữ nguyên ngôn ngữ gốc.
const guestReviews = [
  {
    title: "Last-Minute Change, Handled",
    quote: "Our plans changed the night before the trip, so we were a little worried as everything was very last minute. But the Hoang Luxury team responded very quickly and helped us arrange everything again. Before the trip, they sent us all the details about the car, driver and pickup time. Everything was handled very quickly and smoothly, so we felt much more relaxed and comfortable. We were really happy with the support from the team.",
    country: "India",
    guest: "Guest from India",
    alt: "Hanoi to Sapa private car – Hoang Luxury Travel",
  },
  {
    title: "On Time for the Cruise",
    quote: "We needed a reliable car to take us to the Ha Long cruise port. We had quite a lot of luggage and also needed to make sure we arrived on time for the cruise. The driver came early, helped us with our luggage at the port and made sure everything went smoothly. We arrived comfortably and even earlier than expected.",
    country: "Saudi Arabia",
    guest: "Guest from Saudi Arabia",
    alt: "Hanoi to Ha Long private car – Hoang Luxury Travel",
  },
  {
    title: "Better Than the Bus",
    quote: "저는 버스를 타고 이동하는 걸 별로 좋아하지 않아요. 버스는 시끄럽고 좁아서 불편하거든요. 여러 가지를 알아본 후에 호앙 씨의 차량으로 사파까지 개인 차량을 이용해 가기로 결정했습니다. 솔직히 말씀드리면 저는 꽤 까다로운 편이에요. 예전에 하롱에서 서비스 이용을 하면서 몇 번 좋지 않은 경험을 한 적이 있어서 베트남의 서비스에 대해 그다지 좋은 인상을 가지고 있지는 않았어요. 그런데 이번에는 정말 만족스러웠습니다. 저와 아내 모두 모든 면에서 만족스러웠어요. 앞으로도 다시 이용하고 싶습니다. 좋은 서비스 제공해 주셔서 감사합니다.",
    country: "South Korea",
    guest: "Guest from South Korea",
    lang: "ko",
    alt: "Hanoi to Ha Giang private car – Hoang Luxury Travel",
  },
  {
    title: "Photos to Remember",
    quote: "My family had a memorable experience at Garrya Mu Cang Chai. The scenery was absolutely beautiful and we would definitely come back again. The car service was excellent as well. Our driver was punctual, polite and very thoughtful. During the journey, he asked if he could take a few photos of our family and of course we said yes. At the end of the trip, we were so surprised to receive lots of lovely photos to keep as memories. It was such a nice touch and we really appreciated it.",
    country: "United Kingdom",
    guest: "Guest from the United Kingdom",
    alt: "Hanoi to Mu Cang Chai private transfer – Hoang Luxury Travel",
  },
  {
    title: "Lost Camera, Found",
    quote: "We had a really great experience! When we arrived back in Hanoi, we realised that we had left our camera at Hotel de la Coupole in Sapa. Hoang Luxury quickly helped us contact the hotel and arranged for a driver to bring the camera back to their office. As our flight was delayed, the Hoang team also helped us find a new flight and took us to the airport free of charge. Great service and we were very happy with everything.",
    country: "France",
    guest: "Guest from France",
    alt: "Representative Office of Hoang Luxury Travel – Hanoi to Sapa Private Transfer",
  },
  {
    title: "Smoke-Free & Professional",
    quote: "Hoang Luxury Travel’s service was excellent! Our driver was very professional. He never used his phone while driving and didn’t smoke, which was really important to me because I’m allergic to cigarette smoke. He also recommended some really good local places to eat. After we spent the evening exploring the market, he came back right on time to pick us up, helped us carry our things and drove our group back to the hotel. I’ll definitely choose this service again and highly recommend it to my friends.",
    country: "United States",
    guest: "Guest from the United States",
    alt: "Hanoi to Ninh Binh private transfer – Hoang Luxury Travel",
  },
  {
    title: "An Extra Car for Luggage",
    quote: "我们一行人预订了一辆私人包车去沙坝。因为行李比较多，一共有6个行李箱，所以出发前我特意跟 Hoang Team 沟通过这个问题。他们跟我说没问题，让我们完全不用担心。没想到当天来接我们的竟然有两辆车，我当时真的挺惊喜。他们另外安排了一辆车专门帮我们放行李，所有行李都放到了另一辆车上，这样主车里的空间就非常宽敞舒服。这个安排真的很不错，让我印象很深。整体服务非常灵活、细心，也很专业。",
    country: "China",
    guest: "Guest from China",
    lang: "zh",
    alt: "Hanoi to Ha Giang private transfer – Hoang Luxury Travel",
  },
  {
    title: "Worth the Late-Night Wait",
    quote: "It was my first time visiting Vietnam and our flight landed at Noi Bai Airport more than an hour late. It was already close to 1 a.m. We messaged Hoang Luxury to let them know. And then they replied very quickly, telling us not to worry and that the driver would wait for us. We even had some Phở at the airport because one of the airport staff told us it was the best one there. The driver never rushed us and waited patiently. When we finally met him, he helped with our suitcases and took us to a white SUV. We also asked him to take a photo of us as a memory of the trip. I really appreciated how professional and patient the service was.",
    country: "United States",
    guest: "Guest from the United States",
    alt: "Hoang Luxury Travel private car interior",
  },
].map((review, index) => ({ ...review, image: feedbackReviewImages[index] }));

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

  if (country === "India") {
    return (
      <svg className="hlt-feedback-review-flag" viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="20" fill="#fff" />
        <rect width="30" height="6.67" fill="#ff9933" />
        <rect y="13.33" width="30" height="6.67" fill="#138808" />
        <circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" strokeWidth=".7" />
        <path d="M15 7.4v5.2M12.4 10h5.2M13.2 8.2l3.6 3.6M16.8 8.2l-3.6 3.6" stroke="#000080" strokeWidth=".35" />
      </svg>
    );
  }

  // Cờ Ả Rập Xê Út rút gọn: nền xanh, dòng chữ và thanh kiếm cách điệu màu trắng.
  if (country === "Saudi Arabia") {
    return (
      <svg className="hlt-feedback-review-flag" viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="20" fill="#006c35" />
        <path d="M8 8.5c1-1.2 2-1.2 3 0s2 1.2 3 0 2-1.2 3 0 2 1.2 3 0 2-1.2 2.5-.4" fill="none" stroke="#fff" strokeWidth=".9" strokeLinecap="round" />
        <path d="M8.5 13.2h12.5M20.5 12.4l1.4.8-1.4.8" fill="none" stroke="#fff" strokeWidth=".9" strokeLinecap="round" strokeLinejoin="round" />
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

  if (country === "France") {
    return (
      <svg className="hlt-feedback-review-flag" viewBox="0 0 30 20" aria-hidden="true">
        <rect width="10" height="20" fill="#0055a4" />
        <rect x="10" width="10" height="20" fill="#fff" />
        <rect x="20" width="10" height="20" fill="#ef4135" />
      </svg>
    );
  }

  return null;
}

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const pageEntered = usePageEntered();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Guest Feedback | Hoang Luxury Travel";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div
      className={`hlt-site hlt-feedback-site hlt-page-slide-down${pageEntered ? " is-entered" : ""}`}
    >
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
            <p>Private transfer, thoughtfully delivered across Northern Vietnam.</p>

            <div className="hlt-feedback-stats" aria-label="Hoang Luxury Travel service statistics">
              {feedbackStats.map((stat) => (
                <article key={stat.label}>
                  <img src={stat.icon} alt="" />
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
              <p>Real experiences, real emotions. Thank you to our guests for allowing us to share these wonderful moments.</p>
            </header>

            <div className="hlt-feedback-review-grid">
              {guestReviews.map((review) => (
                <article className="hlt-feedback-review-card" key={review.title}>
                  <img src={review.image} alt={review.alt} loading="lazy" decoding="async" />
                  <div className="hlt-feedback-review-body">
                    <h3>{review.title}</h3>
                    <div className="hlt-feedback-stars" aria-label="5 out of 5 stars">★★★★★</div>
                    <blockquote lang={review.lang}>{review.quote}</blockquote>
                    <div className="hlt-feedback-review-author">
                      <CountryFlag country={review.country} />
                      <strong>{review.guest}</strong>
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
               We want every journey with Hoang Luxury Travel to be a comfortable and memorable experience. Your feedback helps us understand what we do well and where we can improve. Every comment is carefully reviewed by our team so we can continue improving our service.
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
                    placeholder="Enter your Booking ID — e.g. HLT-120826-RSKS001-001"
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

            <button type="submit">Send Feedback</button>

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

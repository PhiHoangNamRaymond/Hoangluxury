import React, { useState } from "react";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";
import { whatsappUrl } from "./data.js";
import { catalogBackgroundUrl } from "./config/assets.js";

const initialForm = {
  departureDate: "",
  returnDate: "",
  pickup: "",
  dropoff: "",
  flight: "",
  flightTimeZone: "",
  passengers: "2",
  nationality: "",
  fullName: "",
  phone: "",
  journeyType: "",
  luggage: "",
  requirements: "",
  website: "",
};

const bookingEndpoint = import.meta.env.VITE_BOOKING_SHEET_ENDPOINT?.trim();

function FormIcon({ type, className = "hlt-book-field-icon" }) {
  const icons = {
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
    location: <><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></>,
    plane: <><path d="m3 13 18-8-7 16-2.5-6L3 13Z" /><path d="m11.5 15 4-4" /></>,
    passengers: <><circle cx="12" cy="7" r="3" /><path d="M6 21v-2a6 6 0 0 1 12 0v2" /></>,
    user: <><circle cx="12" cy="7" r="3" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    phone: <path d="M7 3H4.5A1.5 1.5 0 0 0 3 4.5C3 13.6 10.4 21 19.5 21a1.5 1.5 0 0 0 1.5-1.5V17l-4-1-1.5 2c-4.2-1.4-8.1-5.3-9.5-9.5L8 7 7 3Z" />,
    car: <><path d="m5 16-2-2v-3l2-5h14l2 5v3l-2 2" /><path d="M4 11h16M7 16v2M17 16v2" /><circle cx="7" cy="14" r="1" /><circle cx="17" cy="14" r="1" /></>,
    luggage: <><rect x="5" y="7" width="14" height="14" rx="2" /><path d="M9 7V4h6v3M9 11v6M15 11v6" /></>,
    note: <><path d="M4 20h4L20 8l-4-4L4 16v4Z" /><path d="m14 6 4 4" /></>,
    shield: <><path d="M12 3 5 6v5c0 4.8 2.8 8 7 10 4.2-2 7-5.2 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-5" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.4 4.2 6.4 4.2 9S15 17.6 12 21c-3-3.4-4.2-6.4-4.2-9S9 6.4 12 3Z" /></>,
    headset: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 14h3v6H5a1 1 0 0 1-1-1v-5ZM20 14h-3v6h2a1 1 0 0 0 1-1v-5ZM17 20c0 1-1 2-3 2h-2" /></>,
  };

  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true">{icons[type]}</svg>;
}

const highlights = [
  ["shield", "Safe & Professional", "Experienced drivers, your safety is our priority."],
  ["car", " Private Luxury Cars", "Modern, clean, and reserved just for you."],
  ["clock", "On-Time Service", "Always on time, so you never have to wait."],
  ["headset", "24/7 Support", "We are here whenever you need us."],
];

export default function BookingPage() {
  const [form, setForm] = useState(initialForm);
  const [submission, setSubmission] = useState({ state: "idle", message: "" });

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const closeSuccessPopup = () => {
    setSubmission({ state: "idle", message: "" });
  };

  const submitBooking = async (event) => {
    event.preventDefault();

    if (!bookingEndpoint) {
      setSubmission({ state: "error", message: "Online booking is being configured. Please contact us via WhatsApp." });
      return;
    }

    setSubmission({ state: "loading", message: "Sending your booking request..." });
    const payload = new URLSearchParams({ ...form, submittedFrom: window.location.href, clientTimestamp: new Date().toISOString() });

    try {
      await fetch(bookingEndpoint, { method: "POST", mode: "no-cors", credentials: "omit", keepalive: true, body: payload });
      setForm(initialForm);
      setSubmission({
        state: "success",
        message: "Your request was submitted. Our concierge team will contact you shortly to confirm it.",
      });
    } catch {
      setSubmission({ state: "error", message: "We could not send your request. Please try again or contact us via WhatsApp." });
    }
  };

  return (
    <div className="hlt-site hlt-booking-site">
      <Header />
      <main
        className="hlt-book-page"
        style={{ "--booking-page-bg": `url(${catalogBackgroundUrl})` }}
      >
        <section
          className="hlt-book-hero"
          style={{ "--booking-hero": `url(${catalogBackgroundUrl})` }}
          aria-hidden="true"
        />

        <section className="hlt-book-shell" aria-labelledby="booking-page-title">
        <aside className="hlt-book-care">
          <h2>Every Detail<br />Meticulously<br />Cared For</h2>
          <div className="hlt-book-highlights">
            {highlights.map(([icon, title, text]) => (
              <article key={title}>
                <div><FormIcon type={icon} className="hlt-book-highlight-icon" /></div>
                <p><strong>{title}</strong><span>{text}</span></p>
              </article>
            ))}
          </div>
          <a className="hlt-book-support" href="tel:+84839779888">
            <FormIcon type="headset" className="hlt-book-support-icon" />
            <span><strong>Assistance &amp; Support</strong><small>Hoang Luxury Travel is ready to assist you anytime.</small><b>+84 839 779 888</b></span>
          </a>
        </aside>

        <form className="hlt-book-form" onSubmit={submitBooking}>
          <header>
            <div className="hlt-book-form-icon"><FormIcon type="calendar" className="hlt-book-form-heading-icon" /></div>
            <div><h2 id="booking-page-title">Book Your Private Transfer</h2><p>Choose your preferred option: message us on WhatsApp or fill out the form below.</p></div>
          </header>

          <label className="hlt-book-honeypot" aria-hidden="true">Website<input name="website" value={form.website} onChange={updateField} tabIndex="-1" autoComplete="off" /></label>
          <div className="hlt-book-fields">
            <label><span className="hlt-book-label-text">Departure Date</span><div className="hlt-book-control"><FormIcon type="calendar" /><input required type="date" name="departureDate" value={form.departureDate} onChange={updateField} /></div></label>
            <label><span className="hlt-book-label-text">Return Date <small>(Optional)</small></span><div className="hlt-book-control"><FormIcon type="calendar" /><input type="date" name="returnDate" value={form.returnDate} onChange={updateField} /></div></label>
            <label><span className="hlt-book-label-text">Pick-up Location</span><div className="hlt-book-control"><FormIcon type="location" /><input required name="pickup" value={form.pickup} onChange={updateField} placeholder="e.g. Noi Bai International Airport, Hanoi" /></div></label>
            <label><span className="hlt-book-label-text">Drop-off Location</span><div className="hlt-book-control"><FormIcon type="location" /><input required name="dropoff" value={form.dropoff} onChange={updateField} placeholder="e.g. Sapa Town, Lao Cai" /></div></label>
            <label><span className="hlt-book-label-text">Flight Number <small>(Optional)</small></span><div className="hlt-book-control"><FormIcon type="plane" /><input name="flight" value={form.flight} onChange={updateField} placeholder="Enter your flight number" /></div></label>
            <label><span className="hlt-book-label-text">Flight Time</span><div className="hlt-book-control"><FormIcon type="clock" /><input required name="flightTimeZone" value={form.flightTimeZone} onChange={updateField} placeholder="e.g. 14:30" /></div></label>
            <label><span className="hlt-book-label-text">Number of Passengers</span><div className="hlt-book-control"><FormIcon type="passengers" /><select name="passengers" value={form.passengers} onChange={updateField}>{[1,2,3,4,5,6].map((count) => <option key={count} value={count}>{count} {count === 1 ? "passenger" : "passengers"}</option>)}</select></div></label>
            <label><span className="hlt-book-label-text">Nationality</span><div className="hlt-book-control"><FormIcon type="globe" /><input required name="nationality" value={form.nationality} onChange={updateField} placeholder="e.g. Vietnamese" /></div></label>
            <label><span className="hlt-book-label-text">Full Name</span><div className="hlt-book-control"><FormIcon type="user" /><input required name="fullName" value={form.fullName} onChange={updateField} placeholder="Enter your full name" /></div></label>
            <label><span className="hlt-book-label-text">Contact Number</span><div className="hlt-book-control"><FormIcon type="phone" /><input required type="tel" name="phone" value={form.phone} onChange={updateField} placeholder="Enter your phone number" /></div></label>
            <label><span className="hlt-book-label-text">Journey Type</span><div className="hlt-book-control"><FormIcon type="car" /><select required name="journeyType" value={form.journeyType} onChange={updateField}><option value="" disabled>Select journey type</option><option>One-way</option><option>Round Trip</option><option>Custom Request</option></select></div></label>
            <label><span className="hlt-book-label-text">Luggage</span><div className="hlt-book-control"><FormIcon type="luggage" /><input name="luggage" value={form.luggage} onChange={updateField} placeholder="e.g. 2 suitcases, 1 carry-on" /></div></label>
            <label className="hlt-book-requirements"><span className="hlt-book-label-text">Special Requirements <small>(Optional)</small></span><div className="hlt-book-control hlt-book-control-textarea"><FormIcon type="note" /><textarea name="requirements" value={form.requirements} onChange={updateField} placeholder="Tell us your requests, special needs, or other details." /></div></label>
          </div>

          <div className="hlt-book-actions">
            <button type="submit" disabled={submission.state === "loading"}>{submission.state === "loading" ? "Sending..." : "Request a Quote"}<span aria-hidden="true">→</span></button>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Chat via WhatsApp</a>
          </div>
          {submission.message && submission.state !== "success" && <p className={`hlt-book-status is-${submission.state}`} role="status" aria-live="polite">{submission.message}</p>}
          <p className="hlt-book-secure">Your information is secure and will only be used to process your booking.</p>
        </form>
        </section>

        {submission.state === "success" && (
          <div
            className="hlt-book-success-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeSuccessPopup();
            }}
          >
            <section
              className="hlt-book-success-popup"
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-success-title"
              aria-describedby="booking-success-message"
            >
              <button type="button" className="hlt-book-success-close" onClick={closeSuccessPopup} aria-label="Close thank you message">×</button>
              <div className="hlt-book-success-icon" aria-hidden="true">✓</div>
              <p className="hlt-book-success-kicker">Booking Request Received</p>
              <h2 id="booking-success-title">Thank You</h2>
              <p id="booking-success-message">Your request was submitted. Our concierge team will contact you shortly to confirm your journey.</p>
              <button type="button" className="hlt-book-success-done" onClick={closeSuccessPopup}>Done</button>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { whatsappUrl } from "./data";

const initialForm = {
  departureDate: "",
  returnDate: "",
  pickup: "",
  dropoff: "",
  flight: "",
  passengers: "2",
  fullName: "",
  phone: "",
  journeyType: "",
  luggage: "",
  requirements: "",
};

function FormIcon({ type }) {
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
  };

  return <svg className="hlt-book-field-icon" viewBox="0 0 24 24" aria-hidden="true">{icons[type]}</svg>;
}

export default function BookingModal({ open, onClose }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onClose]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submitBooking = (event) => {
    event.preventDefault();
    const message = [
      "Hello Hoang Luxury Travel, I would like to request a private transfer quote.",
      `Full name: ${form.fullName}`,
      `Phone: ${form.phone}`,
      `Departure date: ${form.departureDate}`,
      `Return date: ${form.returnDate || "One way / not specified"}`,
      `Pick-up: ${form.pickup}`,
      `Drop-off: ${form.dropoff}`,
      `Flight number: ${form.flight || "Not specified"}`,
      `Passengers: ${form.passengers}`,
      `Journey type: ${form.journeyType}`,
      `Luggage: ${form.luggage || "Not specified"}`,
      `Special requirements: ${form.requirements || "None"}`,
    ].join("\n");

    window.open(`https://wa.me/84839779888?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`hlt-book-modal${open ? " is-open" : ""}`} aria-hidden={!open}>
      <button className="hlt-book-backdrop" type="button" onClick={onClose} aria-label="Close booking overlay" />
      <section className="hlt-book-sheet" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
        <button className="hlt-book-close" type="button" onClick={onClose} aria-label="Close booking form">×</button>
        <header className="hlt-book-sheet-header">
          <span>Private Luxury Transfer</span>
          <h2 id="booking-modal-title">Book Your Drive</h2>
          <p>Share your journey details and our concierge team will contact you shortly.</p>
        </header>

        <form className="hlt-book-modal-form" onSubmit={submitBooking}>
          <div className="hlt-book-fields">
            <label><span className="hlt-book-label-text">Departure Date</span><div className="hlt-book-control"><FormIcon type="calendar" /><input required type="date" name="departureDate" value={form.departureDate} onChange={updateField} /></div></label>
            <label><span className="hlt-book-label-text">Return Date <small>(Optional)</small></span><div className="hlt-book-control"><FormIcon type="calendar" /><input type="date" name="returnDate" value={form.returnDate} onChange={updateField} /></div></label>
            <label><span className="hlt-book-label-text">Pick-up Location</span><div className="hlt-book-control"><FormIcon type="location" /><input required name="pickup" value={form.pickup} onChange={updateField} placeholder="e.g. Noi Bai International Airport, Hanoi" /></div></label>
            <label><span className="hlt-book-label-text">Drop-off Location</span><div className="hlt-book-control"><FormIcon type="location" /><input required name="dropoff" value={form.dropoff} onChange={updateField} placeholder="e.g. Sapa Town, Lao Cai" /></div></label>
            <label><span className="hlt-book-label-text">Flight Number <small>(Optional)</small></span><div className="hlt-book-control"><FormIcon type="plane" /><input name="flight" value={form.flight} onChange={updateField} placeholder="Enter your flight number" /></div></label>
            <label><span className="hlt-book-label-text">Number of Passengers</span><div className="hlt-book-control"><FormIcon type="passengers" /><select name="passengers" value={form.passengers} onChange={updateField}>{[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} {count === 1 ? "passenger" : "passengers"}</option>)}</select></div></label>
            <label><span className="hlt-book-label-text">Full Name</span><div className="hlt-book-control"><FormIcon type="user" /><input required name="fullName" value={form.fullName} onChange={updateField} placeholder="Enter your full name" /></div></label>
            <label><span className="hlt-book-label-text">Contact Number</span><div className="hlt-book-control"><FormIcon type="phone" /><input required type="tel" name="phone" value={form.phone} onChange={updateField} placeholder="Enter your phone number" /></div></label>
            <label><span className="hlt-book-label-text">Journey Type</span><div className="hlt-book-control"><FormIcon type="car" /><select required name="journeyType" value={form.journeyType} onChange={updateField}><option value="" disabled>Select journey type</option><option>Airport Transfer</option><option>Long-Distance Private Transfer</option><option>Custom Private Trip</option><option>Business / Partner Transfer</option></select></div></label>
            <label><span className="hlt-book-label-text">Luggage</span><div className="hlt-book-control"><FormIcon type="luggage" /><input name="luggage" value={form.luggage} onChange={updateField} placeholder="e.g. 2 suitcases, 1 carry-on" /></div></label>
            <label className="hlt-book-requirements"><span className="hlt-book-label-text">Special Requirements <small>(Optional)</small></span><div className="hlt-book-control hlt-book-control-textarea"><FormIcon type="note" /><textarea name="requirements" value={form.requirements} onChange={updateField} placeholder="Tell us your requests, special needs, or other details." /></div></label>
          </div>

          <div className="hlt-book-actions">
            <button type="submit">Request a Quote <span>→</span></button>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Chat via WhatsApp</a>
          </div>
          <p className="hlt-book-secure">Your information is secure and will only be used to process your booking.</p>
        </form>
      </section>
    </div>
  );
}

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
            <label>Departure Date<input required type="date" name="departureDate" value={form.departureDate} onChange={updateField} /></label>
            <label>Return Date <small>(Optional)</small><input type="date" name="returnDate" value={form.returnDate} onChange={updateField} /></label>
            <label>Pick-up Location<input required name="pickup" value={form.pickup} onChange={updateField} placeholder="e.g. Noi Bai International Airport, Hanoi" /></label>
            <label>Drop-off Location<input required name="dropoff" value={form.dropoff} onChange={updateField} placeholder="e.g. Sapa Town, Lao Cai" /></label>
            <label>Flight Number <small>(Optional)</small><input name="flight" value={form.flight} onChange={updateField} placeholder="Enter your flight number" /></label>
            <label>Number of Passengers<select name="passengers" value={form.passengers} onChange={updateField}>{[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} {count === 1 ? "passenger" : "passengers"}</option>)}</select></label>
            <label>Full Name<input required name="fullName" value={form.fullName} onChange={updateField} placeholder="Enter your full name" /></label>
            <label>Contact Number<input required type="tel" name="phone" value={form.phone} onChange={updateField} placeholder="Enter your phone number" /></label>
            <label>Journey Type<select required name="journeyType" value={form.journeyType} onChange={updateField}><option value="" disabled>Select journey type</option><option>Airport Transfer</option><option>Long-Distance Private Transfer</option><option>Custom Private Trip</option><option>Business / Partner Transfer</option></select></label>
            <label>Luggage<input name="luggage" value={form.luggage} onChange={updateField} placeholder="e.g. 2 suitcases, 1 carry-on" /></label>
            <label className="hlt-book-requirements">Special Requirements <small>(Optional)</small><textarea name="requirements" value={form.requirements} onChange={updateField} placeholder="Tell us your requests, special needs, or other details." /></label>
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

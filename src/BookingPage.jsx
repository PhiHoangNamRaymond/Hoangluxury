import React, { useEffect, useRef, useState } from "react";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";
import { whatsappUrl } from "./data.js";
import { catalogBackgroundUrl } from "./config/assets.js";
import { countries } from "./config/countries.js";
import { dialCodes } from "./config/dial-codes.js";
import { getBookingSource } from "./config/booking-source.js";
import { formTextError } from "./lib/public-config.js";
import { validFormsProxy, requestIdFor, submitForm } from "./lib/forms.js";
import Turnstile from "./components/Turnstile.jsx";

const initialForm = {
  departureDate: "",
  returnDate: "",
  pickup: "",
  dropoff: "",
  noFlight: false,
  flight: "",
  flightTimeZone: "",
  passengers: "",
  country: "",
  fullName: "",
  phoneCode: "+84",
  phone: "",
  journeyType: "",
  luggage: "",
  requirements: "",
  website: "",
};

const configuredBookingEndpoint = import.meta.env.VITE_FORMS_PROXY_URL?.trim();
const bookingEndpoint = validFormsProxy(configuredBookingEndpoint) ? configuredBookingEndpoint : "";

const bookingSteps = [
  { number: 1, label: "Journey Route", fields: ["departureDate", "returnDate", "pickup", "dropoff"] },
  { number: 2, label: "Flight Details", fields: ["flight", "flightTimeZone"] },
  { number: 3, label: "Passenger Details", fields: ["fullName", "phoneCode", "phone", "country", "passengers"] },
  { number: 4, label: "Ride Preferences", fields: ["journeyType", "luggage", "requirements"] },
  { number: 5, label: "Review & Send", fields: [] },
];

function FormIcon({ type, className = "hlt-book-field-icon" }) {
  // Ô "Private Luxury Cars" dùng icon xe nét đặc (khách gửi), không phải nét viền.
  if (type === "carSolid") {
    return (
      <svg className={`${className} hlt-book-icon-solid`} viewBox="86 263 1082 765" aria-hidden="true">
        <path fillRule="evenodd" d="M356 263 H898 q42 0 57 39 L1013 452 h84 q71 0 71 60 q0 58 -71 58 q33 20 33 66 V930 h-30 v70 q0 28 -28 28 H976 q-28 0 -28 -28 V930 H306 v70 q0 28 -28 28 H182 q-28 0 -28 -28 V930 h-30 V636 q0 -46 33 -66 q-71 0 -71 -58 q0 -60 71 -60 h84 L299 302 q15 -39 57 -39 Z M372 336 q-30 0 -40 28 l-62 172 q-8 22 16 22 H968 q24 0 16 -22 l-62 -172 q-10 -28 -40 -28 Z M178 654 q-4 -14 10 -12 l186 30 q14 2 14 16 v52 q0 16 -15 12 l-186 -42 q-12 -3 -12 -15 Z M1076 654 q4 -14 -10 -12 l-186 30 q-14 2 -14 16 v52 q0 16 15 12 l186 -42 q12 -3 12 -15 Z M444 694 H810 q22 0 14 20 l-28 62 q-6 14 -22 14 H480 q-16 0 -22 -14 l-28 -62 q-8 -20 14 -20 Z M205 862 a38 38 0 1 0 76 0 a38 38 0 1 0 -76 0 Z M973 862 a38 38 0 1 0 76 0 a38 38 0 1 0 -76 0 Z" />
      </svg>
    );
  }

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
  ["carSolid", " Private Luxury Cars", "Modern, clean, and reserved just for you."],
  ["clock", "On-Time Service", "Always on time, so you never have to wait."],
  ["headset", "24/7 Support", "We are here whenever you need us."],
];

/* Ảnh cờ 4:3 lấy theo mã ISO; alt là mã nước để vẫn đọc được nếu ảnh không tải */
/* Nút ⓘ cạnh nhãn Luggage: bấm để mở bảng kích thước vali tham khảo */
function LuggageHint() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onDocumentDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onDocumentDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("pointerdown", onDocumentDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span className="hlt-book-hint" ref={wrapRef}>
      <button
        type="button"
        className="hlt-book-hint-btn"
        aria-expanded={open}
        aria-label="Luggage size guide"
        onClick={(event) => {
          event.preventDefault();
          setOpen((current) => !current);
        }}
      >
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <circle cx="9" cy="9" r="7.4" />
          <path d="M9 8.2v4.2" />
          <path d="M9 5.4v.9" />
        </svg>
      </button>

      {open && (
        <span className="hlt-book-hint-panel" role="note">
          <span className="hlt-book-hint-row"><b>Carry-on</b> approx. 55 × 36 × 23 cm</span>
          <span className="hlt-book-hint-row"><b>Medium suitcase</b> approx. 65 × 43 × 26 cm</span>
          <span className="hlt-book-hint-row"><b>Large suitcase</b> approx. 75 × 50 × 30 cm</span>
        </span>
      )}
    </span>
  );
}

function DialFlag({ iso }) {
  return (
    <img
      className="hlt-book-dial-flag"
      src={`https://flagcdn.com/w40/${iso}.png`}
      srcSet={`https://flagcdn.com/w80/${iso}.png 2x`}
      width="21"
      height="14"
      alt={iso.toUpperCase()}
      loading="lazy"
    />
  );
}

/* Ô chọn mã quốc gia: nút gọn chỉ hiện cờ + mã, bấm ra danh sách có ô tìm kiếm */
function PhoneCodeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);
  const searchRef = useRef(null);
  const [pickedIso, setPickedIso] = useState("");
  const selected = dialCodes.find((item) => item.code === value);
  const iso = pickedIso || (selected ? selected.iso : "");

  useEffect(() => {
    if (!open) return undefined;

    const onDocumentDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onDocumentDown);
    document.addEventListener("keydown", onKey);
    searchRef.current?.focus();

    return () => {
      document.removeEventListener("pointerdown", onDocumentDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const text = query.trim().toLowerCase();
  const list = text
    ? dialCodes.filter(
        (item) => item.country.toLowerCase().includes(text) || item.code.includes(text.replace(/^\+?/, "+"))
      )
    : dialCodes;

  return (
    <div className="hlt-book-dial" ref={wrapRef}>
      <button
        type="button"
        className="hlt-book-dial-btn"
        data-book-field="phoneCode"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={selected ? `Country calling code ${selected.code}` : "Select country calling code"}
        onClick={() => setOpen((current) => !current)}
      >
        {iso ? <DialFlag iso={iso} /> : null}
        <span className="hlt-book-dial-code">{selected ? selected.code : "Code"}</span>
        <svg className="hlt-book-dial-caret" viewBox="0 0 12 8" aria-hidden="true">
          <path d="M1 2.5 6 6.5l5-4" />
        </svg>
      </button>

      {open && (
        <div className="hlt-book-dial-panel">
          <input
            ref={searchRef}
            type="text"
            className="hlt-book-dial-search"
            placeholder="Search country or code"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <ul className="hlt-book-dial-list" role="listbox">
            {list.map((item) => (
              <li key={`${item.country}-${item.code}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={item.code === value}
                  title={item.country}
                  aria-label={item.country + " " + item.code}
                  className={item.code === value ? "is-selected" : undefined}
                  onClick={() => {
                    onChange(item.code);
                    setPickedIso(item.iso);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <DialFlag iso={item.iso} />
                  <span className="hlt-book-dial-code">{item.code}</span>
                </button>
              </li>
            ))}
            {list.length === 0 && <li className="hlt-book-dial-empty">No match</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  const [form, setForm] = useState(initialForm);
  const [currentStep, setCurrentStep] = useState(1);
  const [submission, setSubmission] = useState({ state: "idle", message: "" });
  const [turnstileToken, setTurnstileToken] = useState("");
  const [verificationReset, setVerificationReset] = useState(0);
  const requestRef = useRef(null);

  const updateField = (event) => {
    const { checked, name, type, value } = event.target;
    let nextValue = type === "checkbox" ? checked : value;

    if (name === "noFlight") {
      setForm((current) => ({
        ...current,
        noFlight: checked,
        ...(checked && { flight: "", flightTimeZone: "" }),
      }));
      return;
    }

    // Mã quốc gia nằm ở ô chọn riêng nên ô số chỉ giữ chữ số
    if (name === "phone") {
      nextValue = value.replace(/\D/g, "").slice(0, 15);
    }

    setForm((current) => ({ ...current, [name]: nextValue }));
  };

  const closeSuccessPopup = () => {
    setSubmission({ state: "idle", message: "" });
  };

  const validateStep = (stepNumber) => {
    const step = bookingSteps.find(({ number }) => number === stepNumber);

    for (const fieldName of step.fields) {
      // Mã quốc gia là nút tự dựng nên kiểm tra riêng, không qua checkValidity
      if (fieldName === "phoneCode") {
        if (!form.phoneCode) {
          const trigger = document.querySelector('.hlt-book-form [data-book-field="phoneCode"]');
          trigger?.focus();
          trigger?.classList.add("is-invalid");
          return false;
        }
        continue;
      }

      const field = document.querySelector(`.hlt-book-form [name="${fieldName}"]`);
      if (field && !field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }

    return true;
  };

  const goToNextStep = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((step) => Math.min(step + 1, bookingSteps.length));
    window.requestAnimationFrame(() => {
      document.querySelector(".hlt-book-mobile-stepper")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const goToPreviousStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
    window.requestAnimationFrame(() => {
      document.querySelector(".hlt-book-mobile-stepper")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    if (submission.state === "loading") return;
    const inputError = formTextError(form);
    if (inputError) { setSubmission({ state: "error", message: inputError }); return; }

    if (!form.phoneCode) {
      setSubmission({ state: "error", message: "Please select the country code for your phone number." });
      return;
    }

    if (!bookingEndpoint || !turnstileToken) {
      setSubmission({ state: "error", message: "Online booking is being configured. Please contact us via WhatsApp." });
      return;
    }

    setSubmission({ state: "loading", message: "Sending your booking request..." });
    // Gộp mã quốc gia vào số điện thoại trước khi gửi, ví dụ "+84839779888"
    const { phoneCode, ...rest } = form;
    const fields = {
      ...rest,
      form: "booking",
      phone: `${phoneCode}${form.phone}`,
      source: getBookingSource(),
      submittedFrom: window.location.origin + window.location.pathname,
    };
    const payload = { ...fields, requestId:requestIdFor(requestRef,fields), turnstileToken,
      clientTimestamp:new Date().toISOString() };

    try {
      await submitForm(bookingEndpoint, payload);
      requestRef.current = null;
      setForm(initialForm);
      setCurrentStep(1);
      setSubmission({
        state: "success",
        message: "Your request was submitted. Our concierge team will contact you shortly to confirm it.",
      });
    } catch {
      setSubmission({ state: "error", message: "We could not send your request. Please try again or contact us via WhatsApp." });
    } finally {
      setTurnstileToken(""); setVerificationReset((value) => value + 1);
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

        <form className="hlt-book-form" data-current-step={currentStep} onSubmit={submitBooking}>
          <header>
            <div className="hlt-book-form-icon"><FormIcon type="calendar" className="hlt-book-form-heading-icon" /></div>
            <div><h2 id="booking-page-title">Book Your Private Transfer</h2><p>Choose your preferred option: message us on WhatsApp or fill out the form below.</p></div>
          </header>

          <div className="hlt-book-mobile-stepper" aria-label={`Booking step ${currentStep} of ${bookingSteps.length}`}>
            <div className="hlt-book-mobile-progress" aria-hidden="true">
              {bookingSteps.map((step) => (
                <span
                  className={step.number <= currentStep ? "is-active" : ""}
                  key={step.number}
                >
                  {step.number < currentStep ? "✓" : step.number}
                </span>
              ))}
            </div>
            <p><strong>Step {currentStep} of {bookingSteps.length}</strong>{bookingSteps[currentStep - 1].label}</p>
          </div>

          <label className="hlt-book-honeypot" aria-hidden="true">Website<input name="website" value={form.website} onChange={updateField} tabIndex="-1" autoComplete="off" /></label>
          <div className="hlt-book-fields">
            <label data-book-step="1"><span className="hlt-book-label-text">Departure Date</span><div className="hlt-book-control"><FormIcon type="calendar" /><input required type="date" name="departureDate" max={form.returnDate || undefined} value={form.departureDate} onChange={updateField} /></div></label>
            <label data-book-step="1"><span className="hlt-book-label-text">Return Date <small>(Optional)</small></span><div className="hlt-book-control"><FormIcon type="calendar" /><input type="date" name="returnDate" min={form.departureDate || undefined} value={form.returnDate} onChange={updateField} /></div></label>
            <label data-book-step="1"><span className="hlt-book-label-text">Pick-up Location</span><div className="hlt-book-control"><FormIcon type="location" /><input required name="pickup" value={form.pickup} onChange={updateField} placeholder="e.g. Noi Bai International Airport, Hanoi - 8:00 AM" /></div></label>
            <label data-book-step="1"><span className="hlt-book-label-text">Drop-off Location</span><div className="hlt-book-control"><FormIcon type="location" /><input required name="dropoff" value={form.dropoff} onChange={updateField} placeholder="e.g. Hotel name, street address, Sapa" autoComplete="street-address" /></div></label>
            <label className="hlt-book-no-flight" data-book-step="2"><input type="checkbox" name="noFlight" checked={form.noFlight} onChange={updateField} /><span>I am not arriving by flight</span></label>
            <label data-book-step="2"><span className="hlt-book-label-text">Flight Number <small>(Optional when not flying)</small></span><div className="hlt-book-control"><FormIcon type="plane" /><input required={!form.noFlight} disabled={form.noFlight} name="flight" value={form.flight} onChange={updateField} placeholder="e.g. VN 1222" /></div></label>
            <label data-book-step="2"><span className="hlt-book-label-text">Flight Time (24-hour) <small>(Optional when not flying)</small></span><div className="hlt-book-control"><FormIcon type="clock" /><input required={!form.noFlight} disabled={form.noFlight} type="time" step="60" name="flightTimeZone" value={form.flightTimeZone} onChange={updateField} title="Use 24-hour time, for example 16:30." /></div></label>
            <label data-book-step="3"><span className="hlt-book-label-text">Full Name</span><div className="hlt-book-control"><FormIcon type="user" /><input required name="fullName" value={form.fullName} onChange={updateField} placeholder="Enter your full name" /></div></label>
            {/* Mã quốc gia chọn riêng để khách không quên điền (ví dụ +84) */}
            <label data-book-step="3"><span className="hlt-book-label-text">Contact Number / WhatsApp</span><div className="hlt-book-control hlt-book-control-phone"><FormIcon type="phone" /><PhoneCodeSelect value={form.phoneCode} onChange={(code) => setForm((current) => ({ ...current, phoneCode: code }))} /><input required type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[0-9]{6,15}" maxLength="15" title="Enter 6 to 15 digits, without the country code." name="phone" value={form.phone} onChange={updateField} placeholder="e.g. 839779888" /></div></label>
            <label data-book-step="3"><span className="hlt-book-label-text">Country</span><div className="hlt-book-control"><FormIcon type="globe" /><select required name="country" value={form.country} onChange={updateField}><option value="" disabled>Select your country</option>{countries.map((country) => <option key={country} value={country}>{country}</option>)}</select></div></label>
            <label data-book-step="3"><span className="hlt-book-label-text">Number of People</span><div className="hlt-book-control"><FormIcon type="passengers" /><select required name="passengers" value={form.passengers} onChange={updateField}><option value="" disabled>Select number of people</option>{[1,2,3,4,5,6].map((count) => <option key={count} value={count}>{count} {count === 1 ? "person" : "people"}</option>)}</select></div></label>
            <label data-book-step="4"><span className="hlt-book-label-text">Journey Type</span><div className="hlt-book-control"><FormIcon type="car" /><select required name="journeyType" value={form.journeyType} onChange={updateField}><option value="" disabled>Select journey type</option><option>One-way</option><option>Round Trip</option><option>Custom Request</option></select></div></label>
            <label data-book-step="4"><span className="hlt-book-label-text">Luggage <LuggageHint /></span><div className="hlt-book-control"><FormIcon type="luggage" /><input required name="luggage" value={form.luggage} onChange={updateField} placeholder="e.g. 2 Medium, 1 Large" /></div></label>
            <label className="hlt-book-requirements" data-book-step="4"><span className="hlt-book-label-text">Special Requirements <small>(Optional)</small></span><div className="hlt-book-control hlt-book-control-textarea"><FormIcon type="note" /><textarea name="requirements" value={form.requirements} onChange={updateField} placeholder="Tell us your requests, special needs, or other details." /></div></label>
          </div>

          <div className="hlt-book-mobile-review">
            <p><span>Route</span><strong>{form.pickup} → {form.dropoff}</strong></p>
            <p><span>Travel date</span><strong>{form.departureDate} · {form.noFlight ? "No flight" : form.flightTimeZone}</strong></p>
            <p><span>Passenger</span><strong>{form.fullName} · {form.passengers} {Number(form.passengers) === 1 ? "person" : "people"}</strong></p>
            <p><span>Journey</span><strong>{form.journeyType}</strong></p>
          </div>

          <div className={`hlt-book-mobile-navigation is-step-${currentStep}`}>
            {currentStep > 1 && <button className="is-back" type="button" onClick={goToPreviousStep}>Back</button>}
            {currentStep < bookingSteps.length && <button className="is-next" type="button" onClick={goToNextStep}>Continue <span aria-hidden="true">→</span></button>}
          </div>

          <Turnstile action="booking" onToken={setTurnstileToken} resetKey={verificationReset} />
          {!bookingEndpoint && <p>Online booking is being configured. Please contact us via WhatsApp.</p>}
          <div className="hlt-book-actions">
            <button type="submit" disabled={submission.state === "loading" || !turnstileToken || !bookingEndpoint}>{submission.state === "loading" ? "Sending..." : "Request a Quote"}<span aria-hidden="true">→</span></button>
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

import React from "react";
import BookingProcess from "./components/home/BookingProcess.jsx";
import ExperienceSlider from "./components/home/ExperienceSlider.jsx";
import Fleet from "./components/home/Fleet.jsx";
import Hero from "./components/home/Hero.jsx";
import JourneyCallToAction from "./components/home/JourneyCallToAction.jsx";
import Services from "./components/home/Services.jsx";
import WhyChoose from "./components/home/WhyChoose.jsx";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";
import { whatsappInquiryUrl } from "./data.js";

export default function App() {
  return (
    <div className="hlt-site">
      <Header whatsappHref={whatsappInquiryUrl} />
      <Hero />
      <WhyChoose />
      <Services />
      <Fleet />
      <BookingProcess />
      <JourneyCallToAction headingLevel="h2" title="Ready To Start Your Journey?" className="is-home" secondary="form" whatsappHref={whatsappInquiryUrl} />
      <ExperienceSlider />
      <Footer whatsappHref={whatsappInquiryUrl} />
    </div>
  );
}

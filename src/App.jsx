import React from "react";
import BookingProcess from "./components/home/BookingProcess.jsx";
import Fleet from "./components/home/Fleet.jsx";
import Hero from "./components/home/Hero.jsx";
import JourneyCallToAction from "./components/home/JourneyCallToAction.jsx";
import Services from "./components/home/Services.jsx";
import WhyChoose from "./components/home/WhyChoose.jsx";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";

export default function App() {
  return (
    <div className="hlt-site">
      <Header />
      <Hero />
      <WhyChoose />
      <Services />
      <Fleet />
      <BookingProcess />
      <JourneyCallToAction />
      <Footer />
    </div>
  );
}

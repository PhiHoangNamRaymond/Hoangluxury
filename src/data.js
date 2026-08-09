export const whatsappUrl =
  "https://wa.me/84839779888?text=Hello%20Hoang%20Luxury%20Travel%2C%20I%20would%20like%20to%20book%20a%20private%20transfer.";

export const catalogUrl =
  import.meta.env.VITE_CATALOG_URL ||
  "https://drive.google.com/file/d/1Z6b3reHt-M3aD4g15YoD2EYWMJmrgQhN/view?usp=drive_link";
export const catalogPageUrl = "/catalog/";

export const navLinks = [
  ["Home", "#home"],
  ["Services", "#services"],
  ["Fleet", "#fleet"],
  ["Journey", "#routes"],
  ["Catalog", catalogPageUrl],
  ["Booking", "/booking/"],
];

export const whyItems = [
  {
    icon: "driver",
    title: "Privacy & Professionalism",
    text: "Your privacy is our top priority. Our friendly and professional drivers ensure a safe, comfortable, and private journey.",
  },
  {
    icon: "car",
    title: "Customized VIP Service",
    text: "We plan a personalized itinerary, provide useful travel information and local tips for each destination, and assist with restaurant and attraction reservations.",
  },
  {
    icon: "whatsapp",
    title: "24/7 WhatsApp Support",
    text: "We're available on WhatsApp 24/7 to answer your questions and assist with any requests during your trip.",
  },
  {
    icon: "price",
    title: "Flexible Payment Methods",
    text: "We offer a variety of convenient payment options, including cash and credit cards. Currency exchange assistance is available if needed.",
  },
];

export const services = [
  {
    image: "airport",
    icon: "plane",
    title: "Airport Transfer",
    text: "Private airport transfers between the airport and your destination.",
  },
  {
    image: "sapa",
    icon: "route",
    title: "Long-Distance Private Transfer",
    text: "Private transfers between cities with direct routes, flexible departure times, no shared rides.",
  },
  {
    image: "custom",
    icon: "mountain",
    title: "Custom Private Trip",
    text: "Choose your destinations and travel on your own schedule with a private driver.",
  },
  {
    image: "haGiang",
    icon: "dots",
    title: "Business / Partner Transfer",
    text: "Private transportation for business meetings, corporate events, and VIP guests.",
  },
];

export const fleet = [
  {
    image: "limoLux",
    name: "Limo Lux",
    specs: ["6 Seats", "Comfort", "Spacious"],
  },
  {
    image: "limoGreen",
    name: "Limo Prime",
    specs: ["6 Seats", "Premium", "Executive"],
  },
  {
    image: "vf9",
    name: "VF9 Luxury",
    specs: ["6 Seats", "Electric", "Luxury SUV"],
  },
];

export const popularRoutes = [
  "Sapa",
  "Ha Long",
  "Ninh Binh",
  "Ha Giang",
  "Cat Ba",
  "Cao Bang",
  "Moc Chau",
  "Mu Cang Chai",
  "Ta Xua",
];

export const bookingRows = [
  ["Customer Name", "ALABDULLAH OTHMAN - 2 pax"],
  ["WhatsApp", "+971 501234567"],
  ["Flight", "VN1222  |  23 July 2026  |  16:30"],
  ["Route", "Noi Bai Airport - Sapa hotels"],
  ["Vehicle", "Limo Lux"],
  ["Service", "Private Transfer"],
  ["Total Price", "3.500.000 VND"],
];

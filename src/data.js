export const whatsappUrl =
  "https://wa.me/84839779888?text=Hello%20Hoang%20Luxury%20Travel%2C%20I%20would%20like%20to%20book%20a%20private%20transfer.";

export const catalogUrl = import.meta.env.VITE_CATALOG_URL || "#catalog";
export const catalogPageUrl = "/catalog/";

export const navLinks = [
  ["Home", "#home"],
  ["Services", "#services"],
  ["Fleet", "#fleet"],
  ["Catalog", catalogPageUrl],
  ["Contact", "/booking/"],
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
    text: "Reliable and punctual airport transport services ensuring a smooth and relaxing experience from start to finish.",
  },
  {
    image: "sapa",
    icon: "route",
    title: "Long-Distance Private Transfer",
    text: "Safe and comfortable city-to-city travel in premium vehicles to make your long journeys relaxing and efficient.",
  },
  {
    image: "custom",
    icon: "mountain",
    title: "Custom Private Trip",
    text: "Flexible itinerary and custom routes based on your travel plan.",
  },
  {
    image: "haGiang",
    icon: "dots",
    title: "Business / Partner Transfer",
    text: "Luxury and professional corporate transport solutions to provide a high-quality executive experience for your business partners.",
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
    name: "VinFast VF9",
    specs: ["6 Seats", "Electric", "Luxury SUV"],
  },
];

export const popularRoutes = [
  "Ha Giang",
  "Ta Xua",
  "Sa Pa",
  "Cao Bang",
  "Mu Cang Chai",
  "Moc Chau",
  "Cat Ba",
  "Ha Long",
  "Ninh Binh",
];

export const bookingRows = [
  ["Customer Name", "ALABDULLAH OTHMAN - 2 pax"],
  ["WhatsApp", "+971 501234567"],
  ["Flight", "VN1222  |  23 July 2026  |  16:30"],
  ["Route", "Noi Bai Airport - Sapa hotels"],
  ["Vehicle", "Limo Lux"],
  ["Service", "Private Transfer (Round Trip)"],
  ["Total Price", "VND 3.300.000"],
];

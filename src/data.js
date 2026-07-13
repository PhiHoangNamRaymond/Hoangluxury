export const whatsappUrl =
  "https://wa.me/84839779888?text=Hello%20Hoang%20Luxury%20Travel%2C%20I%20would%20like%20to%20book%20a%20private%20transfer.";

export const catalogUrl = import.meta.env.VITE_CATALOG_URL || "#catalog";

export const navLinks = [
  ["Home", "#home"],
  ["Services", "#services"],
  ["Fleet", "#fleet"],
  ["Catalog", catalogUrl, true],
  ["Travel Blog", "/travel-blog/"],
  ["Contact", "#contact"],
];

export const whyItems = [
  {
    icon: "driver",
    title: "Privacy & Professionalism",
    text: "Professional and courteous drivers ensuring a safe, smooth, and completely confidential journey.",
  },
  {
    icon: "car",
    title: "Customized VIP Service",
    text: "Tailored itineraries featuring a luxury 7-seater vehicle with complimentary refreshments and amenities.",
  },
  {
    icon: "whatsapp",
    title: "24/7 WhatsApp Support",
    text: "Dedicated support with prompt responses via WhatsApp to assist you whenever you need.",
  },
  {
    icon: "price",
    title: "All-Inclusive Pricing",
    text: "Transparent, fixed rates covering fuel, tolls, and parking with absolutely no hidden fees.",
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
    image: "custom",          // ✅ sửa: trước đây là "haGiang"
    icon: "mountain",
    title: "Custom Private Trip",
    text: "Flexible itinerary and custom routes based on your travel plan.",
  },
  {
    image: "haGiang",         // ✅ sửa: trước đây là "custom"
    icon: "dots",
    title: "Business / Partner Transfer",
    text: "Luxury and professional corporate transport solutions to provide a high-quality executive experience for your business partners.",
  },
];

export const fleet = [
  {
    image: "limoLux",
    name: "Limo Lux",
    specs: ["6 Seats", "Premium", "Spacious"],
  },
  {
    image: "limoGreen",
    name: "Limo Prime",
    specs: ["6 Seats", "Comfort", "Executive"],
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
  ["WhatsApp", "+971501234567"],
  ["Flight", "VN1232  |  21 July 2026  |  16:10"],
  ["Route", "Noi Bai Airport ↔ Sapa Hotel"],
  ["Vehicle", "Limo Lux"],
  ["Service", "Private Transfer (Round Trip)"],
  ["Total Price", "VND 4,615,000"],
];

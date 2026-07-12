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

export const routePins = [
  { number: "01", name: "HA GIANG", x: "41%", y: "13%" },
  { number: "02", name: "TA XUA", x: "56%", y: "27%" },
  { number: "03", name: "SA PA", x: "18%", y: "39%" },
  { number: "04", name: "CAO BANG", x: "77%", y: "34%" },
  { number: "05", name: "MU CANG CHAI", x: "13%", y: "51%" },
  { number: "06", name: "MOC CHAU", x: "11%", y: "64%" },
  { number: "07", name: "CAT BA", x: "78%", y: "71%" },
  { number: "08", name: "HA LONG", x: "83%", y: "82%" },
  { number: "09", name: "NINH BINH", x: "43%", y: "87%" },
];

export const routes = [
  ["01", "Hanoi / Noi Bai -", "Ha Giang"],
  ["02", "Hanoi / Noi Bai -", "Ta Xua"],
  ["03", "Hanoi / Noi Bai -", "Sa Pa"],
  ["04", "Hanoi / Noi Bai -", "Cao Bang"],
  ["05", "Hanoi / Noi Bai -", "Mu Cang Chai"],
  ["06", "Hanoi / Noi Bai -", "Moc Chau"],
  ["07", "Hanoi / Noi Bai -", "Cat Ba"],
  ["08", "Hanoi / Noi Bai -", "Ha Long"],
  ["09", "Hanoi / Noi Bai -", "Ninh Binh"],
];

export const benefits = [
  ["Premium Fleet", "Luxury vehicles"],
  ["Professional Drivers", "Experienced & courteous"],
  ["Safe & Reliable", "Your safety, our priority"],
  ["24/7 Support", "Always here for you"],
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

export const whatsappUrl =
  "https://wa.me/84839779888?text=Hello%20Hoang%20Luxury%20Travel%2C%20I%20would%20like%20to%20book%20a%20private%20transfer.";

export const catalogUrl = import.meta.env.VITE_CATALOG_URL || "#catalog";

export const contactFormEndpoint = import.meta.env.VITE_CONTACT_FORM_ENDPOINT || "";

export const navLinks = [
  ["Home", "#home"],
  ["Services", "#services"],
  ["Fleet", "#fleet"],
  ["Catalog", catalogUrl, true],
  ["Travel Blog", "#travel-blog"],
  ["Contact", "#contact"],
];

export const whyItems = [
  {
    icon: "shield",
    title: "Privacy & Professionalism",
    text: "Our professional and courteous drivers are dedicated to ensuring you a safe, smooth journey. We also guarantee the utmost confidentiality for your itinerary and personal information.",
  },
  {
    icon: "car",
    title: "Customized VIP Service",
    text: "To deliver a luxury VIP experience, every journey includes complimentary bottled water, refreshing cold towels, and the privacy of a spacious 7-seater vehicle with tinted windows. Best of all, your itinerary is fully customized to your preferences.",
  },
  {
    icon: "whatsapp",
    title: "24/7 WhatsApp Support",
    text: "We offer dedicated 24/7 WhatsApp support with prompt responses to assist you whenever you need.",
  },
  {
    icon: "price",
    title: "All-Inclusive Pricing",
    text: "You can enjoy complete peace of mind with transparent all-inclusive rates that already cover fuel, toll fees and parking, with absolutely no hidden fees.",
  },
];

export const blogPosts = [
  {
    image: "sapa",
    category: "Destination Guide",
    title: "Hanoi to Sapa by Private Car: A Complete Travel Guide",
    excerpt: "Plan a comfortable journey from Hanoi or Noi Bai Airport to Sapa, with practical timing, route and stop recommendations.",
  },
  {
    image: "haGiang",
    category: "Northern Vietnam",
    title: "The Best Private Transfer Routes for Exploring Ha Giang",
    excerpt: "Discover how a personalized private transfer makes the dramatic mountain roads of Ha Giang safer and more enjoyable.",
  },
  {
    image: "airport",
    category: "Airport Transfer",
    title: "What International Travelers Should Know About Noi Bai Pickups",
    excerpt: "A clear guide to meeting your driver, luggage planning and continuing smoothly from Noi Bai Airport to your destination.",
  },
];

export const services = [
  {
    image: "airport",
    icon: "plane",
    title: "Airport Transfer",
    text: "Noi Bai Airport pickup and drop-off with flexible schedule.",
  },
  {
    image: "sapa",
    icon: "mountain",
    title: "Hanoi to Sapa",
    text: "Private transfer from Hanoi or Noi Bai Airport to Sapa.",
  },
  {
    image: "haGiang",
    icon: "route",
    title: "Hanoi to Ha Giang",
    text: "Comfortable private car service for mountain routes.",
  },
  {
    image: "custom",
    icon: "dots",
    title: "Custom Private Trip",
    text: "Flexible itinerary and custom routes based on your travel plan.",
  },
];

export const fleet = [
  {
    image: "vf9",
    name: "VinFast VF9",
    specs: ["6 Seats", "Electric", "Luxury SUV"],
  },
  {
    image: "limoLux",
    name: "Limo Lux",
    specs: ["9 Seats", "Premium", "Spacious"],
  },
  {
    image: "limoGreen",
    name: "Limo Green",
    specs: ["9 Seats", "Comfort", "Eco-friendly"],
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
  ["Customer Name", "Alabdullah Othman - 2 pax"],
  ["WhatsApp", "+966508375898"],
  ["Flight", "VN123 | 21 July 2026 | 16:10"],
  ["Route", "Noi Bai Airport -> Sapa Jade Hill"],
  ["Vehicle", "VinFast VF9"],
  ["Service", "Private Transfer (Round Trip)"],
  ["Total Price", "VND 4,615,000"],
];

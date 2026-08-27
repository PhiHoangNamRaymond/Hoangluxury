export const whatsappUrl =
  "https://wa.me/84839779888?text=Hello%20Hoang%20Luxury%20Travel%2C%20I%20would%20like%20to%20book%20a%20private%20transfer.";

export const catalogUrl =
  import.meta.env.VITE_CATALOG_URL ||
  "https://drive.google.com/file/d/1Z6b3reHt-M3aD4g15YoD2EYWMJmrgQhN/view?usp=drive_link";
export const catalogPageUrl = "/catalog/";
export const feedbackPageUrl = "/feedback/";

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

export const cruisesPageUrl = "/cruises/";

// Dropdown "Journey" liệt kê tuỳ chọn xem tất cả tuyến cùng các tuyến chính và du thuyền.
const journeyRoutes = [
  ["All Popular Routes", "/journeys/"],
  ["Ha Long Bay Cruises", cruisesPageUrl],
  ...["Sapa", "Ha Giang", "Ninh Binh", "Ha Long"].map((route) => [
    `Hanoi to ${route}`,
    `/journey/${route.toLowerCase().replace(/\s+/g, "-")}/`,
  ]),
];

// Phần tử thứ ba (tuỳ chọn) là danh sách con, hiện ra khi rê chuột vào mục cha.
export const navLinks = [
  ["Home", "#home"],
  ["Services", "#services"],
  ["Fleet", "#fleet"],
  ["Journey", "/journeys/", journeyRoutes],
  ["Catalog", catalogPageUrl],
  ["Booking", "/booking/"],
  ["Feedback", feedbackPageUrl],
];

export const heroSlides = [
  {
    image: "mountainDrive",
    alt: "Private luxury SUV on a mountain pass at sunrise in Northern Vietnam",
  },
  {
    image: "fleetWedding",
    alt: "Fleet of white luxury SUVs decorated with flowers at a resort entrance",
  },
  {
    image: "convoyMountain",
    alt: "Convoy of luxury SUVs driving through a mountain village at dusk",
  },
  {
    image: "operationsCenter",
    alt: "Hoang Luxury Travel operations team supporting travellers",
  },
  {
    image: "receptionLobby",
    alt: "Hoang Luxury Travel reception lobby",
  },
];

export const whyItems = [
  {
    icon: "driver",
    title: "Privacy & Professionalism",
    text: "Discreet, courteous service with experienced professional drivers.",
  },
  {
    icon: "car",
    title: "Personalized Service",
    text: "Tailored routes and thoughtful assistance around your travel plans.",
  },
  {
    icon: "whatsapp",
    title: "24/7 WhatsApp Support",
    text: "Direct support before, during and after your journey.",
  },
  {
    icon: "price",
    title: "Flexible Payment",
    text: "Convenient payment options with clear, transparent pricing.",
  },
];

export const services = [
  {
    image: "airport",
    title: "Airport Transfer",
    text: "Private airport transfers in comfort and style.",
  },
  {
    image: "haGiang",
    title: "Private Chauffeur",
    text: "Professional chauffeurs and discreet service.",
  },
  {
    image: "sapa",
    title: "Long-Distance Transfer",
    text: "Comfortable intercity travel for extended journeys.",
  },
  {
    image: "custom",
    title: "Custom Private Trip",
    text: "Tailored journeys designed around your plans.",
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

export const bookingRows = [
  ["Customer Name", "ALABDULLAH OTHMAN - 2 pax"],
  ["WhatsApp", "+971 501234567"],
  ["Flight", "VN1222  |  23 July 2026  |  16:30"],
  ["Route", "Noi Bai Airport - Sapa hotels"],
  ["Vehicle", "Limo Lux"],
  ["Service", "Private Transfer"],
  ["Total Price", "3.500.000 VND"],
];

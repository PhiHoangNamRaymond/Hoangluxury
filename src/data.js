import { safeCatalogUrl } from "./lib/public-config.js";
import { cruisesPagePath, journeyPagePath } from "./config/journey-paths.js";
import { photoPagePath } from "./config/photo-album-list.js";
import { blogPagePath } from "./lib/blog-article.js";

/* Số WhatsApp của công ty; mọi link chat đều dựng từ đây. */
const WHATSAPP_NUMBER = "84839779888";
const whatsappLink = (message) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const whatsappUrl = whatsappLink("Hello Hoang Luxury Travel, I would like to book a private transfer.");

/* Các nút đặt chụp ảnh trên /photo/ và trang album: tin nhắn soạn sẵn nói về
   buổi chụp, không phải đặt xe. */
export const whatsappPhotoUrl = whatsappLink("Hello Hoang Luxury Travel, I would like to book a photo shoot.");

export const catalogUrl = safeCatalogUrl(import.meta.env.VITE_CATALOG_URL,
  "https://drive.google.com/file/d/14nh1z-ONGZ3I5KKwkx8__xjs08bmkd8O/view");
export const catalogPageUrl = "/catalog/";
export const feedbackPageUrl = "/feedback/";
export const aboutPageUrl = "/about-us/";
const photoPageUrl = photoPagePath;

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

// Alt ảnh minh hoạ thẻ tuyến trang chủ, cùng thứ tự với popularRoutes.
export const popularRouteArtworkAlts = [
  "Hanoi or Noi Bai Airport to Sapa private transfer",
  "Private car from Hanoi or Noi Bai Airport to Ha Long",
  "Private transfer from Hanoi or Noi Bai Airport to Ninh Binh",
  "Private car journey from Hanoi or Noi Bai Airport to Ha Giang",
  "Hanoi or Noi Bai Airport to Cat Ba private transfer",
  "Private car from Hanoi or Noi Bai Airport to Cao Bang",
  "Private transfer from Hanoi or Noi Bai Airport to Moc Chau",
  "Private car trip from Hanoi or Noi Bai Airport to Mu Cang Chai",
  "Hanoi or Noi Bai Airport to Ta Xua private transfer",
];

const cruisesPageUrl = cruisesPagePath;

export const getJourneyPageUrl = (route) => {
  const routeSlug = route.toLowerCase().replace(/\s+/g, "-");
  return journeyPagePath(routeSlug === "sa-pa" ? "sapa" : routeSlug);
};

const hanoiRoute = (route) => [`Hanoi to ${route === "Ha Long" ? "Halong" : route}`, getJourneyPageUrl(route)];

const routesOverviewUrl = "/routes/";
/* Tuyến nối tỉnh: khoá tuyến đặt theo đúng tên, ví dụ "Sapa to Ha Long" → sapa-to-ha-long. */
const cityRoute = (label) => [
  label.replace(/Ha Long/g, "Halong"),
  journeyPagePath(label.toLowerCase().replace(/\s+/g, "-")),
];

// Menu "Routes" trên header: ba cột cung đường, tiêu đề vàng dẫn sang trang
// tổng hợp, bên phải là thẻ giới thiệu du thuyền Hạ Long.
const routeColumns = [
  ["Sapa", "Ha Long", "Ninh Binh", "Ha Giang", "Cat Ba"].map(hanoiRoute),
  ["Cao Bang", "Pu Luong", "Moc Chau", "Mu Cang Chai", "Ta Xua"].map(hanoiRoute),
  [
    "Sapa to Ha Long",
    "Sapa to Ninh Binh",
    "Sapa to Ha Giang",
    "Sapa to Mu Cang Chai",
    "Ha Long to Sapa",
    "Ninh Binh to Sapa",
  ].map(cityRoute),
];

export const routesMenu = {
  title: "All Private Transfer Routes",
  titleUrl: routesOverviewUrl,
  columns: routeColumns,
  routes: routeColumns.flat(),
  cruise: {
    title: "Ha Long Bay Cruises",
    text: "Discover Ha Long Bay on scenic cruise",
    ctaLabel: "Explore",
    url: cruisesPageUrl,
  },
};

// Danh sách phẳng dùng cho panel mobile (mục đầu là trang tổng hợp cung đường).
const journeyRoutes = [
  [routesMenu.title, routesMenu.titleUrl],
  [routesMenu.cruise.title, cruisesPageUrl],
  ...routesMenu.routes,
];

// Phần tử thứ ba (tuỳ chọn) là danh sách con, hiện ra khi rê chuột vào mục cha.
export const navLinks = [
  ["Home", "#home"],
  ["Services", "#services"],
  ["Fleet", "#fleet"],
  // Bấm vào chữ "Routes" thì cuộn xuống mục Curated Journeys ở trang chủ;
  // các mục trong dropdown vẫn giữ đích riêng của chúng.
  ["Routes", "#routes", journeyRoutes],
  ["Catalog", catalogPageUrl],
  ["Booking", "/booking/"],
  ["Feedback", feedbackPageUrl],
  ["Photo", photoPageUrl],
  ["Blog", blogPagePath],
  ["About Us", aboutPageUrl],
];

export const heroSlides = [
  {
    image: "sapaDrive",
    alt: "Hoang Luxury Travel’s vehicle travels along the roads of Northern Vietnam",
    // Điện thoại chỉ thấy khoảng một phần tư bề ngang ảnh: dịch sang phải để
    // giữ đầu xe trong khung.
    mobilePosition: "88% center",
  },
  {
    image: "convoyMountain",
    alt: "Hoang Luxury Travel’s private vehicles serve international travelers on scenic routes throughout Northern Vietnam.",
  },
  {
    image: "muCangChaiConvoy",
    alt: "Hoang Luxury Travel’s fleet provides private car from hanoi to sapa",
  },
  {
    image: "operationsTeam",
    alt: "Hoang Luxury Travel team support 24/7 private transfer",
  },
  {
    image: "receptionDesk",
    alt: "Reception desk at the Hoang Luxury Travel private transfer office",
  },
];

export const whyItems = [
  {
    icon: "driver",
    title: "Privacy & Professionalism",
    text: "Your privacy is our top priority. Our friendly and professional drivers ensure a safe, comfortable, and private journey.",
  },
  {
    icon: "car",
    // Mỗi phần tử là một dòng của tiêu đề thẻ, không tự ngắt giữa dòng (WhyChoose.jsx).
    title: ["Our Fleet", "Our Responsibility"],
    text: "We own our fleet and directly manage our trained drivers, ensuring consistent service quality and handling any concerns ourselves.",
  },
  {
    icon: "whatsapp",
    title: "24/7 WhatsApp Support",
    text: "We're available on WhatsApp 24/7 to answer your questions and assist with any requests during your trip.",
  },
  {
    icon: "price",
    title: "Flexible Payment Methods",
    text: "We offer a variety of convenient payment options, including cash and credit cards. Currency exchange assistance at a bank is available if needed.",
  },
];

export const services = [
  // Thứ tự phải khớp `serviceIconImages` trong config/assets.js — icon lấy
  // theo chỉ số, không theo tên. Lưu ý key ảnh đặt tên cũ: "sapa" là ảnh
  // long-distance, "haGiang" là ảnh business.
  {
    image: "airport",
    alt: "Hoang Luxury Travel's private car service for passengers at Noi Bai International Airport",
    title: "Airport Transfer",
    text: "Private airport transfers between the airport and your destination.",
  },
  {
    image: "sapa",
    alt: "Hoang Luxury Travel’s private car on a mountain road during a long-distance transfer",
    title: "Long-Distance Private Transfer",
    text: "Private transfers between cities with direct routes, flexible departure times, no shared rides.",
  },
  {
    image: "custom",
    alt: "Hoang Luxury Travel's white private car surrounded by limestone mountains in Northern Vietnam",
    title: "Custom Private Trip",
    text: "Choose your destinations and travel on your own schedule with a private driver.",
  },
  {
    image: "haGiang",
    alt: "Hoang Luxury Travel's private car outside a modern building for business transfers",
    title: "Business / Partner Transfer",
    text: "Private transportation for business meetings, corporate events, and VIP guests.",
  },
];

export const fleet = [
  {
    image: "limoLux",
    name: "Limo Lux",
    alt: "White Limo LUX Hoang Luxury Travel private car viewed from the front and side",
    specs: ["6 Seats", "Comfort", "Spacious"],
  },
  {
    image: "limoGreen",
    name: "Limo Prime",
    alt: "Front view of the Hoang Luxury Travel white Limo Prime vehicle for private transfers",
    specs: ["6 Seats", "Premium", "Executive"],
  },
  {
    image: "vf9",
    name: "VF9 Luxury",
    alt: "White VF9 electric SUV in the Hoang Luxury Travel private car fleet",
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
  ["Total Price", "3.900.000 VND"],
];

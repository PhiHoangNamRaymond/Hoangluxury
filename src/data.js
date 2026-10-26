import { safeCatalogUrl } from "./lib/public-config.js";

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
const aboutPageUrl = "/about/";
const photoPageUrl = "/photo/";

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

const cruisesPageUrl = "/cruises/";

export const getJourneyPageUrl = (route) => {
  const routeSlug = route.toLowerCase().replace(/\s+/g, "-");
  const destinationSlug = routeSlug === "sa-pa" ? "sapa" : routeSlug;
  return `/journey/hanoi-to-${destinationSlug}-private-transfer/`;
};

const hanoiRoute = (route) => [`Hanoi to ${route}`, getJourneyPageUrl(route)];

const routesOverviewUrl = "/journeys/";
/* Tuyến nối tỉnh: slug đặt theo đúng tên tuyến, ví dụ
   /journey/sapa-to-ha-long-private-transfer/ */
const cityRoute = (label) => [
  label,
  `/journey/${label.toLowerCase().replace(/\s+/g, "-")}-private-transfer/`,
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
  ["Blog", "/blog/"],
  ["About Us", aboutPageUrl],
];

export const heroSlides = [
  {
    image: "sapaDrive",
    alt: "Black private SUV on a mountain road above the rice terraces of Sapa at sunrise",
    // Điện thoại chỉ thấy khoảng một phần tư bề ngang ảnh: dịch sang phải để
    // giữ đầu xe trong khung.
    mobilePosition: "88% center",
  },
  {
    image: "convoyMountain",
    alt: "Convoy of luxury SUVs driving through a mountain village at dusk",
  },
  {
    image: "muCangChaiConvoy",
    alt: "Private SUVs on a winding road through the golden rice terraces of Mu Cang Chai",
  },
  {
    image: "operationsTeam",
    alt: "Hoang Luxury Travel operations team supporting travellers",
  },
  {
    image: "receptionDesk",
    alt: "Hoang Luxury Travel reception desk",
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
    title: "Our Fleet. Our Responsibility",
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
    title: "Airport Transfer",
    text: "Private airport transfers between the airport and your destination.",
  },
  {
    image: "sapa",
    title: "Long-Distance Private Transfer",
    text: "Private transfers between cities with direct routes, flexible departure times, no shared rides.",
  },
  {
    image: "custom",
    title: "Custom Private Trip",
    text: "Choose your destinations and travel on your own schedule with a private driver.",
  },
  {
    image: "haGiang",
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

export const bookingRows = [
  ["Customer Name", "ALABDULLAH OTHMAN - 2 pax"],
  ["WhatsApp", "+971 501234567"],
  ["Flight", "VN1222  |  23 July 2026  |  16:30"],
  ["Route", "Noi Bai Airport - Sapa hotels"],
  ["Vehicle", "Limo Lux"],
  ["Service", "Private Transfer"],
  ["Total Price", "3.900.000 VND"],
];

// Dữ liệu cho các trang tuyến (/journey/<slug>/).
//
// QUAN TRỌNG: `price` và khối `stats` là số liệu kinh doanh thật sẽ hiển thị
// công khai. Chỉ tuyến Sapa đang lấy theo bản thiết kế bạn gửi; ba tuyến còn
// lại để `price: null` nên trang sẽ hiện "On request" thay vì bịa ra một con
// số. Điền giá thật vào đây khi có.

const sharedStats = {
  rating: "4.9 / 5",
  ratingNote: "Based on 200+ verified reviews from international travelers.",
  countries: "20+",
  support: "24/7",
};

export const journeyFeatures = [
  ["seat", "Privacy & Comfort", "Enjoy a private, quiet space designed for your relaxation and peace of mind."],
  ["calendar", "Flexible Schedule", "Depart anytime that suits your plans with door-to-door convenience."],
  ["driver", "Professional Drivers", "Experienced, courteous, and knowledgeable drivers ensure a safe and smooth journey."],
  ["price", "Transparent Pricing", "Clear, upfront rates with no hidden fees or surprises."],
];

// Cả ba xe đều 6 chỗ, khớp với `fleet` ở src/data.js dùng cho trang chủ.
export const journeyVehicles = [
  { image: "limoLux", name: "Limo Lux", passengers: "6 Passengers", luggage: "3 Luggage" },
  { image: "limoGreen", name: "Limo Prime", passengers: "6 Passengers", luggage: "4 Luggage" },
  { image: "vf9", name: "VF9 Luxury", passengers: "6 Passengers", luggage: "4 Luggage" },
];

export const journeyIncluded = [
  ["car", "Private door-to-door transfer"],
  ["driver", "Experienced professional driver"],
  ["road", "Toll fees, parking, and fuel"],
  ["sparkle", "Clean, comfortable vehicle"],
  ["water", "Bottled water"],
  ["headset", "24/7 customer support"],
];

export const journeyFaq = [
  ["Can I stop along the way?", "Yes. Let your driver know and we can arrange stops for photos, coffee, or a short rest. Longer detours may affect the fare, and we will confirm any change with you first."],
  ["What if my flight is delayed?", "Share your flight number when booking and we track it. Your driver waits at no extra cost for delays within a reasonable window."],
  ["How do I pay for the transfer?", "You can pay the driver in cash (VND or major currencies) or by credit card. We confirm the full amount with you before the journey begins."],
  ["Is the price per car or per person?", "Per car. The vehicle is reserved privately for your group, so the fare does not change with the number of passengers up to the vehicle capacity."],
];

export const journeyExperience = [
  ["route", "Scenic Route", "Breathtaking views along the Northwest Highlands."],
  ["seat", "Comfortable Ride", "Spacious, quiet, and smooth journey all the way."],
  ["camera", "Flexible Stops", "Optional stops for coffee, views, or local experiences."],
  ["smile", "Relax & Enjoy", "Sit back, unwind, and enjoy the journey stress-free."],
];

export const journeys = {
  sapa: {
    name: "Sapa",
    titleAccent: "to Sapa",
    intro:
      "Premium private transfer between Hanoi and Sapa. Door-to-door service with professional drivers, ensuring comfort, safety, and peace of mind.",
    leadIn:
      "Enjoy a seamless, private journey from Hanoi or Noi Bai International Airport to Sapa, with comfort, safety, and peace of mind every step of the way.",
    routeLabel: "Hanoi ↔ Sapa",
    distance: "approx. 320 km",
    duration: "5.5 - 6.5 hours",
    durationNote: "approx.",
    price: "From 3,300,000 VND",
    dropoffNote: "Hotels, Resorts or Town Center",
    badgeIcon: "mountain",
    stats: { ...sharedStats, transfers: "800+", transfersLabel: "Sapa Transfers" },
  },
  "ha-giang": {
    name: "Ha Giang",
    titleAccent: "to Ha Giang",
    intro:
      "Premium private transfer between Hanoi and Ha Giang. Door-to-door service with professional drivers, ensuring comfort, safety, and peace of mind.",
    leadIn:
      "Enjoy a seamless, private journey from Hanoi or Noi Bai International Airport to Ha Giang, with comfort, safety, and peace of mind every step of the way.",
    routeLabel: "Hanoi ↔ Ha Giang",
    distance: "approx. 300 km",
    duration: "6 - 7 hours",
    durationNote: "approx.",
    price: null,
    dropoffNote: "Hotels, Homestays or City Center",
    badgeIcon: "mountain",
    stats: { ...sharedStats, transfers: null, transfersLabel: "Ha Giang Transfers" },
  },
  "ninh-binh": {
    name: "Ninh Binh",
    titleAccent: "to Ninh Binh",
    intro:
      "Premium private transfer between Hanoi and Ninh Binh. Door-to-door service with professional drivers, ensuring comfort, safety, and peace of mind.",
    leadIn:
      "Enjoy a seamless, private journey from Hanoi or Noi Bai International Airport to Ninh Binh, with comfort, safety, and peace of mind every step of the way.",
    routeLabel: "Hanoi ↔ Ninh Binh",
    distance: "approx. 95 km",
    duration: "1.5 - 2 hours",
    durationNote: "approx.",
    price: null,
    dropoffNote: "Hotels, Resorts or Tam Coc area",
    badgeIcon: "mountain",
    stats: { ...sharedStats, transfers: null, transfersLabel: "Ninh Binh Transfers" },
  },
  "ha-long": {
    name: "Ha Long",
    titleAccent: "to Ha Long",
    intro:
      "Premium private transfer between Hanoi and Ha Long. Door-to-door service with professional drivers, ensuring comfort, safety, and peace of mind.",
    leadIn:
      "Enjoy a seamless, private journey from Hanoi or Noi Bai International Airport to Ha Long, with comfort, safety, and peace of mind every step of the way.",
    routeLabel: "Hanoi ↔ Ha Long",
    distance: "approx. 165 km",
    duration: "2.5 - 3 hours",
    durationNote: "approx.",
    price: null,
    dropoffNote: "Hotels, Resorts or Cruise Harbour",
    badgeIcon: "bay",
    stats: { ...sharedStats, transfers: null, transfersLabel: "Ha Long Transfers" },
  },
};

export const journeySlugs = Object.keys(journeys);

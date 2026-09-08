// Dữ liệu cho các trang tuyến (/journey/<slug>/).
//
// QUAN TRỌNG: `price` và khối `stats` là số liệu kinh doanh thật sẽ hiển thị
// công khai. Chỉ tuyến Sapa đang lấy theo bản thiết kế bạn gửi; ba tuyến còn
// lại để `price: null` nên trang sẽ hiện "On request" thay vì bịa ra một con
// số. Điền giá thật vào đây khi có.

const sharedStats = {
  rating: "4.9 / 5",
  // Số dùng chung cho mọi tuyến để bảng luôn đủ 4 cột. Tuyến nào có số
  // riêng thì ghi đè bên dưới.
  transfers: "800+",
  transfersLabel: "Transfers Completed",
  ratingNote: "Based on 200+ verified reviews from international travelers.",
  countries: "20+",
  support: "24/7",
};

export const journeyFeatures = [
  ["seat", "Privacy & Comfort", "Enjoy your trip in a private cabin with space to relax and peace of mind."],
  ["calendar", "Flexible Schedule", "Depart anytime that suits you. We are available on your preferred time."],
  ["driver", "Professional Drivers", "Experienced, courteous, and knowledgeable drivers ensure a safe and smooth journey."],
  ["price", "Transparent Pricing", "Clear, upfront rates with no hidden fees or surprises."],
];

export const journeyVehicles = [
  { image: "limoLux", name: "LIMO LUX", passengers: "1 – 4 Passengers", luggage: "2 Luggage" },
  { image: "limoGreen", name: "LIMO PRIME", passengers: "1 – 6 Passengers", luggage: "4 Luggage" },
  { image: "vf9", name: "VIP LUXURY", passengers: "1 – 6 Passengers", luggage: "4 Luggage" },
];

export const journeyIncluded = [
  ["carFront", "Private Car"],
  ["driver", "Experienced Driver"],
  ["waterBottle", "Bottled Water"],
  ["wifi", "Wi-Fi Onboard"],
  ["parking", "Tolls & Parking"],
  ["headset", "24/7 Support"],
];

export const journeyFaq = [
  [
    "How long does the transfer take?",
    "Travel time varies depending on the route, departure time, and traffic conditions. We prioritize modern high-speed expressways wherever available to guarantee a smooth and punctual journey.",
  ],
  [
    "Can we stop along the way?",
    "Yes. Let your driver know and we can arrange stops for photos, coffee, or a short rest. Longer detours may affect the fare, and we will confirm any change with you first.",
  ],
  [
    "Is the price all-inclusive?",
    "Yes. Our private transfer fares are fully transparent and inclusive of the private vehicle, chauffeur service, toll fees, parking, fuel, and bottled water with zero hidden surcharges.",
  ],
  [
    "What vehicles are available?",
    "We provide top-tier luxury vehicles including Limo Lux (1–4 passengers), Limo Prime (1–6 passengers), and VIP Luxury SUV (VinFast VF9, 1–6 passengers) with generous luggage capacity.",
  ],
  [
    "What if our flight is delayed?",
    "Share your flight number when booking and our dispatch team will monitor your flight in real-time. Your chauffeur will wait at the arrival terminal at no extra charge.",
  ],
  [
    "How do I book?",
    "You can book immediately by messaging us on WhatsApp for rapid confirmation, or submit our online availability request form. Our concierge team is available 24/7 to assist.",
  ],
];

export const journeyExperience = [
  ["seat", "COMFORTABLE RIDE", "Spacious, quiet, and smooth journey."],
  ["smile", "RELAX & ENJOY", "Sit back, unwind, and enjoy the journey stress-free."],
  ["route", "SCENIC ROUTE", "Breathtaking views along the coast and limestone bay."],
  ["camera", "FLEXIBLE STOPS", "Stop for photos, coffee, or local experiences."],
];

export const journeys = {
  sapa: {
    name: "Sapa",
    titleAccent: "TO SAPA",
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
    titleAccent: "TO HA GIANG",
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
    stats: { ...sharedStats, transfersLabel: "Ha Giang Transfers" },
  },
  "ninh-binh": {
    name: "Ninh Binh",
    titleAccent: "TO NINH BINH",
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
    stats: { ...sharedStats, transfersLabel: "Ninh Binh Transfers" },
  },
  "ha-long": {
    name: "Ha Long",
    titleAccent: "TO HA LONG",
    intro:
      "Premium private transfer between Hanoi and Ha Long. Door-to-door service with professional drivers, ensuring comfort, safety, and peace of mind.",
    leadIn:
      "Enjoy a seamless, private journey from Hanoi to Ha Long International Airport or Ha Long with comfort, safety, and peace of mind at every step of the way.",
    routeLabel: "Hanoi ↔ Ha Long",
    distance: "approx. 170 km",
    duration: "2.5 - 3 hours",
    durationNote: "approx.",
    price: "From 2,000,000 VND",
    dropoffNote: "Hotels, Resorts or Town Center",
    badgeIcon: "bay",
    stats: { ...sharedStats, transfers: "800+", transfersLabel: "Ha Long Transfers" },
  },
  "cat-ba": {
    name: "Cat Ba",
    titleAccent: "TO CAT BA",
    intro:
      "Premium private transfer between Hanoi and Cat Ba Island. Door-to-door service with professional drivers, ensuring comfort, safety, and peace of mind.",
    leadIn:
      "Enjoy a seamless, private journey from Hanoi or Noi Bai International Airport to Cat Ba Island, with comfort, safety, and peace of mind every step of the way.",
    routeLabel: "Hanoi ↔ Cat Ba",
    distance: "approx. 160 km",
    duration: "3.5 - 4.0 hours",
    durationNote: "approx.",
    price: null,
    dropoffNote: "Hotels, Resorts or Town Center",
    badgeIcon: "bay",
    stats: { ...sharedStats, transfersLabel: "Cat Ba Transfers" },
  },
  "cao-bang": {
    name: "Cao Bang",
    titleAccent: "TO CAO BANG",
    intro:
      "Premium private transfer between Hanoi and Cao Bang. Door-to-door service with professional drivers, ensuring comfort, safety, and peace of mind.",
    leadIn:
      "Enjoy a seamless, private journey from Hanoi or Noi Bai International Airport to Cao Bang, with comfort, safety, and peace of mind every step of the way.",
    routeLabel: "Hanoi ↔ Cao Bang",
    distance: "approx. 280 km",
    duration: "6.0 - 7.0 hours",
    durationNote: "approx.",
    price: null,
    dropoffNote: "Hotels, Homestays or Ban Gioc Area",
    badgeIcon: "mountain",
    stats: { ...sharedStats, transfersLabel: "Cao Bang Transfers" },
  },
  "mu-cang-chai": {
    name: "Mu Cang Chai",
    titleAccent: "TO MU CANG CHAI",
    intro:
      "Premium private transfer between Hanoi and Mu Cang Chai. Door-to-door service with professional drivers, ensuring comfort, safety, and peace of mind.",
    leadIn:
      "Enjoy a seamless, private journey from Hanoi or Noi Bai International Airport to Mu Cang Chai, with comfort, safety, and peace of mind every step of the way.",
    routeLabel: "Hanoi ↔ Mu Cang Chai",
    distance: "approx. 300 km",
    duration: "6.5 - 7.5 hours",
    durationNote: "approx.",
    price: null,
    dropoffNote: "Hotels, Resorts or Terraced Valleys",
    badgeIcon: "mountain",
    stats: { ...sharedStats, transfersLabel: "Mu Cang Chai Transfers" },
  },
  "moc-chau": {
    name: "Moc Chau",
    titleAccent: "TO MOC CHAU",
    intro:
      "Premium private transfer between Hanoi and Moc Chau. Door-to-door service with professional drivers, ensuring comfort, safety, and peace of mind.",
    leadIn:
      "Enjoy a seamless, private journey from Hanoi or Noi Bai International Airport to Moc Chau, with comfort, safety, and peace of mind every step of the way.",
    routeLabel: "Hanoi ↔ Moc Chau",
    distance: "approx. 200 km",
    duration: "4.0 - 4.5 hours",
    durationNote: "approx.",
    price: null,
    dropoffNote: "Hotels, Resorts or Farmstay Areas",
    badgeIcon: "mountain",
    stats: { ...sharedStats, transfersLabel: "Moc Chau Transfers" },
  },
  "ta-xua": {
    name: "Ta Xua",
    titleAccent: "TO TA XUA",
    intro:
      "Premium private transfer between Hanoi and Ta Xua. Door-to-door service with professional drivers, ensuring comfort, safety, and peace of mind.",
    leadIn:
      "Enjoy a seamless, private journey from Hanoi or Noi Bai International Airport to Ta Xua, with comfort, safety, and peace of mind every step of the way.",
    routeLabel: "Hanoi ↔ Ta Xua",
    distance: "approx. 220 km",
    duration: "4.5 - 5.5 hours",
    durationNote: "approx.",
    price: null,
    dropoffNote: "Hotels, Homestays or Town Center",
    badgeIcon: "mountain",
    stats: { ...sharedStats, transfersLabel: "Ta Xua Transfers" },
  },
};

// Dữ liệu cho các trang tuyến (/journey/<slug>/).
//
// QUAN TRỌNG: journeyExperienceStats là số liệu kinh doanh thật, hiển thị công
// khai và dùng chung cho mọi tuyến (lấy theo bản thiết kế khách gửi).
// `price` hiện không hiển thị trên trang (cột Rates dẫn tới Catalog) nhưng giữ
// lại để dùng khi cần; tuyến chưa có giá để `null`.

// Section Journey Experience: 4 thẻ ảnh (ảnh ghép trong JourneyPage.jsx).
export const journeyExperience = [
  ["Comfortable Ride", "Spacious, quiet, and smooth journey."],
  ["Personal Meet & Greet", "Your driver welcomes you at the airport with a blank name board."],
  ["Luggage Assistance", "Your driver helps with loading and unloading."],
  ["Flexible Stops", "Stop for photos, coffee, or local experiences."],
];

// Dải số liệu dưới 4 thẻ Journey Experience. Icon là LineIcon.
export const journeyExperienceStats = [
  ["star", "4.9/5", "Guest Rating"],
  ["chauffeur", "8+ Years", "Driver Experience"],
  ["globe", "20+", "Countries Served"],
  ["headset", "24/7", "Customer Support"],
];

// Dải 4 điểm mạnh dưới hai thẻ đón / trả (theo ảnh mẫu). Icon là LineIcon.
export const journeyFeatures = [
  ["shield", "100% Private", "Your vehicle is reserved exclusively for you."],
  ["chauffeur", "Professional Drivers", "Experienced, courteous and safety-focused."],
  ["calendar", "Flexible Departure", "Depart at a time that suits your journey."],
  ["clock", "On-Time Pick-up", "Pick-up time confirmed before departure."],
];

// Chỉ lưu con số; nhãn "Passengers" / "Luggage" nằm ở dòng dưới trong JSX (theo mẫu).
export const journeyVehicles = [
  { image: "limoLux", name: "LIMO LUX", passengers: "1 – 4", luggage: "2" },
  { image: "limoGreen", name: "LIMO PRIME", passengers: "1 – 6", luggage: "4" },
  { image: "vf9", name: "VIP LUXURY", passengers: "1 – 6", luggage: "4" },
];

// Dải "Service Highlights" (theo mẫu). Icon là LineIcon.
export const journeyHighlights = [
  ["thumbsUp", "Polite & Reliable"],
  ["car", "Vehicle Confirmed"],
  ["noPickup", "No Extra Pick-Ups"],
  ["bottle", "Bottled Water"],
  ["music", "Music on Request"],
  ["tagPlus", "All-Inclusive Pricing"],
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
  },
};

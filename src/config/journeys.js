// Dữ liệu cho các trang tuyến (/journey/<slug>/).
//
// QUAN TRỌNG: journeyExperienceStats là số liệu kinh doanh thật, hiển thị công
// khai và dùng chung cho mọi tuyến (lấy theo bản thiết kế khách gửi).
// `price` hiện không hiển thị trên trang (cột Rates dẫn tới Catalog) nhưng giữ
// lại để dùng khi cần; tuyến chưa có giá để `null`.

// Section Journey Experience: 4 thẻ ảnh (ảnh ghép trong JourneyPage.jsx).
export const journeyExperience = [
  ["Smooth & Comfortable", "Nappa leather seats, spacious comfort, less motion sickness."],
  ["Personal Meet & Greet", "Your driver welcomes you at the airport with a clear name board."],
  ["Luggage Assistance", "Your driver helps load and arrange your luggage."],
  ["Flexible Stops", "Stop whenever you need. Coffee - Restroom - Photos"],
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

// Dải "Service Highlights" (theo mẫu). Icon là LineIcon.
export const journeyHighlights = [
  ["thumbsUp", "Polite & Reliable"],
  ["car", "Clean & Brand-new"],
  ["noPickup", "No Extra Pick-Ups"],
  ["bottle", "Bottled Water"],
  ["music", "Music on Request"],
  ["tagPlus", "All-Inclusive Pricing"],
];

export const journeyFaq = [
  [
    "How can I book and confirm my booking?",
    "You can book your private car with a driver through Hoang Luxury Travel in two simple ways: message us directly via WhatsApp for quick assistance and booking support, or click Booking and fill in your trip details. After receiving your request, our team will contact you to discuss your itinerary, confirm the details, and complete your private transfer booking. Your detailed trip information will be sent in a Booking Confirmation 48 hours before departure. Please review the details, then relax and enjoy your journey.",
  ],
  [
    "Is the price all-inclusive? Are there any hidden fees?",
    "Yes, the quoted price includes everything in your agreed itinerary. Pricing depends on your route and specific needs. Our prices are transparent, with no hidden fees. If you request additional services outside the agreed itinerary, we’ll explain any extra charges in advance and only apply them with your approval.",
  ],
  [
    "Will I be charged extra if my pickup time changes or my flight is delayed?",
    "No. If your pickup time changes or your flight is delayed, we will adjust your pickup accordingly, and your driver will wait at no extra charge. Just let us know as soon as possible so our team can make the arrangements.",
  ],
  [
    "There are 5 of us with 6 large suitcases. Will there be enough space in the car?",
    "Don’t worry. If you need more space, we’ll arrange a private car for your luggage so everyone can sit comfortably throughout the journey. Just let us know in advance how many people are travelling, along with the number and size of your suitcases, so we can have everything ready for you.",
  ],
  [
    "Can we make flexible stops along the way?",
    "Yes, of course. During your private transfer, you can stop along the way for a restroom break, coffee, sightseeing, or photos. We are happy to make flexible stops whenever possible, as long as the location is safe and legally permitted for stopping or parking.",
  ],
  [
    "Do I need to pay a deposit? What payment methods do you accept?",
    "You don’t need to pay anything before your trip. After you arrive at your destination, you can pay 100% of the total amount directly to your driver. We offer flexible payment options, including cash and card payments. If you choose to pay by card, a 3% processing fee applies for international card payments.",
  ],
  [
    "Can you plan a personalized itinerary? How many hours are included in your full-day local car service?",
    "Yes. We can help plan a personalized itinerary around your schedule and travel preferences, with useful local tips. If needed, we can also assist with restaurant and attraction reservations. If you already have your own itinerary, we are happy to review it free of charge and advise you on routes, travel times, traffic conditions, and whether your travel plan is practical in Vietnam. For our local service, there is no fixed hourly limit. Your private driver will be with you from early morning until late evening, taking you wherever you’d like to go, as long as the places you wish to visit are accessible by car.",
  ],
  [
    "Do your drivers speak English?",
    "Our professional drivers can communicate in basic English. If you need any additional help during your private transfer, you can contact us anytime via WhatsApp. Our English-speaking support team is available 24/7 to assist you throughout your journey.",
  ],
];

const privateTransferPage = (destination, travelTime) => ({
  seoTitle: `Hanoi to ${destination} Private Transfer | HOANG LUXURY TRAVEL`,
  metaDescription:
    `Book a Hanoi to ${destination} private transfer with a professional driver. Enjoy a private car, door-to-door pickup, flexible stops, transparent pricing and 24/7 WhatsApp support`,
  eyebrow: "Private Transfer",
  intro:
    `Hoang Luxury Travel provides private transfers from Hanoi/Noi Bai Airport to ${destination} for international travelers who prefer privacy, comfort and safety.`,
  secondaryActionLabel: "View Catalog",
  secondaryActionHref: "/catalog/",
  transitTitle: "Your Time. Your Space. Your Journey.",
  transitLeadLines: [
    `Private car from Hanoi or Noi Bai Airport to ${destination}.`,
    "Door-to-door with your own driver and a journey designed around you.",
  ],
  features: [
    ["shield", "100% Private", "No shared passengers and no multiple pick-ups."],
    ["chauffeur", "Professional Drivers", "Experienced, courteous and safety-focused."],
    ["calendar", "Flexible Departure", "Depart at a time that suits your journey."],
    ["clock", "Pick-up On Time", "Your driver will arrive 15 minutes early."],
  ],
  heroFacts: {
    route: [`Hanoi / Noi Bai Airport ↔ ${destination}`, "Available in both directions"],
    time: [`Approx. ${travelTime}`, "Depending on traffic"],
    vehicle: ["Limo Lux", "Clean & Spacious"],
    rates: ["Transparent All-Inclusive Pricing", "Cash & Card"],
  },
});

/* Tuyến nối tỉnh (không xuất phát từ Hà Nội). Cùng bố cục trang với tuyến
   Hanoi to…, chỉ đổi điểm đón. */
const cityTransferPage = (origin, destination, travelTime) => ({
  seoTitle: `${origin} to ${destination} Private Transfer | HOANG LUXURY TRAVEL`,
  metaDescription:
    `Book a ${origin} to ${destination} private transfer with a professional driver. Private car, door-to-door pickup, flexible stops, transparent pricing and 24/7 WhatsApp support`,
  eyebrow: "Private Transfer",
  intro:
    `Hoang Luxury Travel provides private transfers from ${origin} to ${destination} for international travelers who prefer privacy, comfort and safety.`,
  secondaryActionLabel: "View Catalog",
  secondaryActionHref: "/catalog/",
  transitTitle: "Your Time. Your Space. Your Journey.",
  transitLeadLines: [
    `Private car from ${origin} to ${destination}.`,
    "Door-to-door with your own driver and a journey designed around you.",
  ],
  features: [
    ["shield", "100% Private", "No shared passengers and no multiple pick-ups."],
    ["chauffeur", "Professional Drivers", "Experienced, courteous and safety-focused."],
    ["calendar", "Flexible Departure", "Depart at a time that suits your journey."],
    ["clock", "Pick-up On Time", "Your driver will arrive 15 minutes early."],
  ],
  heroFacts: {
    route: [`${origin} ↔ ${destination}`, "Available in both directions"],
    time: [`Approx. ${travelTime}`, "Depending on traffic"],
    vehicle: ["Limo Lux", "Clean & Spacious"],
    rates: ["Transparent All-Inclusive Pricing", "Cash & Card"],
  },
  leadIn:
    `Enjoy a seamless, private journey from ${origin} to ${destination}, with comfort, safety, and peace of mind every step of the way.`,
  routeLabel: `${origin} ↔ ${destination}`,
  durationNote: "approx.",
  price: null,
});

const sapaJourney = {
  name: "Sapa",
  titleAccent: "TO SAPA",
  ...privateTransferPage("Sapa", "5 – 5.5 hours"),
  leadIn:
    "Enjoy a seamless, private journey from Hanoi or Noi Bai International Airport to Sapa, with comfort, safety, and peace of mind every step of the way.",
  routeLabel: "Hanoi ↔ Sapa",
  distance: "approx. 320 km",
  duration: "5.5 - 6.5 hours",
  durationNote: "approx.",
  price: "From 3,300,000 VND",
  dropoffNote: "Hotels, Resorts or Town Center",
  badgeIcon: "mountain",
};

export const journeys = {
  // Giữ URL cũ hoạt động cho các liên kết đã được chia sẻ trước đây.
  sapa: sapaJourney,
  "ha-giang": {
    name: "Ha Giang",
    titleAccent: "TO HA GIANG",
    ...privateTransferPage("Ha Giang", "6 – 7 hours"),
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
    ...privateTransferPage("Ninh Binh", "1.5 – 2 hours"),
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
    ...privateTransferPage("Ha Long", "2.5 – 3 hours"),
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
    ...privateTransferPage("Cat Ba", "3.5 – 4 hours"),
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
    ...privateTransferPage("Cao Bang", "6 – 7 hours"),
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
    ...privateTransferPage("Mu Cang Chai", "6.5 – 7.5 hours"),
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
    ...privateTransferPage("Moc Chau", "4 – 4.5 hours"),
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
    ...privateTransferPage("Ta Xua", "4.5 – 5.5 hours"),
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
  /* ----- Tuyến mới: Pu Luong và các tuyến nối tỉnh -----
     Quãng đường và thời gian là số ước lượng, cần khách xác nhận lại theo
     lịch chạy thực tế trước khi công bố. */
  "pu-luong": {
    name: "Pu Luong",
    titleAccent: "TO PU LUONG",
    ...privateTransferPage("Pu Luong", "3.5 – 4 hours"),
    leadIn:
      "Enjoy a seamless, private journey from Hanoi or Noi Bai International Airport to Pu Luong, with comfort, safety, and peace of mind every step of the way.",
    routeLabel: "Hanoi ↔ Pu Luong",
    distance: "approx. 160 km",
    duration: "3.5 - 4.0 hours",
    durationNote: "approx.",
    price: null,
    dropoffNote: "Hotels, Resorts or Homestay Valleys",
    badgeIcon: "mountain",
  },
  "sapa-to-ha-long": {
    name: "Ha Long",
    titleAccent: "TO HA LONG",
    titlePrefix: "Sapa",
    ...cityTransferPage("Sapa", "Ha Long", "8.5 – 9.5 hours"),
    originLabel: "Sapa",
    originShort: "Sapa",
    originNote: "Hotels, Resorts or Town Center",
    originIconSlug: "sapa",
    distance: "approx. 500 km",
    duration: "8.5 - 9.5 hours",
    dropoffNote: "Hotels, Resorts or Cruise Harbour",
    badgeIcon: "bay",
  },
  "sapa-to-ninh-binh": {
    name: "Ninh Binh",
    titleAccent: "TO NINH BINH",
    titlePrefix: "Sapa",
    ...cityTransferPage("Sapa", "Ninh Binh", "7 – 8 hours"),
    originLabel: "Sapa",
    originShort: "Sapa",
    originNote: "Hotels, Resorts or Town Center",
    originIconSlug: "sapa",
    distance: "approx. 420 km",
    duration: "7.0 - 8.0 hours",
    dropoffNote: "Hotels, Resorts or Tam Coc area",
    badgeIcon: "mountain",
  },
  "sapa-to-ha-giang": {
    name: "Ha Giang",
    titleAccent: "TO HA GIANG",
    titlePrefix: "Sapa",
    ...cityTransferPage("Sapa", "Ha Giang", "6.5 – 7.5 hours"),
    originLabel: "Sapa",
    originShort: "Sapa",
    originNote: "Hotels, Resorts or Town Center",
    originIconSlug: "sapa",
    distance: "approx. 270 km",
    duration: "6.5 - 7.5 hours",
    dropoffNote: "Hotels, Homestays or City Center",
    badgeIcon: "mountain",
  },
  "sapa-to-mu-cang-chai": {
    name: "Mu Cang Chai",
    titleAccent: "TO MU CANG CHAI",
    titlePrefix: "Sapa",
    ...cityTransferPage("Sapa", "Mu Cang Chai", "4.5 – 5.5 hours"),
    originLabel: "Sapa",
    originShort: "Sapa",
    originNote: "Hotels, Resorts or Town Center",
    originIconSlug: "sapa",
    distance: "approx. 180 km",
    duration: "4.5 - 5.5 hours",
    dropoffNote: "Hotels, Resorts or Terraced Valleys",
    badgeIcon: "mountain",
  },
  "ha-long-to-sapa": {
    name: "Sapa",
    titleAccent: "TO SAPA",
    titlePrefix: "Ha Long",
    ...cityTransferPage("Ha Long", "Sapa", "8.5 – 9.5 hours"),
    originLabel: "Ha Long",
    originShort: "Ha Long",
    originNote: "Hotels, Resorts or Cruise Harbour",
    originIconSlug: "ha-long",
    distance: "approx. 500 km",
    duration: "8.5 - 9.5 hours",
    dropoffNote: "Hotels, Resorts or Town Center",
    badgeIcon: "mountain",
  },
  "ninh-binh-to-sapa": {
    name: "Sapa",
    titleAccent: "TO SAPA",
    titlePrefix: "Ninh Binh",
    ...cityTransferPage("Ninh Binh", "Sapa", "7 – 8 hours"),
    originLabel: "Ninh Binh",
    originShort: "Ninh Binh",
    originNote: "Hotels, Resorts or Tam Coc area",
    originIconSlug: "ninh-binh",
    distance: "approx. 420 km",
    duration: "7.0 - 8.0 hours",
    dropoffNote: "Hotels, Resorts or Town Center",
    badgeIcon: "mountain",
  },
};

export const cruiseTiers = ["Luxury", "Deluxe", "Standard"];

export const cruiseCollection = [
  {
    bay: "Ha Long Bay",
    tiers: {
      Luxury: ["Grand Pioneers Cruise", "Victorious Cruise", "Paradise Legacy"],
      Deluxe: ["Dolphin Cruise", "Ambassador Cruise", "Catherine Cruises", "Sea Stars Cruises"],
      Standard: ["Athena Premium Cruise", "Luna Ha Long Cruise", "Calista Cruise", "Seaoctopus Cruises"],
    },
  },
  {
    bay: "Lan Ha Bay",
    tiers: {
      Luxury: ["Stellar of the Seas Cruise", "Paradise Grand", "Elite of the Seas", "Ambassador Cruise Signature"],
      Deluxe: ["Lyra Grandeur Cruise", "Celina of the Sea", "Indochine Cruise"],
      Standard: ["Diana Cruises"],
    },
  },
];

export const cruiseCollectionEntries = cruiseCollection.flatMap(({ bay, tiers }) =>
  cruiseTiers.flatMap((tier) => tiers[tier].map((name) => ({ bay, tier, name }))),
);

/* Mô tả (khách gửi 23/11/2026) + 3 tiện ích (theo thiết kế) trên thẻ du thuyền.
   amenities không bắt buộc: thẻ không có thì bỏ hàng tiện ích.
   Mã icon: dining, spa, kayak, activities, sightseeing, scenic. */
export const cruiseHighlights = {
  "Grand Pioneers Cruise": {
    photo: "private-car-grand-pioneers-luxury-cruise-halong-bay",
    photoAlt: "Grand Pioneers luxury cruise with an outdoor pool sailing through Halong Bay",
    description: "Experience a modern 5-star cruise in Halong Bay, featuring a saltwater infinity pool and premium spa services.",
    amenities: [["dining", "Fine Dining"], ["spa", "Spa & Wellness"], ["kayak", "Kayak"]],
  },
  "Victorious Cruise": {
    photo: "victorious-luxury-cruise-halong-bay-private-transfer",
    photoAlt: "Victorious luxury cruise sailing among the scenic limestone islands of Halong Bay",
    description: "Discover the beauty of Halong Bay aboard a luxury cruise with a Sky Bar, a swimming pool and a variety of activities.",
    amenities: [["dining", "Fine Dining"], ["activities", "Activities"], ["sightseeing", "Sightseeing"]],
  },
  "Paradise Legacy": {
    photo: "paradise-legacy-luxury-cruise-halong-bay-hoang-luxury-travel",
    photoAlt: "Paradise Legacy luxury cruise sailing through the turquoise waters of Halong Bay",
    description: "A luxury cruise that combines the cultural charm of Northern Vietnam with elegant design, fine dining and a piano bar.",
    amenities: [["dining", "Fine Dining"], ["scenic", "Scenic Views"], ["kayak", "Kayak"]],
  },
  "Dolphin Cruise": {
    photo: "hoang-luxury-travel-dolphin-cruise-halong-bay",
    photoAlt: "Dolphin cruise sailing through the turquoise waters of Halong Bay",
    description: "This modern entertainment cruise in Halong Bay combines a year-round swimming pool, a domed stage and unique dining experiences.",
    amenities: [["dining", "Dining"], ["activities", "Domed Stage"], ["scenic", "Pool"]],
  },
  "Ambassador Cruise": {
    photo: "ambassador-deluxe-cruise-halong-bay-hoang-luxury-travel",
    photoAlt: "Ambassador cruise surrounded by scenic limestone islands in Halong Bay",
    description: "Admire the beauty of Halong Bay from a spacious observation deck, relax in an outdoor Jacuzzi, and experience fine dining aboard this luxury cruise.",
    amenities: [["dining", "Fine Dining"], ["spa", "Jacuzzi"], ["sightseeing", "View Deck"]],
  },
  "Catherine Cruises": {
    photo: "private-car-catherine-cruise-halong-bay-hoang-luxury-travel",
    photoAlt: "Catherine cruise featuring elegant white decks on the waters of Halong Bay",
    description: "An Indochine-style cruise with a year-round infinity pool, a mini golf course and relaxing spa services.",
    amenities: [["scenic", "Infinity Pool"], ["activities", "Mini Golf"], ["spa", "Spa"]],
  },
  "Sea Stars Cruises": {
    photo: "sea-stars-deluxe-cruise-halong-bay-private-transfer",
    photoAlt: "Sea Stars deluxe cruise sailing among the limestone islands of Halong Bay",
    description: "On this premium leisure cruise, guests can relax by the swimming pool, play mini golf, and dine at a restaurant with panoramic views of Halong Bay.",
    amenities: [["dining", "Dining"], ["scenic", "Pool"], ["activities", "Mini Golf"]],
  },
  "Athena Premium Cruise": {
    photo: "athena-premium-cruise-private-transfer-halong-bay",
    photoAlt: "Athena Premium cruise sailing through the turquoise waters of Halong Bay surrounded by limestone islands",
    description: "Relax by a year-round infinity pool, experience a Japanese onsen and take in panoramic views of Halong Bay.",
    amenities: [["scenic", "Infinity Pool"], ["spa", "Onsen"], ["sightseeing", "Bay Views"]],
  },
  "Luna Ha Long Cruise": {
    photo: "luna-halong-cruise-hoang-luxury-travel",
    photoAlt: "Luna Ha Long cruise featuring spacious decks and scenic views of the limestone islands in Halong Bay",
    description: "Highlights include a glass-bottom swimming pool, 360-degree sundecks with a wide selection of Asian and European dishes in Halong Bay.",
    amenities: [["dining", "Dining"], ["scenic", "Pool"], ["sightseeing", "Sundecks"]],
  },
  "Calista Cruise": {
    photo: "private-car-hoang-luxury-travel-calista-cruise-halong-bay",
    photoAlt: "Calista cruise sailing across the calm waters of Halong Bay with scenic limestone islands in the background",
    description: "A heated infinity pool, an outdoor Jacuzzi and spa services create a relaxing retreat in Halong Bay.",
    amenities: [["scenic", "Heated Pool"], ["spa", "Jacuzzi"], ["spa", "Spa"]],
  },
  "Seaoctopus Cruises": {
    photo: "hoang-luxury-travel-seaoctopus-cruises-halong-bay",
    photoAlt: "Seaoctopus cruise sailing through the emerald waters of Halong Bay surrounded by limestone islands",
    description: "Dining takes center stage with a buffet of over 60 dishes, live music and two spacious sundecks overlooking Halong Bay.",
    amenities: [["dining", "Buffet"], ["activities", "Live Music"], ["sightseeing", "Sundecks"]],
  },
  "Stellar of the Seas Cruise": {
    photo: "stellar-of-the-seas-luxury-cruise-lan-ha-bay-hoang-luxury-travel",
    photoAlt: "Stellar of the Seas luxury cruise sailing through the emerald waters of Lan Ha Bay surrounded by limestone islands",
    description: "Relax by the outdoor pool, play mini golf, and admire panoramic views of Lan Ha Bay from the onboard bar.",
    amenities: [["scenic", "Outdoor Pool"], ["activities", "Mini Golf"], ["sightseeing", "Bay Views"]],
  },
  "Paradise Grand": {
    photo: "private-car-paradise-grand-luxury-cruise-lan-ha-bay",
    photoAlt: "Paradise Grand luxury cruise featuring spacious decks and scenic limestone island views in Lan Ha Bay",
    description: "Fine dining, spa services, and a spacious sundeck add elegance to a relaxing cruise through Lan Ha Bay.",
    amenities: [["dining", "Fine Dining"], ["spa", "Spa"], ["sightseeing", "Sundeck"]],
  },
  "Elite of the Seas": {
    photo: "elite-of-the-seas-luxury-cruise-lan-ha-bay-private-transfer",
    photoAlt: "Elite of the Seas luxury cruise sailing across the turquoise waters of Lan Ha Bay with limestone islands in the background",
    description: "Modern design combines with a year-round infinity pool, a wine cellar, and spa services to create a refined and relaxing cruise experience.",
    amenities: [["scenic", "Infinity Pool"], ["dining", "Wine Cellar"], ["spa", "Spa"]],
  },
  "Ambassador Cruise Signature": {
    photo: "ambassador-signature-luxury-cruise-hoang-luxury-travel-lan-ha-bay",
    photoAlt: "Ambassador Signature luxury cruise with elegant multi-level decks sailing through the scenic waters of Lan Ha Bay",
    description: "Each cabin has a private balcony, while the piano lounge and 360-degree sundeck provide a relaxing atmosphere in Lan Ha Bay.",
    amenities: [["scenic", "Balconies"], ["activities", "Piano Lounge"], ["sightseeing", "Sundeck"]],
  },
  "Lyra Grandeur Cruise": {
    photo: "lyra-grandeur-deluxe-cruise-lan-ha-bay-private-car",
    photoAlt: "Lyra Grandeur deluxe cruise featuring spacious decks and an outdoor waterslide surrounded by limestone islands in Lan Ha Bay",
    description: "Enjoy a waterslide, a heated pool, and an outdoor Nordic-style sauna for both recreation and relaxation while cruising through Lan Ha Bay.",
    amenities: [["activities", "Waterslide"], ["scenic", "Heated Pool"], ["spa", "Sauna"]],
  },
  "Celina of the Sea": {
    photo: "hoang-luxury-travel-celina-of-the-sea-deluxe-cruise-lan-ha-bay",
    photoAlt: "Celina of the Sea deluxe cruise sailing through the turquoise waters of Lan Ha Bay with scenic limestone islands in the background",
    description: "Spacious suites with private balconies, a glass skybridge, and a Sky Bar are highlights of this luxury Lan Ha Bay cruise.",
    amenities: [["scenic", "Balconies"], ["sightseeing", "Skybridge"], ["dining", "Sky Bar"]],
  },
  "Indochine Cruise": {
    photo: "private-transfer-indochine-deluxe-cruise-lan-ha-bay",
    photoAlt: "Indochine deluxe cruise featuring elegant multi-level decks sailing through Lan Ha Bay at sunset",
    description: "This cruise stands out for its elegant Indochine-style design, spacious sundeck, infinity pool, and refined dining spaces.",
    amenities: [["dining", "Dining"], ["scenic", "Infinity Pool"], ["sightseeing", "Sundeck"]],
  },
  "Diana Cruises": {
    photo: "diana-cruises-standard-lan-ha-bay-hoang-luxury-travel",
    photoAlt: "Diana cruise ship sailing through the turquoise waters of Lan Ha Bay with scenic limestone islands in the background",
    description: "Stay in a suite with a private balcony, relax in the rooftop lounge, and dine with panoramic views of Lan Ha Bay.",
    amenities: [["dining", "Dining"], ["scenic", "Balconies"], ["sightseeing", "Rooftop"]],
  },
};

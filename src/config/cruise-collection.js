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
).map((item, index) => ({ ...item, photoIndex: index + 1 }));

/* Mô tả (khách gửi 23/11/2026) + 3 tiện ích (theo thiết kế) trên thẻ du thuyền.
   amenities không bắt buộc: thẻ không có thì bỏ hàng tiện ích.
   Mã icon: dining, spa, kayak, activities, sightseeing, scenic. */
export const cruiseHighlights = {
  "Grand Pioneers Cruise": {
    description: "Experience a modern 5-star cruise in Halong Bay, featuring a saltwater infinity pool and premium spa services.",
    amenities: [["dining", "Fine Dining"], ["spa", "Spa & Wellness"], ["kayak", "Kayak"]],
  },
  "Victorious Cruise": {
    description: "Discover the beauty of Halong Bay aboard a luxury cruise with a Sky Bar, a swimming pool and a variety of activities.",
    amenities: [["dining", "Fine Dining"], ["activities", "Activities"], ["sightseeing", "Sightseeing"]],
  },
  "Paradise Legacy": {
    description: "A luxury cruise that combines the cultural charm of Northern Vietnam with elegant design, fine dining and a piano bar.",
    amenities: [["dining", "Fine Dining"], ["scenic", "Scenic Views"], ["kayak", "Kayak"]],
  },
  "Dolphin Cruise": {
    description: "This modern entertainment cruise in Halong Bay combines a year-round swimming pool, a domed stage and unique dining experiences.",
  },
  "Ambassador Cruise": {
    description: "Admire the beauty of Halong Bay from a spacious observation deck, relax in an outdoor Jacuzzi, and experience fine dining aboard this luxury cruise.",
  },
  "Catherine Cruises": {
    description: "An Indochine-style cruise with a year-round infinity pool, a mini golf course and relaxing spa services.",
  },
  "Sea Stars Cruises": {
    description: "On this premium leisure cruise, guests can relax by the swimming pool, play mini golf, and dine at a restaurant with panoramic views of Halong Bay.",
  },
  "Athena Premium Cruise": {
    description: "Relax by a year-round infinity pool, experience a Japanese onsen and take in panoramic views of Halong Bay.",
  },
  "Luna Ha Long Cruise": {
    description: "Highlights include a glass-bottom swimming pool, 360-degree sundecks with a wide selection of Asian and European dishes in Halong Bay.",
  },
  "Calista Cruise": {
    description: "A heated infinity pool, an outdoor Jacuzzi and spa services create a relaxing retreat in Halong Bay.",
  },
  "Seaoctopus Cruises": {
    description: "Dining takes center stage with a buffet of over 60 dishes, live music and two spacious sundecks overlooking Halong Bay.",
  },
  "Stellar of the Seas Cruise": {
    description: "Relax by the outdoor pool, play mini golf, and admire panoramic views of Lan Ha Bay from the onboard bar.",
  },
  "Paradise Grand": {
    description: "Fine dining, spa services, and a spacious sundeck add elegance to a relaxing cruise through Lan Ha Bay.",
  },
  "Elite of the Seas": {
    description: "Modern design combines with a year-round infinity pool, a wine cellar, and spa services to create a refined and relaxing cruise experience.",
  },
  "Ambassador Cruise Signature": {
    description: "Each cabin has a private balcony, while the piano lounge and 360-degree sundeck provide a relaxing atmosphere in Lan Ha Bay.",
  },
  "Lyra Grandeur Cruise": {
    description: "Enjoy a waterslide, a heated pool, and an outdoor Nordic-style sauna for both recreation and relaxation while cruising through Lan Ha Bay.",
  },
  "Celina of the Sea": {
    description: "Spacious suites with private balconies, a glass skybridge, and a Sky Bar are highlights of this luxury Lan Ha Bay cruise.",
  },
  "Indochine Cruise": {
    description: "This cruise stands out for its elegant Indochine-style design, spacious sundeck, infinity pool, and refined dining spaces.",
  },
  "Diana Cruises": {
    description: "Stay in a suite with a private balcony, relax in the rooftop lounge, and dine with panoramic views of Lan Ha Bay.",
  },
};

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
      Deluxe: ["Lyra Grandeur Cruise", "Celina of the Sea", "Indochine Cruise", "Diana Cruises"],
      Standard: [],
    },
  },
];

export const cruiseCollectionEntries = cruiseCollection.flatMap(({ bay, tiers }) =>
  cruiseTiers.flatMap((tier) => tiers[tier].map((name) => ({ bay, tier, name }))),
).map((item, index) => ({ ...item, photoIndex: index + 1 }));

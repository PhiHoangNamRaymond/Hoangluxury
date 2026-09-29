// Editorial demo content for the blog layout. Replace with approved articles before publication.
export const blogCategories = ["All", "Sapa", "Ha Giang", "Travel Tips", "Itineraries", "Food & Culture", "Private Transfers"];

export const blogArticles = [
  {
    id: "sapa-travel-guide", category: "Travel Guides", tags: ["Sapa", "Travel Tips"], image: "terraces",
    title: "The Ultimate Sapa Travel Guide: Mountains, Culture & Unforgettable Experiences",
    excerpt: "Discover a slower side of Sapa, from misty mountain mornings to terraced valleys and the small moments that make a journey memorable.",
    sections: [
      ["Make room for the mountains", "Sapa is a place to slow down. Build your days around the landscapes you want to experience, with time for a village walk, a long lunch and a quiet moment looking out over the valley. A flexible itinerary leaves room for the views to unfold."],
      ["A journey at your own pace", "Combine time in town with a visit to the surrounding countryside. Tell your driver which experiences matter most to you, and discuss comfortable stops along the way. Ask before photographing people and respect the daily life of the communities you visit."],
      ["Plan the practical details", "Pack layers, comfortable walking shoes and a light waterproof jacket. Confirm your hotel address, luggage needs and pick-up details before departure. Leave space in your plans for changes in weather and road conditions."],
    ],
  },
  { id: "ha-giang-loop", category: "Ha Giang", tags: ["Ha Giang", "Travel Tips"], image: "haGiang",
    title: "Ha Giang Loop Guide: Routes, Highlights and Travel Tips",
    excerpt: "Winding roads, limestone peaks and little villages. An introduction to a more thoughtful mountain journey.",
    sections: [["Enjoy the road as much as the destination", "A journey through Ha Giang invites you to pause. Plan fewer stops with more time at each, rather than treating the landscape as a checklist. Talk through your route and daily driving time with your local team."], ["Travel thoughtfully", "Choose stops where your vehicle can pull over safely. Bring layers for changing conditions, keep essentials close by and ask your host or guide about local customs before visiting villages."]],
  },
  { id: "northern-vietnam-itinerary", category: "Itineraries", tags: ["Itineraries", "Sapa", "Ha Giang"], image: "ninhBinh",
    title: "A Northern Vietnam Itinerary: Sapa, Ha Giang & Ninh Binh",
    excerpt: "Mountain mornings, peaceful rivers and time to explore. Shape a route around what you love most.",
    sections: [["Start with your priorities", "Choose whether your trip is about mountain scenery, village walks or time on the water. Distances between destinations can mean long days on the road, so give each place enough time rather than trying to include everything."], ["Build in breathing space", "Balance travel days with slower days. Share your arrival and departure times with your travel team and leave a buffer before your flight home. Your itinerary should feel like a holiday from beginning to end."]],
  },
  { id: "food-and-culture", category: "Food & Culture", tags: ["Food & Culture"], image: "dining",
    title: "A Taste of Northern Vietnam: Food, Culture & Connection",
    excerpt: "Discover the pleasure of a shared table, a comforting bowl and the stories behind a local meal.",
    sections: [["Let a meal become part of the journey", "Leave time to sit down and enjoy your food. A relaxed meal can become one of the most memorable parts of a trip, especially when you ask about the ingredients and the story behind a dish."], ["Share your preferences", "Tell your hosts about allergies and dietary requirements before ordering. Ask your local team for options that suit your tastes, and stay curious about the food traditions of each destination."]],
  },
  { id: "ninh-binh-guide", category: "Ninh Binh", tags: ["Travel Tips", "Itineraries"], image: "ninhBinh",
    title: "Ninh Binh Travel Guide: Hidden Gems Beyond the Crowds",
    excerpt: "Find your own rhythm among limestone landscapes, gentle waterways and quiet country roads.",
    sections: [["Keep your day unhurried", "Choose a small number of places you really want to see. Leave room for a boat journey, a walk or an unexpected view rather than filling every hour with a new stop."], ["Make the details easy", "Wear comfortable shoes and bring sun and rain protection. Confirm your return pick-up location with your driver and keep their contact details with you while exploring."]],
  },
  { id: "travel-between-destinations", category: "Travel Tips", tags: ["Travel Tips", "Sapa", "Ha Giang", "Private Transfers"], image: "drive",
    title: "How to Travel Between Sapa, Hanoi and Ha Giang",
    excerpt: "A little planning makes a long journey feel easier. Consider your route, luggage and preferred pace.",
    sections: [["Choose a pace that suits you", "Think about your group’s comfort, how much luggage you have and whether you would like to stop on the way. Compare transport options with those needs in mind, not only the headline journey time."], ["Confirm before you leave", "Share the exact pick-up and drop-off addresses, passenger count and luggage details. Check what your quote includes and arrange a clear contact point for any changes on the day."]],
  },
  { id: "private-transfer-benefits", category: "Private Transfers", tags: ["Private Transfers", "Travel Tips"], image: "driver",
    title: "Why a Private Transfer Makes Your Vietnam Trip Better",
    excerpt: "Your own space, a familiar face and a journey planned around the people you are travelling with.",
    sections: [["Space to enjoy the journey", "A private transfer gives your group its own vehicle and a route agreed in advance. It can make travelling with family, extra luggage or a specific schedule easier to organise."], ["Small details make a difference", "Discuss breaks, luggage space and pick-up instructions before your trip. Confirm the vehicle, driver contact and final price with your booking team so you can leave feeling prepared."]],
  },
  { id: "ha-long-bay-guide", category: "Travel Guides", tags: ["Travel Tips", "Itineraries"], image: "haLong",
    title: "A Thoughtful Guide to Visiting Ha Long Bay",
    excerpt: "Make time for the water, the light and the quiet moments between your cruise activities.",
    sections: [["Choose your experience", "Consider the pace and style of cruise you would enjoy, from the cabin and shared spaces to the activities included. Read the itinerary carefully and ask what may change with the weather."], ["Connect your journey", "Confirm the exact cruise port, check-in time and transfer arrangements with your operator. Keep essentials in a small bag and allow time for the journey from Hanoi."]],
  },
  { id: "sapa-packing", category: "Sapa", tags: ["Sapa", "Travel Tips"], image: "sapa",
    title: "Sapa Weather & Packing: A More Comfortable Mountain Escape",
    excerpt: "A practical approach to packing light while staying ready for changing mountain conditions.",
    sections: [["Dress in layers", "Bring pieces that are easy to add or remove, a light waterproof layer and comfortable shoes. Check the forecast close to your travel date and adapt your packing to the activities you have planned."], ["Keep essentials with you", "Carry drinking water, personal medication and a charged phone on day trips. Let your travel team know if you need a gentler pace or extra breaks along the way."]],
  },
  { id: "mu-cang-chai-terraces", category: "Travel Guides", tags: ["Itineraries", "Travel Tips"], image: "terraces",
    title: "Mu Cang Chai: A Slower Journey Through the Rice Terraces",
    excerpt: "Open landscapes and quiet moments. Explore the countryside with time to stop and simply look.",
    sections: [["Follow the landscape", "Plan your visit around the scenery and experiences that interest you. The appearance of the terraces changes through the growing cycle, so check local conditions when choosing your travel dates."], ["Leave room for discovery", "Keep your itinerary flexible enough for a scenic stop or a relaxed meal. Respect working fields and private land, and ask before entering or taking close-up photographs."]],
  },
];

export function filterBlogArticles(articles, category, query, sort) {
  const search = query.trim().toLocaleLowerCase();
  const filtered = articles.filter((article) =>
    (category === "All" || article.category === category || article.tags.includes(category)) &&
    `${article.title} ${article.excerpt} ${article.tags.join(" ")}`.toLocaleLowerCase().includes(search),
  );
  return sort === "oldest" ? filtered.reverse() : filtered;
}

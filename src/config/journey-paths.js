// Đường dẫn trang tuyến, dùng chung cho link trên site (data.js, JourneyPage),
// bộ định tuyến (main.jsx) và HTML tĩnh / sitemap lúc build
// (scripts/generate-static-routes.mjs). Không import gì để Node đọc được trực tiếp.

// Slug cũ dưới /journey/ theo khoá tuyến (khoá trong `journeys` ở journeys.js).
export const legacyJourneySlugByKey = {
  sapa: "hanoi-to-sapa-private-transfer",
  "ha-long": "hanoi-to-ha-long-private-transfer",
  "ninh-binh": "hanoi-to-ninh-binh-private-transfer",
  "ha-giang": "hanoi-to-ha-giang-private-transfer",
  "cat-ba": "hanoi-to-cat-ba-private-transfer",
  "cao-bang": "hanoi-to-cao-bang-private-transfer",
  "mu-cang-chai": "hanoi-to-mu-cang-chai-private-transfer",
  "moc-chau": "hanoi-to-moc-chau-private-transfer",
  "ta-xua": "hanoi-to-ta-xua-private-transfer",
  "pu-luong": "hanoi-to-pu-luong-private-transfer",
  "sapa-to-ha-long": "sapa-to-ha-long-private-transfer",
  "sapa-to-ninh-binh": "sapa-to-ninh-binh-private-transfer",
  "sapa-to-ha-giang": "sapa-to-ha-giang-private-transfer",
  "sapa-to-mu-cang-chai": "sapa-to-mu-cang-chai-private-transfer",
  "ha-long-to-sapa": "ha-long-to-sapa-private-transfer",
  "ninh-binh-to-sapa": "ninh-binh-to-sapa-private-transfer",
};

// URL mới theo SEO (khách duyệt 28/10/2026). Tuyến chưa có ở đây giữ /journey/<slug cũ>/;
// đường dẫn cũ chuyển hướng 301 sang URL mới (vercel.json, public/.htaccess).
const routePathByKey = {
  sapa: "/routes/hanoi-to-sapa-private-transfer/",
  "ha-long": "/routes/hanoi-to-halong-bay-private-transfer/",
  "ninh-binh": "/routes/hanoi-to-ninh-binh-private-transfer/",
  "ha-giang": "/routes/hanoi-to-ha-giang-private-transfer/",
  "cat-ba": "/routes/hanoi-to-cat-ba-private-transfer/",
  "cao-bang": "/routes/hanoi-to-cao-bang-private-car/",
  "pu-luong": "/routes/hanoi-to-pu-luong-private-car/",
  "moc-chau": "/routes/hanoi-to-moc-chau-private-car/",
  "mu-cang-chai": "/routes/hanoi-to-mu-cang-chai-private-car/",
  "ta-xua": "/routes/hanoi-to-ta-xua-private-car/",
  "sapa-to-ha-long": "/routes/sapa-to-halong-bay-private-car/",
  "sapa-to-ninh-binh": "/routes/sapa-to-ninh-binh-private-car/",
  "sapa-to-ha-giang": "/routes/sapa-to-ha-giang-private-car/",
  "sapa-to-mu-cang-chai": "/routes/sapa-to-mu-cang-chai-private-car/",
  "ha-long-to-sapa": "/routes/halong-bay-to-sapa-private-car/",
  "ninh-binh-to-sapa": "/routes/ninh-binh-to-sapa-private-car/",
};

export const journeyPagePath = (key) => routePathByKey[key] || `/journey/${legacyJourneySlugByKey[key]}/`;

// Khoá tuyến từ phần cuối đường dẫn /journey/<x>/ hoặc /routes/<x>/: nhận khoá,
// slug cũ hoặc slug mới; không khớp thì null.
export const journeyKeyFromSlug = (slug) =>
  Object.keys(legacyJourneySlugByKey).find((key) =>
    key === slug || legacyJourneySlugByKey[key] === slug || journeyPagePath(key) === `/routes/${slug}/`,
  ) || null;

// Trang du thuyền Hạ Long, cùng nhóm /routes/ (khách duyệt 28/10/2026).
export const cruisesPagePath = "/routes/halong-bay-cruises/";

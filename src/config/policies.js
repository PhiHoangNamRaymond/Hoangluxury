import { privacySections } from "./privacy-policy.js";

/* Hai trang chính sách riêng (khách yêu cầu 23/11/2026), thay cho trang gộp
   /policies/ cũ. Nội dung vẫn là bản nháp, chờ bản chuẩn từ khách. */
export const privacyPolicyPath = "/privacy-policy/";
export const termsPath = "/terms-and-conditions/";

export const policyPageSeo = {
  privacy: {
    title: "Privacy Policy | Hoang Luxury Travel",
    description: "How Hoang Luxury Travel collects, uses, protects and manages your personal information.",
  },
  terms: {
    title: "Terms & Conditions | Hoang Luxury Travel",
    description: "The terms and conditions for using the Hoang Luxury Travel website and booking private transportation services.",
  },
};

/* Liên kết cũ /policies/#… và /terms-conditions/: phần Privacy (#privacy hoặc
   mục của Privacy Policy) về /privacy-policy/, còn lại về /terms-and-conditions/. */
const privacyAnchors = new Set(["privacy", ...privacySections.map(({ id }) => id)]);
export function legacyPolicyPath(hash = "") {
  const id = hash.replace(/^#/, "");
  return privacyAnchors.has(id) ? privacyPolicyPath : termsPath;
}
export function legacyPolicyHash(hash = "") {
  const id = hash.replace(/^#/, "");
  return id === "privacy" || id === "terms" ? "" : hash;
}

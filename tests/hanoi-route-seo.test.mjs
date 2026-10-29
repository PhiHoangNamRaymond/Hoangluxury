import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { journeys } from "../src/config/journeys.js";
import { journeyPagePath, journeyKeyFromSlug, legacyJourneySlugByKey } from "../src/config/journey-paths.js";

const expected = [
  ["sapa", "hanoi-to-sapa-private-transfer", "Hanoi To Sapa Private Transfer | Hoang Luxury Travel", "Private car service from Hanoi/ Noi Bai Airport to Sapa. Enjoy door-to-door service, flexible stops and 24/7 support. Hotline (+84) 839779888"],
  ["ha-long", "hanoi-to-halong-bay-private-transfer", "Hanoi To Halong Bay Private Transfer | Hoang Luxury Travel", "Hanoi to Halong Bay private car with pickup and drop-off at your location. Professional drivers, save time and all-inclusive pricing."],
  ["ninh-binh", "hanoi-to-ninh-binh-private-transfer", "Hanoi To Ninh Binh Private Transfer | Hoang Luxury Travel", "Book a Hanoi to Ninh Binh private transfer with Hoang Luxury Travel. Enjoy a comfortable private car, no shared passengers and flexible payments."],
  ["ha-giang", "hanoi-to-ha-giang-private-transfer", "Hanoi To Ha Giang Private Transfer | Hoang Luxury Travel", "Travel from Hanoi to Ha Giang by private car with luxury service at Hoang Luxury Travel. 100% private, professional driver, late-model vehicles and get 24/7 WhatsApp support."],
  ["cat-ba", "hanoi-to-cat-ba-private-transfer", "Hanoi To Cat Ba Private Transfer | Hoang Luxury Travel", "Hanoi to Cat Ba Island private transfer on your schedule. Transparent All-Inclusive Pricing. Cash and cards accepted. Hotline (+84) 839779888"],
];

test("five Hanoi routes have approved URLs/metadata and direct redirects from both legacy URLs", async () => {
  const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  const apache = await readFile(new URL("../public/.htaccess", import.meta.url), "utf8");
  const rules = [...apache.matchAll(/^RewriteRule (\S+) (\S+) \[R=301,L\]$/gm)]
    .map(([, pattern, destination]) => [new RegExp(pattern), destination]);
  for (const [key, slug, title, description] of expected) {
    const path = `/routes/${slug}/`;
    assert.equal(journeyPagePath(key), path);
    assert.equal(journeyKeyFromSlug(slug), key);
    assert.equal(journeys[key].seoTitle, title);
    assert.equal(journeys[key].metaDescription, description);
    for (const oldSlug of [key, legacyJourneySlugByKey[key]]) {
      assert.equal(journeyKeyFromSlug(oldSlug), key);
      for (const trailing of ["", "/"]) {
        const oldPath = `/journey/${oldSlug}${trailing}`;
        const redirect = vercel.redirects.find((rule) => rule.source === oldPath);
        assert.equal(redirect?.destination, path, oldPath);
        assert.equal(redirect.permanent, true);
        assert.equal(rules.find(([pattern]) => pattern.test(oldPath.slice(1)))?.[1], path, oldPath);
      }
    }
    assert.ok(!vercel.redirects.some((rule) => [path, path.slice(0, -1)].includes(rule.source)));
  }
});

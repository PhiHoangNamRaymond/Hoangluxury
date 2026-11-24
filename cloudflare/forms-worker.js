import { createFormsHandler } from "../supabase/functions/forms-proxy/index.js";
import { handleCountryRequest } from "./country-worker.js";

export default {
  async fetch(request, env) {
    return handleCountryRequest(request, (allowedRequest) => {
      if (new URL(allowedRequest.url).pathname !== "/api/forms") return fetch(allowedRequest);
      return createFormsHandler({
        endpoint: env.GOOGLE_FORMS_ENDPOINT,
        proxySecret: env.FORMS_PROXY_SECRET,
        turnstileSecret: env.TURNSTILE_SECRET_KEY,
        allowedOrigins: env.FORMS_ALLOWED_ORIGINS,
        // Platform-provided metadata, not user-supplied headers or form fields.
        visitorLocation: (req) => ({
          city: req.cf?.city, region: req.cf?.region, country: req.cf?.country,
          source: req.cf ? "Cloudflare IP estimate" : "Unavailable",
        }),
      })(allowedRequest);
    });
  },
};

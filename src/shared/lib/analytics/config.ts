/**
 * Shared analytics configuration.
 *
 * Reads from the public env vars so the same values are available on both
 * the browser and server. If the key isn't set, analytics becomes a no-op
 * — useful for local development and previews where you don't want noise
 * in production dashboards.
 */
export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";

// We send through the Next.js rewrite (`/ingest`) so requests stay first-party.
// The browser SDK reads this; the Node SDK talks directly to PostHog because
// it doesn't run through our rewrite layer.
export const POSTHOG_PROXY_HOST = "/ingest";
export const POSTHOG_DIRECT_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export const isAnalyticsEnabled = POSTHOG_KEY.length > 0;

/**
 * Routes where analytics MUST NOT load.
 *
 * Public form pages (`/f/*`) are filled out by *respondents* — not Byteform
 * users — so tracking them in our internal product analytics would pollute
 * the data and create a privacy concern. Form creators get their own
 * response analytics elsewhere in the product.
 */
export function shouldTrackPath(pathname: string): boolean {
  if (!pathname) return false;
  if (pathname.startsWith("/f/")) return false;
  if (pathname.startsWith("/api/")) return false;
  return true;
}

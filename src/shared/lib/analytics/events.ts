/**
 * Centralized list of product analytics events.
 *
 * Naming convention: `{noun}_{past_tense_verb}` (PostHog best practice).
 * Keep this list small and meaningful — every event here should map to a
 * decision we want to make about the product.
 */
export const AnalyticsEvent = {
  UserSignedUp: "user_signed_up",
  UserSignedIn: "user_signed_in",
  UserSignedOut: "user_signed_out",
  FormCreated: "form_created",
  FormPublished: "form_published",
  FormUnpublished: "form_unpublished",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

export type AnalyticsProps = Record<string, string | number | boolean | null>;

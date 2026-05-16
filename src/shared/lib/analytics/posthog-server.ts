import "server-only";
import { PostHog } from "posthog-node";
import {
  POSTHOG_KEY,
  POSTHOG_DIRECT_HOST,
  isAnalyticsEnabled,
} from "./config";
import type { AnalyticsEventName, AnalyticsProps } from "./events";

/**
 * Server-side PostHog client.
 *
 * Server events are more reliable than client events (no ad-blockers,
 * no SPA navigation edge cases) — use this for anything we care about
 * not losing, like form_created or form_published.
 *
 * We reuse a single instance across requests via globalThis so we don't
 * leak sockets in dev (Next.js hot reloads keep this module warm).
 */
const globalForPosthog = globalThis as unknown as {
  posthogServer: PostHog | undefined;
};

function getServerClient(): PostHog | null {
  if (!isAnalyticsEnabled) return null;

  if (!globalForPosthog.posthogServer) {
    globalForPosthog.posthogServer = new PostHog(POSTHOG_KEY, {
      host: POSTHOG_DIRECT_HOST,
      // Small batch window keeps serverless functions from exiting before
      // events are flushed; we still call shutdown() explicitly below.
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return globalForPosthog.posthogServer;
}

interface CaptureArgs {
  distinctId: string;
  event: AnalyticsEventName;
  properties?: AnalyticsProps;
}

/**
 * Fire-and-forget server-side event capture.
 *
 * Always awaited at a request boundary via `flush()` to make sure the
 * event leaves the process before the route handler returns.
 */
export async function captureServerEvent({
  distinctId,
  event,
  properties,
}: CaptureArgs): Promise<void> {
  const client = getServerClient();
  if (!client) return;

  client.capture({
    distinctId,
    event,
    properties,
  });

  // In serverless environments the function may freeze the moment we
  // return, so we flush synchronously rather than relying on the timer.
  try {
    await client.flush();
  } catch {
    // Never let analytics break a real request.
  }
}

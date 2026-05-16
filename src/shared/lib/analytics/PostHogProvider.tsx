"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";
import {
  capturePageview,
  identifyUser,
  initPostHog,
  resetUser,
} from "./posthog-client";
import { isAnalyticsEnabled, shouldTrackPath } from "./config";

interface Props {
  children: React.ReactNode;
}

/**
 * Mounts PostHog in the browser and keeps it in sync with:
 *   1. Route changes (manual SPA pageview capture)
 *   2. Supabase auth state (identify on sign-in, reset on sign-out)
 *
 * Excludes public form pages (`/f/*`) — see `shouldTrackPath` for why.
 */
export function PostHogProvider({ children }: Props) {
  useEffect(() => {
    if (isAnalyticsEnabled) initPostHog();
  }, []);

  useAuthIdentification();

  return (
    <>
      {/* useSearchParams requires a Suspense boundary in the App Router. */}
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      {children}
    </>
  );
}

function PageviewTracker(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !shouldTrackPath(pathname)) return;
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    capturePageview(window.location.origin + url);
  }, [pathname, searchParams]);

  return null;
}

function useAuthIdentification(): void {
  // Tracks the last identified user id so we don't re-identify on every
  // token refresh, which would spam events without changing state.
  const lastIdentifiedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAnalyticsEnabled) return;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (user && lastIdentifiedRef.current !== user.id) {
        identifyUser(user.id, { email: user.email ?? null });
        lastIdentifiedRef.current = user.id;
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          resetUser();
          lastIdentifiedRef.current = null;
          return;
        }
        const user = session?.user;
        if (!user) return;
        if (lastIdentifiedRef.current === user.id) return;
        identifyUser(user.id, { email: user.email ?? null });
        lastIdentifiedRef.current = user.id;
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, []);
}

"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useCookiePreferences } from "@/hooks/useCookiePreferences";
import { saveCookiePreferences } from "@/lib/cookiePreferences";

export const CookieConsentBanner = () => {
  const { isReady, hasSavedPreferences } = useCookiePreferences();

  const hidden = useMemo(
    () => !isReady || hasSavedPreferences,
    [hasSavedPreferences, isReady]
  );

  if (hidden) {
    return null;
  }

  const handleSave = (type: "accept" | "reject") => {
    if (type === "accept") {
      saveCookiePreferences({
        functional: true,
        analytics: true,
        advertising: true,
      });
    } else {
      saveCookiePreferences({
        functional: false,
        analytics: true, // Analytics cookies are necessary for remembering the user's choice, so we set it to true even on reject
        advertising: true, // AdSense requires advertising cookies to function, so we set it to true even on reject
      });
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-2 sm:py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-slate-900">Cookie consent</p>
          <p className="mt-1 text-xs sm:text-sm leading-6 text-slate-600">
            We only enable optional services like Google Translate, Google
            Analytics, and AdSense-related resources after you choose. You can
            update your preference anytime in{" "}
            <Link
              href="/cookie-settings"
              className="font-medium text-sky-700 hover:text-sky-800 hover:underline"
            >
              Cookie Settings
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/cookie-settings">Manage cookies</Link>
          </Button>
          <Button variant="outline" onClick={() => handleSave("reject")}>
            optional
          </Button>
          <Button onClick={() => handleSave("accept")}>Accept all</Button>
        </div>
      </div>
    </div>
  );
};

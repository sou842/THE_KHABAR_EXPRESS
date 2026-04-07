"use client";

import Script from "next/script";
import { useEffect } from "react";
import GoogleAnalytics from "@/hooks/useGoogleAnalytics";
import { GoogleTranslateScript } from "@/components/common/GoogleTranslateScript";
import { useCookiePreferences } from "@/hooks/useCookiePreferences";

const ADSENSE_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5434867604639566";

type CookieControlledScriptsProps = {
  disableOptionalScripts?: boolean;
};

export const CookieControlledScripts = ({
  disableOptionalScripts = false,
}: CookieControlledScriptsProps) => {
  const { preferences, isReady } = useCookiePreferences();

  useEffect(() => {
    if (!preferences || !process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      return;
    }

    const gaFlag = `ga-disable-${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`;
    window[gaFlag as keyof Window] = !preferences.analytics as never;
  }, [preferences]);

  if (!isReady || !preferences) {
    return null;
  }

  if (disableOptionalScripts) {
    return null;
  }

  return (
    <>
      {preferences.analytics ? <GoogleAnalytics /> : null}
      {preferences.functional ? <GoogleTranslateScript /> : null}
      {preferences.advertising ? (
        <Script
          id="adsense-script"
          async
          strategy="afterInteractive"
          src={ADSENSE_SRC}
          crossOrigin="anonymous"
        />
      ) : null}
    </>
  );
};

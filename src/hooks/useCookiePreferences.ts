import { useEffect, useState } from "react";
import {
  COOKIE_PREFERENCES_EVENT,
  CookiePreferences,
  hasSavedCookiePreferences,
  readCookiePreferences,
} from "@/lib/cookiePreferences";

export const useCookiePreferences = () => {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [hasSavedPreferences, setHasSavedPreferences] = useState(false);

  useEffect(() => {
    const syncPreferences = () => {
      setPreferences(readCookiePreferences());
      setHasSavedPreferences(hasSavedCookiePreferences());
    };

    syncPreferences();
    window.addEventListener(COOKIE_PREFERENCES_EVENT, syncPreferences);
    window.addEventListener("storage", syncPreferences);

    return () => {
      window.removeEventListener(COOKIE_PREFERENCES_EVENT, syncPreferences);
      window.removeEventListener("storage", syncPreferences);
    };
  }, []);

  return {
    preferences,
    isReady: preferences !== null,
    hasSavedPreferences,
  };
};

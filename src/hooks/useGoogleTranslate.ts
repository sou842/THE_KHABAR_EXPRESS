"use client";

import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";

export type LanguageCode = "en" | "hi" | "es" | "bn";

export const useGoogleTranslate = () => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("en");

  // Sync with store on mount
  useEffect(() => {
    const storedLang = localStorage.getItem("the-khabar-lang") as LanguageCode;
    const gTrans = Cookies.get("googtrans");
    const cookieLang = gTrans?.split("/").pop()?.replace(/"/g, "") as LanguageCode;

    const detectedLang = storedLang || cookieLang || "en";
    const validLangs: LanguageCode[] = ["en", "hi", "es", "bn"];
    const finalLang = validLangs.includes(detectedLang) ? detectedLang : "en";

    setCurrentLanguage(finalLang);
  }, []);

  // Function to change language programmatically
  const changeLanguage = useCallback((langCode: LanguageCode) => {
    if (langCode === currentLanguage) return;

    // 1. Persist to master store (LocalStorage)
    localStorage.setItem("the-khabar-lang", langCode);
    setCurrentLanguage(langCode);

    // 2. Google Translate cookie sync logic
    const hostname = window.location.hostname;
    const cookieValue = `/en/${langCode}`;

    // Aggressively clear all possible cookie variants to avoid duplicates
    Cookies.remove("googtrans", { path: "/" });
    Cookies.remove("googtrans", { path: "/", domain: hostname });
    Cookies.remove("googtrans", { path: "/", domain: "." + hostname });

    if (langCode === "en") {
      window.location.reload();
    } else {
      Cookies.set("googtrans", cookieValue, { path: "/" });
      window.location.reload();
    }
  }, [currentLanguage]);

  return {
    currentLanguage,
    changeLanguage,
  };
};

"use client";

import { useEffect, useState, useCallback } from "react";

export type LanguageCode = "en" | "hi" | "es" | "bn" | "mr";
export const useGoogleTranslate = () => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("en");

  // Sync with store on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryLang = urlParams.get("lang") as LanguageCode;
    const storedLang = localStorage.getItem("the-khabar-lang") as LanguageCode;
    const validLangs: LanguageCode[] = ["en", "hi", "es", "bn", "mr"];
    
    let finalLang: LanguageCode = "en";
    if (queryLang && validLangs.includes(queryLang)) {
      finalLang = queryLang;
      if (queryLang !== storedLang) {
        localStorage.setItem("the-khabar-lang", queryLang);
      }
    } else if (storedLang && validLangs.includes(storedLang)) {
      finalLang = storedLang;
    }

    setCurrentLanguage(finalLang);
  }, []);

  // Function to change language programmatically
  const changeLanguage = useCallback((langCode: LanguageCode) => {
    if (langCode === currentLanguage) return;

    // 1. Persist to master store (LocalStorage)
    localStorage.setItem("the-khabar-lang", langCode);
    setCurrentLanguage(langCode);

    // 2. Update URL with query param and reload
    const url = new URL(window.location.href);
    if (langCode === "en") {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", langCode);
    }
    window.location.href = url.toString();
  }, [currentLanguage]);

  return {
    currentLanguage,
    changeLanguage,
  };
};

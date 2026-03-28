"use client";

import { useEffect, useState, useCallback } from "react";

export type LanguageCode = "en" | "hi" | "es" | "bn";
export const useGoogleTranslate = () => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("en");

  // Sync with store on mount
  useEffect(() => {
    const storedLang = localStorage.getItem("the-khabar-lang") as LanguageCode;
    const validLangs: LanguageCode[] = ["en", "hi", "es", "bn"];
    const finalLang = storedLang && validLangs.includes(storedLang) ? storedLang : "en";

    setCurrentLanguage(finalLang);
  }, []);

  // Function to change language programmatically
  const changeLanguage = useCallback((langCode: LanguageCode) => {
    if (langCode === currentLanguage) return;

    // 1. Persist to master store (LocalStorage)
    localStorage.setItem("the-khabar-lang", langCode);
    setCurrentLanguage(langCode);

    // 2. Clear state and reload
    if (langCode === "en") {
      window.location.reload();
    } else {
      window.location.reload();
    }
  }, [currentLanguage]);

  return {
    currentLanguage,
    changeLanguage,
  };
};

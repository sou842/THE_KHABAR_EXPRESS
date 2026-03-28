"use client";

import { useEffect, useState, useCallback } from "react";

export type LanguageCode = "en" | "hi" | "es" | "bn";

export const useGoogleTranslate = () => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to change language programmatically
  const changeLanguage = useCallback((langCode: LanguageCode) => {
    // 1. Set the cookie for persistence across reloads
    // Format: /source/target (e.g., /en/hi)
    const cookieValue = `/en/${langCode}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=.${window.location.hostname};`;
    
    // 2. Update localStorage for our internal UI state
    localStorage.setItem("preferred_language", langCode);
    setCurrentLanguage(langCode);

    // 3. Trigger the hidden Google Translate combo box change
    const googleCombo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (googleCombo) {
      googleCombo.value = langCode;
      googleCombo.dispatchEvent(new Event("change"));
    } else {
      // If combo isn't ready yet, we might need to reload or wait
      // But usually it's ready after initialization
      console.warn("Google Translate combo box not found.");
      // Fallback: Reload if selection changed and combo won't trigger
      if (langCode !== currentLanguage) {
        window.location.reload();
      }
    }
  }, [currentLanguage]);

  // Initialize language from localStorage/cookie
  useEffect(() => {
    const savedLang = localStorage.getItem("preferred_language") as LanguageCode;
    if (savedLang) {
      setCurrentLanguage(savedLang);
    }

    // Check if google object is ready
    const checkInterval = setInterval(() => {
      if (window && (window as any).google && (window as any).google.translate) {
        setIsInitialized(true);
        clearInterval(checkInterval);
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, []);

  return {
    currentLanguage,
    changeLanguage,
    isInitialized,
  };
};

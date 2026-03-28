"use client";

import Script from "next/script";
import { useEffect } from "react";
import Cookies from "js-cookie";

export const GoogleTranslateScript = () => {
  useEffect(() => {
    // 1. Sync localStorage to Cookie (Bridge logic)
    // This allows the rest of the app to be 100% cookie-free
    const storedLang = localStorage.getItem("the-khabar-lang");
    const gTrans = Cookies.get("googtrans");
    const currentCookieLang = gTrans?.split("/").pop()?.replace(/"/g, "");

    if (storedLang && storedLang !== "en") {
      if (currentCookieLang !== storedLang) {
        // Clear all variants first to be safe
        const hostname = window.location.hostname;
        Cookies.remove("googtrans", { path: "/" });
        Cookies.remove("googtrans", { path: "/", domain: hostname });
        Cookies.remove("googtrans", { path: "/", domain: "." + hostname });
        
        // Set the new cookie
        Cookies.set("googtrans", `/en/${storedLang}`, { path: "/" });
      }
    } else if (storedLang === "en" && gTrans) {
      const hostname = window.location.hostname;
      Cookies.remove("googtrans", { path: "/" });
      Cookies.remove("googtrans", { path: "/", domain: hostname });
      Cookies.remove("googtrans", { path: "/", domain: "." + hostname });
    }

    // 2. Initializer function for Google Translate
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,es,bn",
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };
  }, []);

  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }} />
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      <style jsx global>{`
        /* Hide Google Translate top banner */
        .goog-te-banner-frame.skiptranslate,
        .goog-te-gadget-icon,
        .goog-te-gadget-simple span,
        #goog-gt-tt,
        .goog-te-balloon-frame,
        .goog-tooltip,
        .goog-tooltip:hover {
          display: none !important;
        }

        .goog-text-highlight {
          background-color: transparent !important;
          box-shadow: none !important;
        }

        /* Hide "Translated to..." popup */
        #google_translate_element {
          display: none !important;
        }

        body {
          top: 0px !important;
        }
        
        /* General cleanup of Google Translate injected styles */
        .skiptranslate {
          display: none !important;
        }
        
        iframe.goog-te-banner-frame {
          display: none !important;
        }
      `}</style>
    </>
  );
};

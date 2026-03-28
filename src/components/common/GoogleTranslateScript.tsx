"use client";

import Script from "next/script";
import { useEffect } from "react";

export const GoogleTranslateScript = () => {
  useEffect(() => {
    // Initializer function for Google Translate
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          // Including Hindi, Spanish, and Bengali as requested
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

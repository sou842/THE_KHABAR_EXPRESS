"use client";

import Script from "next/script";

// The inline bridge script that runs SYNCHRONOUSLY before Google's script loads.
// This reads localStorage and syncs the googtrans cookie before Google can read it.
const BRIDGE_SCRIPT = `
  (function() {
    try {
      var lang = localStorage.getItem("the-khabar-lang");
      var hostname = window.location.hostname;

      // Helper to clear all possible cookie variants
      function clearCookie() {
        document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "googtrans=; path=/; domain=" + hostname + "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "googtrans=; path=/; domain=." + hostname + "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }

      if (lang && lang !== "en") {
        // Set the cookie so Google Translate sees it immediately on load
        clearCookie();
        document.cookie = "googtrans=/en/" + lang + "; path=/";
      } else {
        // No language preference or English — clear the cookie
        clearCookie();
      }
    } catch(e) {
      // localStorage not available (e.g., SSR or private mode)
    }
  })();
`;

export const GoogleTranslateScript = () => {
  return (
    <>
      {/* Bridge: runs synchronously BEFORE Google's script to sync localStorage → cookie */}
      <Script
        id="googtrans-bridge"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: BRIDGE_SCRIPT }}
      />

      {/* Google Translate initializer */}
      <Script
        id="google-translate-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.googleTranslateElementInit = function() {
              new google.translate.TranslateElement({
                pageLanguage: "en",
                includedLanguages: "en,hi,es,bn",
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
              }, "google_translate_element");
            };
          `,
        }}
      />

      <div id="google_translate_element" style={{ display: "none" }} />

      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />

      <style jsx global>{`
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

        #google_translate_element {
          display: none !important;
        }

        body {
          top: 0px !important;
        }

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

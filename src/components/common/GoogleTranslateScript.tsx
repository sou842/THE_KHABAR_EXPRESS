"use client";

import Script from "next/script";

// The inline bridge script that runs SYNCHRONOUSLY before Google's script loads.
// This reads localStorage and syncs the googtrans cookie before Google can read it.
const BRIDGE_SCRIPT = `
  (function() {
    try {
      var lang = localStorage.getItem("the-khabar-lang");
      var hostname = window.location.hostname;

      // Also compute root domain (e.g. "thekhabarexpress.com" from "www.thekhabarexpress.com")
      var parts = hostname.split('.');
      var rootDomain = parts.length > 2 ? parts.slice(-2).join('.') : hostname;

      // Helper to clear ALL possible cookie variants across every domain scope
      function clearAllCookies() {
        var expiry = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
        // Path only (current hostname)
        document.cookie = "googtrans=; path=/; " + expiry;
        // www subdomain
        document.cookie = "googtrans=; path=/; domain=" + hostname + "; " + expiry;
        document.cookie = "googtrans=; path=/; domain=." + hostname + "; " + expiry;
        // Root domain (catches cookies set on bare domain)
        document.cookie = "googtrans=; path=/; domain=" + rootDomain + "; " + expiry;
        document.cookie = "googtrans=; path=/; domain=." + rootDomain + "; " + expiry;
      }

      if (lang && lang !== "en") {
        // Clear all stale cookies first, then set the correct one
        clearAllCookies();
        document.cookie = "googtrans=/en/" + lang + "; path=/";
      } else {
        // No preference or English — clear everything
        clearAllCookies();
      }
    } catch(e) {
      // localStorage not available (SSR or private mode)
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

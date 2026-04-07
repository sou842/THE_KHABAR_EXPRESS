import { useEffect, useRef } from "react";
import { useCookiePreferences } from "@/hooks/useCookiePreferences";

interface AdUnitProps {
  /** AdSense client ID — defaults to the site's publisher ID */
  client?: string;
  /** The ad-slot ID from your AdSense dashboard */
  slot: string;
  /** Ad format — "auto" is recommended for responsive */
  format?: string;
  /** Whether to use full-width responsive scaling */
  fullWidthResponsive?: boolean;
  className?: string;
}

/**
 * A reusable Google AdSense ad unit component.
 * The global adsbygoogle.js script is already loaded in _app.tsx.
 */
export default function AdUnit({
  client = "ca-pub-5434867604639566",
  slot,
  format = "auto",
  fullWidthResponsive = true,
  className = "",
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const { preferences, isReady } = useCookiePreferences();

  useEffect(() => {
    if (!preferences?.advertising) {
      return;
    }

    // Only push once and only when the element is present in the DOM
    if (!pushed.current && adRef.current) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [preferences?.advertising]);

  if (!isReady || !preferences?.advertising) {
    return null;
  }

  return (
    <div className={`ad-unit my-8 text-center overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}

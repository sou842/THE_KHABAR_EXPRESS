import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "../contexts/AuthContext";
import { CookieConsentBanner } from "@/components/common/CookieConsentBanner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { CookieControlledScripts } from "@/components/common/CookieControlledScripts";
import GoogleAnalytics, { HookGoogleAnalytics } from "@/hooks/useGoogleAnalytics";
import { Inter, Outfit } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

const GoogleTranslateScript = dynamic(
  () =>
    import("@/components/common/GoogleTranslateScript").then(
      (mod) => mod.GoogleTranslateScript
    ),
  {
    ssr: false,
  }
);

import Script from "next/script";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const disableOptionalScripts = [
    "/privacy-policy",
    "/cookie-policy",
    "/cookie-settings",
  ].includes(router.pathname);

  return (
    <div className={`${inter.variable} ${outfit.variable} font-sans`}>
      <ErrorBoundary>
        <AuthProvider>
          <HookGoogleAnalytics />
          <GoogleTranslateScript />
        <Script
          id="adsense-id"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5434867604639566"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <CookieControlledScripts disableOptionalScripts={disableOptionalScripts} />
        <Toaster />
        <Sonner />
        <Component {...pageProps} />
        <CookieConsentBanner />
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
}

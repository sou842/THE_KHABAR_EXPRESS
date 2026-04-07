import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "../contexts/AuthContext";
import { CookieConsentBanner } from "@/components/common/CookieConsentBanner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { CookieControlledScripts } from "@/components/common/CookieControlledScripts";
import { GoogleTranslateScript } from "@/components/common/GoogleTranslateScript";
import GoogleAnalytics from "@/hooks/useGoogleAnalytics";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const disableOptionalScripts = [
    "/privacy-policy",
    "/cookie-policy",
    "/cookie-settings",
  ].includes(router.pathname);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <GoogleAnalytics />
        <GoogleTranslateScript />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5434867604639566"
          crossOrigin="anonymous"
        ></script>
        <CookieControlledScripts disableOptionalScripts={disableOptionalScripts} />
        <Toaster />
        <Sonner />
        <Component {...pageProps} />
        <CookieConsentBanner />
      </AuthProvider>
    </ErrorBoundary>
  );
}

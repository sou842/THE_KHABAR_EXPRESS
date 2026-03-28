import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Script from "next/script";
import { AuthProvider } from "../contexts/AuthContext";
import GoogleAnalytics from "@/hooks/useGoogleAnalytics";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <GoogleAnalytics />
        <Script 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5434867604639566"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <Toaster />
        <Sonner />
        <Component {...pageProps} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

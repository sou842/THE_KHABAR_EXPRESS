import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Script from "next/script";
import { AuthProvider } from "../contexts/AuthContext";
import GoogleAnalytics from "@/hooks/useGoogleAnalytics";
import ErrorBoundary from "@/components/ErrorBoundary";
import { GoogleTranslateScript } from "@/components/common/GoogleTranslateScript";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <GoogleAnalytics />
        <GoogleTranslateScript />
        <Toaster />
        <Sonner />
        <Component {...pageProps} />
      </AuthProvider>
    </ErrorBoundary>
  );
}
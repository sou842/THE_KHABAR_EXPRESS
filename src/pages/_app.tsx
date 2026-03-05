import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "../contexts/AuthContext";
import GoogleAnalytics from "@/hooks/useGoogleAnalytics";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <GoogleAnalytics />
        <Toaster />
        <Sonner />
        <Component {...pageProps} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

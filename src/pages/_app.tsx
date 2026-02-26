import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "../contexts/AuthContext";
import GoogleAnalytics from "@/hooks/useGoogleAnalytics";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <GoogleAnalytics />
      <Toaster />
      <Sonner />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";
import { getSiteUrl } from "@/lib/site";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "es", name: "Spanish (Español)" },
  { code: "bn", name: "Bengali (বাংলা)" },
  { code: "mr", name: "Marathi (मराठी)" },
];

const LANG_STORAGE_KEY = "the-khabar-express-lang";
const validLangCodes = languages?.map((l) => l.code);

export const LanguageSwitcher = ({ className }: { className?: string }) => {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState("en");

  useEffect(() => {
    if (!router.isReady) return;

    // URL is the source of truth for SEO; localStorage is a fallback
    const urlLang = router.query.lang as string | undefined;
    const storedLang = localStorage?.getItem(LANG_STORAGE_KEY);
    const resolved =
      (urlLang && validLangCodes?.includes(urlLang) ? urlLang : null) ??
      (storedLang && validLangCodes?.includes(storedLang) ? storedLang : "en");

    setCurrentLang(resolved);

    // Keep html[lang] in sync for screen readers + crawlers
    document.documentElement.lang = resolved;
  }, [router.isReady, router.query.lang]);

  const handleLanguageChange = (newLang: string) => {
    if (newLang === currentLang) return;

    localStorage.setItem(LANG_STORAGE_KEY, newLang);

    const url = new URL(window.location.href);
    if (newLang === "en") {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", newLang);
    }

    window.location.href = url.toString();
  };

  // Build hreflang URLs for all language variants
  const buildHreflangUrl = (code: string) => {
    // During SSR, we use the base site URL, which is safe for crawlers
    const siteUrl = getSiteUrl(); 
    
    let path = "";
    if (typeof window !== "undefined") {
      path = window.location.pathname + window.location.search;
    }
    
    const url = new URL(path || "/", siteUrl);
    
    if (code === "en") {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", code);
    }
    return url.toString();
  };

  return (
    <>
      {/* SEO: hreflang alternate links so search engines find all language versions */}
      <Head>
        {languages?.map((lang) => (
          <link
            key={lang?.code}
            rel="alternate"
            hrefLang={lang?.code}
            href={buildHreflangUrl(lang?.code)}
          />
        ))}
        {/* x-default points to the canonical/English version */}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={buildHreflangUrl("en")}
        />
      </Head>

      <div className="flex items-center gap-2">
        <Select value={currentLang} onValueChange={handleLanguageChange}>
          <SelectTrigger
            translate="no"
            aria-label="Select language"
            className={cn(
              "w-fit min-w-[130px] h-9 bg-white/10 text-gray-500 border-gray-300 rounded-full hover:bg-white/20 transition-all duration-200 notranslate",
              className
            )}
          >
            <div className="flex items-center gap-2 overflow-hidden pr-2">
              <Globe className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
              <SelectValue placeholder="Select Language" className="notranslate" />
            </div>
          </SelectTrigger>
          <SelectContent
            translate="no"
            align="end"
            className="bg-background border-border shadow-2xl z-[100] notranslate"
          >
            {languages?.map((lang) => (
              <SelectItem
                key={lang.code}
                value={lang.code}
                className="cursor-pointer hover:bg-accent focus:bg-gray-100 py-2.5 notranslate"
              >
                <span className="font-medium text-sm">{lang.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default LanguageSwitcher;
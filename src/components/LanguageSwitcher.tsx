"use client";

import React, { useEffect, useState } from "react";
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

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "es", name: "Spanish (Español)" },
  { code: "bn", name: "Bengali (বাংলা)" },
];

export const LanguageSwitcher = ({ className }: { className?: string }) => {
  const router = useRouter();
  const { pathname, query } = router;
  const [currentLang, setCurrentLang] = useState("en");

  // Sync with router state on mount and when query changes
  useEffect(() => {
    if (router.isReady) {
      // 1. Try route-based language (Priority for blogs)
      const routeLang = query.lang as string;
      if (routeLang) {
        setCurrentLang(routeLang);
        return;
      }

      // 2. Try cookie-based language (For home/non-localized pages)
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift();
      };

      const gTrans = getCookie("googtrans");
      if (gTrans) {
        const lang = gTrans.split("/").pop(); // e.g., /en/hi -> hi
        if (lang && ["hi", "es", "bn"].includes(lang)) {
          setCurrentLang(lang);
          return;
        }
      }

      // 3. Default to English
      setCurrentLang("en");
    }
  }, [query.lang, router.isReady]);

  const handleLanguageChange = (newLang: string) => {
    if (newLang === currentLang) return;

    console.log(`Switching language from ${currentLang} to ${newLang}`);

    // Case 1: Blog Pages
    // This matches both /blog/[id] and /[lang]/blog/[slug]
    if (pathname.includes("/blog/")) {
      const slug = query.id || query.slug;
      if (slug) {
        const targetPath = newLang === "en" ? `/blog/${slug}` : `/${newLang}/blog/${slug}`;
        console.log("Navigating to blog path:", targetPath);
        router.push(targetPath);
        return;
      }
    }

    // Case 2: Standard Fallback (Home, Categories, etc.)
    // We use a combination of route-based and cookie-based (for Google Translate legacy fallback)
    if (newLang === "en") {
      // Clear cookie for legacy widget
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/"; // Back to home or current path safely
    } else {
      // Set cookie for legacy widget and reload
      document.cookie = `googtrans=/en/${newLang}; path=/`;
      window.location.reload();
    }
  };

  return (
    <div translate="no" className="flex items-center gap-2">
      <Select value={currentLang} onValueChange={handleLanguageChange}>
        <SelectTrigger 
          className={cn(
            "w-fit min-w-[130px] h-9 text-gray-500 border-gray-200 hover:bg-gray-200 transition-all duration-200", 
            className
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            <Globe className="h-4 w-4 shrink-0 text-gray-500" />
            <SelectValue placeholder="Select Language" />
          </div>
        </SelectTrigger>
        <SelectContent align="end" className="bg-background border-border shadow-2xl z-[100]">
          {languages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className="cursor-pointer hover:bg-accent focus:bg-gray-100 py-2.5"
            >
              <span translate="no" className="font-medium text-sm">{lang.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;

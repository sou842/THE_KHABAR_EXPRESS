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
import Cookies from "js-cookie";

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

  // Sync with language cookie on mount
  useEffect(() => {
    if (router.isReady) {
      // 1. Try cookie-based language
      const gTrans = Cookies.get("googtrans");
      const cookieLang = gTrans?.split("/").pop()?.replace(/"/g, ""); 
      
      // Determine final target language
      const detectedLang = cookieLang || "en";
      const validLangs = ["en", "hi", "es", "bn"];
      const finalLang = validLangs.includes(detectedLang) ? detectedLang : "en";

      if (finalLang !== currentLang) {
        setCurrentLang(finalLang);
      }
    }
  }, [router.isReady, currentLang]);

  const handleLanguageChange = (newLang: string) => {
    if (newLang === currentLang) return;

    const hostname = window.location.hostname;
    const cookieOptions = { path: "/" };
    const domainOptions = { path: "/", domain: hostname };
    const dottedDomainOptions = { path: "/", domain: "." + hostname };

    if (newLang === "en") {
      // Aggressively clear all possible cookie variants
      Cookies.remove("googtrans", cookieOptions);
      Cookies.remove("googtrans", domainOptions);
      Cookies.remove("googtrans", dottedDomainOptions);
      
      // Force reload to clear Google Translate state
      window.location.href = window.location.pathname; 
    } else {
      // Clear first to avoid duplicates, then set the new one
      Cookies.remove("googtrans", cookieOptions);
      Cookies.remove("googtrans", domainOptions);
      Cookies.remove("googtrans", dottedDomainOptions);

      Cookies.set("googtrans", `/en/${newLang}`, cookieOptions);
      
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={currentLang} onValueChange={handleLanguageChange}>
        <SelectTrigger 
          translate="no"
          className={cn(
            "w-fit min-w-[130px] h-9 bg-white/10 text-gray-500 border-gray-300 rounded-full hover:bg-white/20 transition-all duration-200 notranslate", 
            className
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            <Globe className="h-4 w-4 shrink-0 text-gray-500" />
            <SelectValue placeholder="Select Language" className="notranslate" />
          </div>
        </SelectTrigger>
        <SelectContent 
          translate="no" 
          align="end" 
          className="bg-background border-border shadow-2xl z-[100] notranslate"
        >
          {languages.map((lang) => (
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
  );
};

export default LanguageSwitcher;

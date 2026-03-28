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
  const [currentLang, setCurrentLang] = useState("en");

  // Sync with language store on mount
  useEffect(() => {
    if (!router.isReady) return;

    // 1. Try LocalStorage (Primary persistence)
    const storedLang = localStorage.getItem("the-khabar-lang");
    
    // 2. Fallback to Cookie (Compatibility/Detect)
    const gTrans = Cookies.get("googtrans");
    const cookieLang = gTrans?.split("/").pop()?.replace(/"/g, "");

    const validLangs = ["en", "hi", "es", "bn"];
    const detectedLang = storedLang || cookieLang || "en";
    const finalLang = validLangs.includes(detectedLang) ? detectedLang : "en";

    // Update state to match our master store
    setCurrentLang(finalLang);
    
    // Sync cookie if it's missing but we have a stored preference (Recovery)
    if (finalLang !== "en" && !gTrans) {
      Cookies.set("googtrans", `/en/${finalLang}`, { path: "/" });
    }
  }, [router.isReady]);

  const handleLanguageChange = (newLang: string) => {
    if (newLang === currentLang) return;

    console.log(`Switching language to ${newLang} (localStorage persistent)`);

    // 1. Persist to master store (LocalStorage)
    localStorage.setItem("the-khabar-lang", newLang);

    // 2. Google Translate cookie sync logic
    const hostname = window.location.hostname;
    const cookieOptions = { path: "/" };
    const domainOptions = { path: "/", domain: hostname };
    const dottedDomainOptions = { path: "/", domain: "." + hostname };

    // Aggressively clear all possible cookie variants to avoid duplicates
    Cookies.remove("googtrans", cookieOptions);
    Cookies.remove("googtrans", domainOptions);
    Cookies.remove("googtrans", dottedDomainOptions);

    if (newLang === "en") {
      // Preserve query string when redirecting back to English
      window.location.href = window.location.pathname + window.location.search; 
    } else {
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
            <SelectValue
              placeholder="Select Language"
              className="notranslate"
            />
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
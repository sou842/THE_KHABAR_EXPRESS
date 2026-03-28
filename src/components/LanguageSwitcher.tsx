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

  // Sync with language cookie on mount
  // Fix #1: Removed `currentLang` from deps to prevent infinite re-render loop.
  // Fix #2: Removed unused `pathname` and `query` destructuring from router.
  useEffect(() => {
    if (!router.isReady) return;

    const gTrans = Cookies.get("googtrans");
    // The cookie value may come quoted (e.g. `"hi"`), so we strip quotes.
    const cookieLang = gTrans?.split("/").pop()?.replace(/"/g, "");
    const validLangs = ["en", "hi", "es", "bn"];
    const finalLang =
      cookieLang && validLangs.includes(cookieLang) ? cookieLang : "en";

    setCurrentLang(finalLang);
  }, [router.isReady]);

  const handleLanguageChange = (newLang: string) => {
    if (newLang === currentLang) return;

    const hostname = window.location.hostname;
    const cookieOptions = { path: "/" };
    const domainOptions = { path: "/", domain: hostname };
    const dottedDomainOptions = { path: "/", domain: "." + hostname };

    // Aggressively clear all possible cookie variants to avoid duplicates
    Cookies.remove("googtrans", cookieOptions);
    Cookies.remove("googtrans", domainOptions);
    Cookies.remove("googtrans", dottedDomainOptions);

    if (newLang === "en") {
      // Fix #3: Preserve query string when redirecting back to English
      window.location.href =
        window.location.pathname + window.location.search;
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
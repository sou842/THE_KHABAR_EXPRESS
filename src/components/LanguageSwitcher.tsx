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
  { code: "mr", name: "Marathi (मराठी)" },
];

export const LanguageSwitcher = ({ className }: { className?: string }) => {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState("en");

  // Sync with language store on mount
  useEffect(() => {
    if (!router.isReady) return;

    // Read from master store (LocalStorage)
    const storedLang = localStorage.getItem("the-khabar-lang");
    const validLangs = ["en", "hi", "es", "bn"];
    const finalLang = storedLang && validLangs.includes(storedLang) ? storedLang : "en";

    // Update state to match our master store
    setCurrentLang(finalLang);
  }, [router.isReady]);

  const handleLanguageChange = (newLang: string) => {
    if (newLang === currentLang) return;

    console.log(`Switching language to ${newLang} (URL + localStorage)`);

    // 1. Persist to master store (LocalStorage)
    localStorage.setItem("the-khabar-lang", newLang);

    // 2. Update URL with query param and reload
    const url = new URL(window.location.href);
    if (newLang === "en") {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", newLang);
    }
    
    // Redirect to the new URL (triggers a full reload)
    window.location.href = url.toString();
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
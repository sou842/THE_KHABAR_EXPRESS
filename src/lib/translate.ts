/**
 * Minimal translation utility for on-demand multilingual support.
 * In a real production environment, replace the mock implementation 
 * with Google Cloud Translation API or another service.
 */

export const SUPPORTED_LANGUAGES = ["en", "hi", "es", "bn"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

import { translateContent } from "./ai";

/**
 * Real-time AI translation function.
 * @param text The source text in English
 * @param targetLang The language code to translate to
 */
export async function translateText(text: string, targetLang: SupportedLanguage): Promise<string> {
  if (!text || targetLang === "en") return text;
  const trimmed = text.trim();
  if (!trimmed) return text;

  // CRITICAL: skip if text is a URL, email, or hex code to avoid breaking assets
  if (
    trimmed.startsWith("http://") || 
    trimmed.startsWith("https://") || 
    trimmed.startsWith("mailto:") ||
    trimmed.match(/^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/)
  ) {
    return text;
  }

  // Use professional AI translation
  return await translateContent(text, targetLang);
}

/**
 * Recursively translates strings within a complex object (like Editor.js data).
 * It preserves the JSON structure while translating all text values.
 */
export async function translateBody(body: any, targetLang: string): Promise<any> {
  const lang = targetLang as SupportedLanguage;
  if (!body || lang === "en") return body;

  // If it's a string, translate it
  if (typeof body === "string") {
    return await translateText(body, lang);
  }

  // If it's an array, translate each element
  if (Array.isArray(body)) {
    return await Promise.all(body.map((item) => translateBody(item, lang)));
  }

  // If it's an object, translate each property
  if (typeof body === "object" && body !== null) {
    const translatedObj: any = {};
    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        // We skip certain technical fields in Editor.js to avoid breaking structures
        const skipKeys = ["type", "time", "version", "level", "style", "file", "url", "link", "id", "thumbnail", "image"];
        if (skipKeys.includes(key)) {
          translatedObj[key] = body[key];
        } else {
          translatedObj[key] = await translateBody(body[key], lang);
        }
      }
    }
    return translatedObj;
  }

  return body;
}

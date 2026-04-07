export type CookiePreferences = {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
  updatedAt: string;
};

export const COOKIE_PREFERENCES_STORAGE_KEY = "the-khabar-cookie-preferences";
export const COOKIE_PREFERENCES_EVENT = "the-khabar-cookie-preferences-updated";

export const getDefaultCookiePreferences = (): CookiePreferences => ({
  necessary: true,
  functional: true,
  analytics: true,
  advertising: true,
  updatedAt: new Date().toISOString(),
});

const isBrowser = typeof window !== "undefined";

const clearCookie = (name: string) => {
  if (!isBrowser) return;

  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  const rootDomain = parts.length > 2 ? parts.slice(-2).join(".") : hostname;
  const expiry = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  const cookieTargets = [
    `${name}=; path=/; ${expiry}`,
    `${name}=; path=/; domain=${hostname}; ${expiry}`,
    `${name}=; path=/; domain=.${hostname}; ${expiry}`,
    `${name}=; path=/; domain=${rootDomain}; ${expiry}`,
    `${name}=; path=/; domain=.${rootDomain}; ${expiry}`,
  ];

  cookieTargets.forEach((value) => {
    document.cookie = value;
  });
};

const clearCookiesByPrefix = (prefixes: string[]) => {
  if (!isBrowser) return;

  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.trim().split("=")[0])
    .filter(Boolean);

  cookieNames.forEach((cookieName) => {
    if (prefixes.some((prefix) => cookieName.startsWith(prefix))) {
      clearCookie(cookieName);
    }
  });
};

export const normalizeCookiePreferences = (
  value?: Partial<CookiePreferences> | null
): CookiePreferences => {
  const defaults = getDefaultCookiePreferences();

  return {
    necessary: true,
    functional: value?.functional ?? defaults.functional,
    analytics: value?.analytics ?? defaults.analytics,
    advertising: value?.advertising ?? defaults.advertising,
    updatedAt: value?.updatedAt ?? defaults.updatedAt,
  };
};

export const readCookiePreferences = (): CookiePreferences => {
  if (!isBrowser) {
    return getDefaultCookiePreferences();
  }

  try {
    const rawValue = window.localStorage.getItem(COOKIE_PREFERENCES_STORAGE_KEY);
    if (!rawValue) {
      return getDefaultCookiePreferences();
    }

    const parsed = JSON.parse(rawValue) as Partial<CookiePreferences>;
    return normalizeCookiePreferences(parsed);
  } catch {
    return getDefaultCookiePreferences();
  }
};

export const hasSavedCookiePreferences = () => {
  if (!isBrowser) return false;

  try {
    return Boolean(window.localStorage.getItem(COOKIE_PREFERENCES_STORAGE_KEY));
  } catch {
    return false;
  }
};

export const applyCookiePreferences = (preferences: CookiePreferences) => {
  if (!isBrowser) return;

  if (!preferences.functional) {
    window.localStorage.removeItem("the-khabar-lang");
    clearCookie("googtrans");
  }

  if (!preferences.analytics) {
    clearCookie("_ga");
    clearCookie("_gid");
    clearCookie("_gat");
    clearCookiesByPrefix(["_ga", "_gat"]);
  }

  if (!preferences.advertising) {
    clearCookie("_gcl_au");
    clearCookie("__gads");
    clearCookie("__gpi");
    clearCookie("__eoi");
    clearCookie("FCNEC");
    clearCookie("FPAU");
    clearCookie("FCCDCF");
    clearCookie("IDE");
    clearCookie("test_cookie");
  }
};

export const saveCookiePreferences = (
  value: Omit<CookiePreferences, "necessary" | "updatedAt">
) => {
  if (!isBrowser) return getDefaultCookiePreferences();

  const nextValue = normalizeCookiePreferences({
    ...value,
    updatedAt: new Date().toISOString(),
  });

  window.localStorage.setItem(
    COOKIE_PREFERENCES_STORAGE_KEY,
    JSON.stringify(nextValue)
  );

  applyCookiePreferences(nextValue);
  window.dispatchEvent(new CustomEvent(COOKIE_PREFERENCES_EVENT, { detail: nextValue }));

  return nextValue;
};

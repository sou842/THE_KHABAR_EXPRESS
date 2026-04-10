const DEFAULT_SITE_URL = "https://thekhabarexpress.com";

export function normalizeSiteUrl(siteUrl?: string | null) {
  const fallback = DEFAULT_SITE_URL;
  const value = siteUrl?.trim() || fallback;

  return value.replace(/\/+$/, "");
}

export function getSiteUrl() {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

export function buildSiteUrl(path = "") {
  if (!path) {
    return getSiteUrl();
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export { DEFAULT_SITE_URL };

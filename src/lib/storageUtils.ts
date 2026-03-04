/**
 * Set data in localStorage with an expiry time.
 * @param key The key to store the data under.
 * @param value The value to store.
 * @param ttlDays Time to live in days.
 */
export const setWithExpiry = (key: string, value: any, ttlDays: number) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttlDays * 24 * 60 * 60 * 1000,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

/**
 * Get data from localStorage, checking for expiry.
 * @param key The key to retrieve data from.
 * @returns The value if not expired, otherwise null.
 */
export const getWithExpiry = (key: string) => {
  if (typeof window === "undefined") return null;
  
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    
    // Safety check for expected structure
    if (!item || typeof item.expiry !== 'number') {
      localStorage.removeItem(key);
      return null;
    }

    const now = new Date();
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.error("Error parsing stored item:", error);
    return null;
  }
};

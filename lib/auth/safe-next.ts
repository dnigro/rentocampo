/** Only same-origin paths may be used after authentication. */
export function safeAuthNext(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value || value.length > 2048 || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const decoded = decodeURIComponent(value);
    if (/[\\\u0000-\u001f\u007f]/.test(value) || /[\\\u0000-\u001f\u007f]/.test(decoded) || decoded.startsWith("//")) return fallback;
    const url = new URL(value, "https://auth.invalid");
    if (url.origin !== "https://auth.invalid" || url.pathname.startsWith("//")) return fallback;
    return url.pathname + url.search + url.hash;
  } catch { return fallback; }
}

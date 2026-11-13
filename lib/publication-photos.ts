/** Preserve uploaded photos, remove duplicates, and keep the existing eight-photo limit. */
export function publicationPhotos(primary: string | null | undefined, additional: unknown): string[] {
 return Array.from(new Set([primary, ...(Array.isArray(additional) ? additional : [])].filter((url): url is string => typeof url === "string" && url.trim().length > 0))).slice(0, 8);
}

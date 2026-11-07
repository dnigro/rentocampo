/**
 * Browser-supplied filenames and extensions are untrusted.
 * Use an allowlist and derive stored extensions from the declared MIME type.
 * Storage bucket limits provide another layer of enforcement.
 */
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/heic": "heic",
  "image/heif": "heif",
};

export function safeImageExtension(file: File, maxBytes: number): string | null {
  if (!Number.isFinite(file.size) || file.size < 1 || file.size > maxBytes) return null;
  return EXTENSIONS[file.type.toLowerCase()] ?? null;
}

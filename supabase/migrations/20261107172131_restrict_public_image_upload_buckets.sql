-- Applied in production on 2026-11-07; source-controlled history.
UPDATE storage.buckets
SET file_size_limit = 4194304,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/avif','image/heic','image/heif']::text[]
WHERE id = 'avatars';
UPDATE storage.buckets
SET file_size_limit = 8388608,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/avif','image/heic','image/heif']::text[]
WHERE id = 'campos-fotos';

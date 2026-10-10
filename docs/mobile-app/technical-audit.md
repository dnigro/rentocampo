# Auditoría de compatibilidad móvil — 10/10/2026

## Hallazgos verificados en main
- Next.js 16.3.5 / React 19.3 / @supabase/ssr 0.10.3.
- `proxy.ts` usa cookies SSR para sesión y redirige rutas protegidas.
- `app/auth/confirm/route.ts` confirma OTP en servidor y reenvía PKCE a `/auth/callback`.
- `components/analytics/GoogleAnalytics.tsx` limita GA4 al hostname productivo: un shell nativo no reportará automáticamente eventos a esta propiedad.
- `next.config.ts` aplica CSP y configura recursos de Supabase y OpenStreetMap.
- No se encontró Capacitor ni manifiesto PWA en ubicaciones convencionales.
- `public/logo-rentocampo-rc.svg` contiene una versión anterior con amarillo; NO asumir que es el último logo RC aprobado.

## Riesgos / acciones
1. **SSR**: no habilitar `output: "export"` global. API routes, proxy y cookies de sesión dependen del servidor.
2. **Sesión**: definir estrategia nativa con almacenamiento seguro, PKCE y deep links; probar login, signup, reset y confirmación.
3. **Shell**: realizar prototipo aislado para determinar si Capacitor puede usar un cliente móvil dedicado y las APIs existentes. Comparar con Expo.
4. **Mapas y fotos**: validar geolocalización, permisos, cámara/galería, subida a Supabase y enlaces externos.
5. **Mensajes**: validar notificaciones, reconexión y permisos; no prometer push hasta tener APNs/FCM configurados.
6. **Mercado Pago**: auditar checkout actual en contexto móvil y reglas de tiendas antes de activarlo.
7. **Analítica**: Firebase Analytics para apps con eventos y dimensiones de país; GA4 web queda independiente; no mezclar sesiones web con app.
8. **Marca**: solicitar/ubicar archivo definitivo RC blanco y negro antes de generar assets de tienda.

## Puertas de calidad
- Ningún cambio a `main` ni Vercel sin preview, lint/build y revisión.
- No crear usuarios, credenciales, secretos, pagos o cambios en Supabase.
- Mantener UY deshabilitado.
- No agregar banners de descarga antes de tener enlaces oficiales.

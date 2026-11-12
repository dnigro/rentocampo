# RentoCampo V3 — Dirección de producto y diseño (aprobada)

Estado: diseño visual aprobado, implementación pendiente de auditoría y validación por etapas.
Rama: `feature/rentocampo-v3`. Base: `main`.

## Objetivo
Renovar integralmente la experiencia comercial con una estética inspirada en Airbnb, adaptada al mercado rural. Conservar identidad RentoCampo, usuarios, datos, publicaciones, fotografías, mensajes, integraciones, SEO y operaciones existentes.

## Principios visuales
- Identidad: escudo RC oficial; azul marino, blanco y grises; fotografía rural real, tipografía clara, tarjetas con bordes suaves y sombras discretas.
- Inicio: hero rural de alto impacto, lema «El campo. Sin vueltas.», buscador central (qué buscás, ubicación, aptitud), categorías visuales y publicaciones destacadas.
- Explorador: lista de fichas y mapa en una misma vista; filtros por operación, aptitud, provincia, hectáreas y precio; interacción bidireccional ficha↔marcador.
- Detalle: galería de hasta ocho fotos, datos verificables, ubicación, precio, contacto directo y favorito; evitar valores ilustrativos en producción.
- Mi RentoCampo: tablero con mis publicaciones, mensajes, favoritos, perfil y configuración; misma identidad visual que la parte pública.
- Servicios rurales y productores: mismos patrones de búsqueda, tarjetas y detalles, con atributos específicos.
- Responsive: desktop dividido, tablet adaptable, móvil con alternancia accesible lista/mapa y filtros compactos.
- País e idioma: preservar países, traducciones y SEO localizado; no hardcodear AR como único mercado.

## Auditoría de arquitectura — hallazgos confirmados por código
- Next.js 16.4.5, React 19, TypeScript, App Router.
- Supabase SSR: `lib/supabase/client.ts`, `lib/supabase/server.ts`; sesiones y protección de rutas en `proxy.ts`.
- Mapas: Leaflet; correo: dependencia Resend; analítica: componente GoogleAnalytics.
- SEO por país y estado real de publicaciones en `app/(public)/campos/page.tsx`.
- Seguridad: CSP y cabeceras en `next.config.ts`.
- Cron: `/api/cron/plan-expiry` en `vercel.json`.
- CSS global acumulado: múltiples capas importadas desde `app/layout.tsx`; requiere aislamiento de estilos V3.

## Pendientes de auditoría (NO dar por verificados)
1. Inventario completo de rutas, componentes y dependencias; matriz de funcionalidades por perfil y país.
2. Esquema de tablas, RLS, storage y funciones de Supabase; la lectura de tablas falló por credenciales de solo lectura.
3. Integraciones OAuth, Resend, Analytics, Metricool, Search Console y Vercel: revisar configuración y pruebas funcionales sin revelar secretos.
4. Formularios, registro, login, recuperación, publicación/edición/eliminación, favoritos, chat y notificaciones.
5. Pruebas de accesibilidad, performance, SEO y comportamiento en móvil, tablet y desktop.

## Restricciones de seguridad y despliegue
- No modificar `main`, producción ni esquema/datos de Supabase durante la fase de diseño.
- No borrar tablas, cuentas, buckets, publicaciones, fotos ni conexiones.
- No copiar datos personales de producción a entornos públicos de prueba.
- Implementar sobre rama independiente y publicar únicamente Preview, previa comprobación de aislamiento UAT.
- Verificar lint, tests, build y recorridos de usuario antes de solicitar aprobación para producción.
- Mantener plan de rollback y URLs canónicas/redirects existentes.

## Secuencia
A. Auditoría de funcionalidades e integraciones y mapa de rutas.
B. Sistema de diseño y prototipo de inicio, explorador, detalle, servicios y cuenta.
C. Validación visual y funcional en Preview.
D. Implementación gradual por componentes, con regresión automatizada.
E. Lanzamiento controlado únicamente con aprobación explícita.

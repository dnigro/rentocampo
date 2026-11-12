# Revisión V3 del catálogo — 12 de noviembre de 2026

## Alcance y base

Rama `codex/rentocampo-v3-review-20261112`, desde `feature/rentocampo-v3` (`48d8606`). Se inspeccionaron `main` (`284bda2`), la rama V3 y `feature/rentocampo-next-day1` (`17863d0`). Stack confirmado: Next.js 16.4.5, React 19, TypeScript, Supabase SSR y Leaflet.

Esta entrega mejora la implementación V3 existente. **La misión completa todavía no está lista para revisión comercial**: el panel V3 sigue siendo una demostración de solo lectura, y faltan las pruebas autenticadas, CRUD, contacto, OAuth y el acceso al Preview protegido.

## Cambios implementados

- En las dos ramas V3 autorizadas, exclusivamente con `VERCEL_ENV=preview`, `/campos` y `/lite/campos` sirven el catálogo integrado. Las rutas antiguas `/campos/mapa` y `/lite/campos/mapa` redirigen temporalmente conservando los parámetros. Producción y otras ramas mantienen su comportamiento.
- Formularios de búsqueda con `next/form`, navegación cliente y estado de carga.
- Fichas de campos y enlace de regreso conservan país y filtros mediante el serializador existente.
- Navegación principal, móvil, pie y categorías reutilizan `RegionalLink` para conservar país. Home V3 resuelve `pais` desde la URL y conserva el lema solicitado «Todo el campo. En un lugar.».
- Títulos completos en tarjetas; menú móvil dentro del viewport; controles de zoom separados del rótulo del mapa.
- Los marcadores vuelven a tener área clickeable: se neutraliza el `max-width` heredado que los colapsaba a cero.
- En móvil, seleccionar un marcador muestra su ficha debajo del mapa sin ocultarlo. Fallos de carga de mapas muestran un estado recuperable y mantienen disponible el listado.
- Tests de rutas y serialización ejecutables; recorrido de navegador de solo lectura en `tests/v3-browser.mjs`.

## Validación ejecutada

| Control | Resultado |
|---|---|
| `npm ci` con lockfile, Node 24 / npm 11 | Aprobado; fue necesario configurar explícitamente el proxy de npm |
| `npm run lint` | Aprobado, cero warnings |
| `npm test` | 148 aprobados, cero fallos |
| `npx tsc --noEmit` | Aprobado |
| Build con variables de Preview de la nueva rama | Aprobado |
| Chromium, catálogo conectado a Supabase UAT | HTTP 200; una publicación sintética disponible |
| Responsive | 320, 360, 375, 390, 430, 768, 1280, 1440 y 1920 px sin desborde; menú dentro del viewport |
| Navegación | Detalle/regreso, país BR entre catálogos, rutas antiguas y App Lite: aprobado |
| Mapa móvil | Marcador clickeable, ficha seleccionada y mapa visibles: aprobado |
| Home, servicios, Mi RentoCampo | Rutas locales HTTP 200; no acredita funciones autenticadas |
| Errores JavaScript | Ningún `pageerror` en el recorrido |
| Escrituras de pruebas | Ninguna; solicitudes mutantes del navegador hacia Supabase bloqueadas por el runner |

Las capturas se inspeccionaron durante la sesión. El navegador recibió errores de certificado del proxy para recursos externos y abortos de tiles al cambiar de ruta. Se verificaron marcadores, controles y estado de error, **no se acredita la cartografía externa completa ni Analytics en este entorno**. No se deshabilitó TLS para sortear el problema. No se midieron Core Web Vitals ni se ejecutó un auditor automático de contraste/accesibilidad; se revisaron controles, roles y foco por código y navegador.

### Repetir el recorrido

Configurar localmente `.env.local` con la URL y clave pública de `rentocampo-uat` (archivo ignorado por Git). No usar credenciales productivas ni claves administrativas.

```sh
VERCEL_ENV=preview VERCEL_GIT_COMMIT_REF=codex/rentocampo-v3-review-20261112 npm run dev
# En otra terminal con Playwright y Chromium disponibles:
node tests/v3-browser.mjs
```

Variables opcionales: `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`, `V3_TEST_URL`, `V3_EVIDENCE_DIR`. El runner necesita la publicación sintética AR/Santa Fe existente en UAT. No crea ni elimina registros. El uso local de `NODE_USE_ENV_PROXY=1` puede ser necesario según la red.

## Supabase: auditoría de solo lectura

Se identificó `rentocampo-uat` (`wibqszhvuvpjycheaxzi`), separado del proyecto integrado a producción. Las consultas REST públicas a campos y servicios respondieron; la inspección SQL de tablas falló por autenticación de `supabase_read_only_user`, por lo que no se acredita una auditoría completa de políticas.

Advisors de seguridad de UAT:

- `publication_security_events`: RLS habilitado sin políticas (INFO). Puede ser intencional para acceso exclusivamente del backend; no se agregaron permisos. [Guía](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- RPC `delete_own_account`: ejecutable por usuarios autenticados con `SECURITY DEFINER` (WARN). Revisar antes de probar eliminación; no se invocó. [Guía](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- Protección de contraseñas filtradas deshabilitada (WARN). El otro proyecto devolvió únicamente esta advertencia en su advisor de seguridad. [Guía](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

No se aplicaron migraciones ni cambios de configuración, usuarios o datos en ninguno de los proyectos.

## Bloqueos y pendientes

- Vercel lista el equipo RentoCampo, pero no devuelve proyectos; consultar el ID conocido de `rentocampo` o abrir el Preview con el conector devuelve 404. Se necesita acceso al proyecto para inspeccionar el deployment protegido. No se crearon proyectos alternativos, dominios ni credenciales.
- El Preview de la rama base estaba Ready según el bot del PR #371. Ese estado no valida los cambios nuevos ni sustituye las pruebas del deployment de esta rama.
- Los formularios privados existentes no se migraron al panel demostrativo V3. Login, registro, recuperación, verificación de email, Google, escritura, imágenes y mensajes requieren pruebas aisladas y configuración UAT verificable. No se enviaron correos.
- La paridad validada de App Lite corresponde al catálogo compartido y su ruta antigua; no implica validación integral del resto de `/lite/**`.
- Internacionalización integral V3, detalle de servicios con filtros de regreso, contacto directo, SEO de transición y medición de rendimiento siguen pendientes.

**Sin merge a `main`, sin deployment Production y sin cambios en datos reales.**

# RentoCampo App — etapa 0: arquitectura y criterios de salida

Estado: propuesta técnica para revisión. No publicar en producción ni en tiendas.

## Objetivo
Lanzar Android (Google Play) e iOS (App Store) reutilizando el repositorio dnigro/rentocampo, Supabase y los flujos existentes. Argentina primero; Uruguay permanece deshabilitado.

## Diagnóstico inicial (10/10/2026)
- Web: Next.js 16 / React 19; backend Supabase.
- No se encontró app/manifest.ts ni public/manifest.json.
- app/layout.tsx define favicon SVG y metadatos, pero no manifiesto instalable.
- next.config.ts establece CSP estricta: revisar cualquier SDK móvil antes de modificarla.
- La app depende de renderizado y rutas servidor de Next.js: NO asumir que Capacitor puede empaquetar la web con static export sin refactor.
- Identidad: usar el último RC aprobado y la palabra rentoCampo en blanco y negro. No recrear el logo desde cero.

## Decisión técnica pendiente
Realizar spike de compatibilidad antes de seleccionar el shell móvil:
1. Evaluar Capacitor con frontend móvil dedicado dentro del mismo monorepo, reutilizando módulos y APIs; contrastar con React Native/Expo si el acoplamiento SSR o revisión de tiendas lo exige.
2. Verificar autenticación y recuperación de contraseña (deep links), permisos de cámara/galería, mapas, mensajería, notificaciones y pagos.
3. Confirmar que el producto aporte experiencia móvil real; no entregar un simple WebView.
4. No añadir paquetes, claves, cuentas ni modificar producción antes de pruebas.

## Entregables por etapas
- E1: auditoría de rutas, dependencias, autenticación y API; ADR de tecnología móvil.
- E2: shell Android/iOS y navegación, fichas, mapas, favoritos, registro, mensajería.
- E3: QA, seguridad, privacidad, consentimiento y pruebas en dispositivos.
- E4: Firebase Analytics (first_open, app_open, screen_view, view_item, contact_intent, sign_up), Crashlytics; medir clics web a tiendas separadamente de instalaciones.
- E5: cuentas comerciales de tiendas y correo de marca; enlaces de descarga solo cuando existan URL verificadas.

## Guardarraíles
- Mantener un solo repositorio y una sola base Supabase; sin migraciones destructivas.
- No exponer credenciales ni datos privados.
- No activar Uruguay, ni alterar Mercado Pago AR.
- No cambiar landing ni producción sin preview, pruebas y aprobación.
- La marca final debe usar assets originales verificados, no un logo provisional.

## Criterios de aceptación para iniciar implementación
- Flujo de login, registro, imágenes, mapa, detalle, contacto y chat documentados.
- Tecnología seleccionada con prueba en Android e iOS.
- Estrategia de notificaciones, deep links y analítica acordada.
- Riesgos de revisión de Google Play/App Store identificados.

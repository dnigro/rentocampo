# RentoCampo Brasil — revisión inicial, 19/10/2026

Estado: base regional implementada en rama de trabajo. No desplegada en producción.

## Implementado

- Código BR, locale pt-BR, moneda BRL, centro del mapa y 26 estados + Distrito Federal.
- La fuente de países es compartida por formularios, tipos, métricas gerenciales y contrato de analítica móvil.
- El formulario ofrece BRL y lo usa por defecto al iniciar una publicación brasileña.
- Migración para perfiles, campos, servicios, demos y trigger de alta, aplicada solo a rentocampo-uat.
- La rama de preview entra en la protección UAT existente.
- Mercado Pago permanece exclusivo para cuentas AR.

## Evidencia de esta etapa

- `npm run lint`: OK.
- `npm run build`: OK con configuración ficticia de CI; no acredita conexión real ni recorridos de usuario.
- `node --test tests/regional-navigation.test.mjs tests/commercial-filters.test.mjs`: 26/26 OK.
- `tests/brazil-database.sql`: OK en UAT. Verifica trigger de perfil BR y rol prestador, inserción de campo BR/BRL, inserción de servicio BR y rechazo de país inválido. Usa rollback y no deja cuentas o publicaciones.
- La prueba SQL usa privilegios administrativos; no reemplaza pruebas de RLS, Auth por HTTP ni navegador.

## Pendiente antes de lanzar BR

1. Localización pt-BR de home, navegación, registro, login, recuperación, perfil, formularios, fichas, filtros, mapas, contacto y App Lite. La mayoría del texto está embebida en componentes; el locale de país no traduce la UI.
2. Idioma HTML, metadatos y URLs/canonical regionales; continuidad de país al navegar y después de Auth. Probar acceso directo con `?pais=BR`, cookie y cambio de mercado.
3. Mensajes y correos de aplicación en portugués, incluyendo aviso de paquetes todavía no habilitados. Mantener cobros argentinos sin cambios.
4. Preparar campo y servicio DEMO de Brasil con las imágenes aprobadas, claramente identificados como DEMO.
5. Extender las pruebas UAT de navegador a Brasil en móvil, escritorio y Lite: registro/confirmación/login, recuperación, alta/edición/baja con fotos, listados/mapas/fichas, contacto y aislamiento entre cuentas. Hay aserciones históricas en `tests/regional-integration.mjs` que aún tratan CL como no admitido: corregirlas antes de reutilizar esa suite.
6. Verificar variables específicas de esta rama en Vercel antes de usar el preview. No heredar credenciales de producción para pruebas.
7. Tras UAT completo, aplicar la migración revisada a producción, desplegar el commit probado y comprobar el dominio rentocampo.com. La autorización del usuario para este objetivo ya está dada; falta completar la implementación y la evidencia.

No se ha habilitado BR al público ni se presenta esta base como una versión portuguesa terminada.

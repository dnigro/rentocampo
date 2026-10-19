# Brasil pt-BR — avance en PR #232 (19/10/2026)

## En rama de preview
- Selector BR con persistencia de país/idioma; no fuerza la navegación al mapa.
- Home completa y CTA identificables en los tres paneles del tríptico. Labels regionales: Ver terras, Sou produtor, Ver serviços.
- Primer catálogo central de 95 claves (es y pt-BR); páginas de registro, login, recuperación, confirmación de correo, reseteo de clave.
- Listados de campos y servicios, filtros, fichas de campo/servicio, mapa y tarjetas, consulta y conversaciones, perfil, dashboard y gestión básica de avisos.
- Formularios de alta de campos y servicios con textos en portugués; se mantienen las claves de negocio sin traducir en la base (alquiler, venta, etc.). Brasil por defecto usa BRL.
- App Lite: home, header, exploración principal, partes de registro/perfil y confirmaciones.
- Planes argentinos y su checkout NO están habilitados para Brasil. Se ofrece el primer anuncio gratis y se muestra un aviso regional.
- Pruebas de regresión de idiomas, ruta, acciones, moneda y cobro incorporadas al workflow GitHub Quality.
- Producción no modificada.

## Pendiente antes de aprobar lanzamiento
1. Recorrer **todas** las rutas secundarias y widgets restantes: versiones profundas Lite, edición/baja de todos los perfiles, detalle de conversaciones, contenido comercial, ayudas e indicadores.
2. Traducción legal de términos y condiciones para el mercado BR (revisión jurídica local), mensajes transaccionales/emails y metadatos SEO pt-BR/hreflang/canonical. No traducir en automático los títulos/descripciones escritos por usuarios.
3. Demos BR (campo y servicio) con imágenes aprobadas y datos UAT.
4. UAT real desktop/mobile/Lite: alta/confirmación/login, recuperación, publicar/editar/fotos/baja, mapas, consultas, aislamiento de Auth y RLS. Lint+build unitarios no cubren estos escenarios.
5. Verificar que preview Vercel use **únicamente** claves UAT de Supabase; nunca credenciales de producción ni pasar a producción sin revisión.

PR #232 permanece en borrador. No autoriza merge a producción.


## Ajuste de autenticación y CTA del 19/10
- CTA de los tres paneles y registrarse se mantienen como botones sin flechas.
- El preview de Brasil requiere variables Vercel de alcance exclusivo a la rama BR, incluidas NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY y el testigo UAT_SUPABASE_PUBLISHABLE_KEY.
- Guard de build aborta si la clave pública heredada no coincide con la clave UAT exclusiva de la rama, aun cuando tenga formato correcto. No se ha configurado service-role UAT y el build la elimina si no pertenece al proyecto de pruebas.
- No se cambian las variables del entorno de producción. Una cuenta de producción no puede usarse para ingresar en Supabase UAT: hace falta usuario de pruebas.

# RentoCampo Next — Criterios de primera revisión y UAT

## Aislamiento
- Rama exclusiva: `feature/rentocampo-next-day1`.
- Rutas exclusivas: `/next`, `/next/campos`, `/next/campos/[id]`, `/next/servicios`, `/next/servicios/[id]`, `/next/cuenta`.
- No modificar `main`, dominios productivos, base de datos, políticas RLS ni migraciones.
- El acceso desde Next a fichas antiguas o flujos de cuenta es temporal y **no implica que esos flujos estén rediseñados**.

## Criterios de aceptación de primera vista conjunta
1. Home blanco, minimalista, fotos grandes, buscador protagonista, navegación compacta.
2. Móvil 360/390/430 px, tablet 768 px y desktop 1280/1440 px sin desbordes.
3. Catálogos con datos auténticos; cero fichas demo presentadas como ofertas reales.
4. Estados vacíos, errores de lectura, imágenes ausentes y botones con destinos reales.
5. Navegación completa desde Home a catálogo y ficha, y regreso.
6. Diseño de mapa y listado en una única experiencia antes de cerrar la revisión visual.
7. No declarar el sitio listo mientras haya fallos de build o rutas incompletas.

## UAT — solo después de la primera vista aprobada
- Conexión a entorno UAT independiente, nunca reutilizar credenciales de producción para escrituras.
- Registrar, iniciar sesión y recuperar contraseña.
- Publicar/editar/eliminar campos y servicios de prueba.
- Cargar fotos, validar favoritos, mensajería y perfiles.
- Probar roles, permisos, países, idiomas y responsive.
- Verificar accesibilidad, SEO, rendimiento y ausencia de errores de consola.
- Exigir build verde y pruebas manuales antes de considerar un merge.

## Estado de esta rama
La implementación visual es parcial. No autorizar merge ni UAT sin completar el checklist y obtener aprobación explícita del usuario.

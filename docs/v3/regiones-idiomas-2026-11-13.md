# Regiones propias por país y continuidad de idiomas

## Resultado

Se recupera el módulo existente de regiones productivas en campos y servicios de V3, también en sus alias web y Lite. Se reutilizan `DemandaZonasPanel` y los datos editoriales de `REGIONES_PRODUCTIVAS`: 19 países, cuatro regiones propias por país, con subdivisión, actividad y enlace de publicación que conserva país y zona. No se reemplazan los datos por ejemplos argentinos ni se presentan como demanda comercial verificada.

El home incorpora el mismo módulo plegado, para mantener su longitud. El tipo de publicación del bloque sigue la selección Campos/Servicios del explorador. Los catálogos muestran el panel completo antes del footer. Estilo y tipografía se ajustan al marco V3; se usan iconos Lucide para las flechas en lugar de depender de un glifo tipográfico.

Los accesos del Preview van a las rutas de publicación existentes, protegidas por ingreso. El componente conserva su comportamiento previo fuera de esta variante. SiteLink mantiene la superficie Lite cuando corresponde; las comprobaciones de permisos continúan en las rutas y handlers existentes.

## Idiomas

Se conserva el sistema interno de internacionalización, sin instalar otro traductor: español por defecto, portugués para Brasil e inglés para Estados Unidos. No se introduce detección automática del idioma del navegador ni una preferencia de idioma independiente del país.

- El hook de país ahora observa también cambios de `?pais=` en la misma ruta, además de navegación, cookies y eventos de país. Persistencia opcional en localStorage protegida ante restricciones del navegador.
- Se completan textos de V3 en filtros de campos/servicios, estados vacíos, cuenta, detalle de campo, controles de galería, etiquetas accesibles y errores de mapa mediante el catálogo de UI compartido.
- Se usan los formatos numéricos del país para precios y superficies.
- Títulos, descripciones, direcciones y demás contenido publicado por usuarios no se traducen ni se modifican. El contenido legal existente conserva su versión original.

## Evidencia

- 171 tests Node, lint sin warnings y build local de Preview aprobados. Se mantienen pruebas de acceso al reporte gerencial; se aísla la traducción en ese test de autorización.
- Contrato de datos: cuatro regiones con zona/subdivisión/actividad para cada uno de los 19 países.
- 38 páginas servidor verificadas: campos y servicios de todos los países, HTTP 200 y cuatro tarjetas regionales.
- Web desktop / Web móvil / App Lite: módulos de AR, BR, US y MX en campos y servicios a 320, 390 y 1440 px, sin desbordes; región local, idioma y país/zona en enlaces comprobados.
- Home: regiones inicialmente plegadas y tipo de CTA actualizado al seleccionar Servicios.
- Cambio de idioma en /login al modificar solo la query AR → BR → US: español/portugués/inglés y atributo lang correctos, con email escrito conservado.
- Regresión de integración de auth/cuenta/legal/Lite en 13 rutas aprobada. Sin errores JavaScript ni escrituras Supabase, envíos de correo o cambios de usuarios.

La entrega permanece en Preview y PR Draft. No se hace merge a main ni se despliega en Production. Las pruebas de autenticación con sesión real, nuevos correos de recuperación, guardado de perfil y reporte real siguen pendientes como se documentó en la auditoría previa.

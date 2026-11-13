# Ajustes de mapa, header y referencias DEMO

## Cambios

- Header simplificado siguiendo producción: logo oficial vectorial, Campos, Servicios rurales, selector de país, ingreso/cuenta y mensajes/salida según sesión. Menú móvil y selector permanecen accesibles a 320 px.
- Hero claro de mayor impacto, foto de ganado en gris a sangre con corte diagonal, lema destacado, beneficios y accesos a explorar/publicar. Conserva «Todo el campo. En un lugar.».
- Eliminado el scroll interno de resultados: una sola rueda mueve el documento. También se quitan el centrado automático de fichas y el paneo del mapa provocado por hover/selección.
- Controles de ampliar/restaurar, acercar y alejar en la esquina superior derecha. Expansión nativa cuando está disponible, alternativa CSS, Escape para volver y conservación de vista. La rueda sigue sin hacer zoom accidental.
- Regiones productivas visibles en el home, además de campos y servicios; ya no permanecen plegadas.

## Causa y restauración de DEMOs

La consulta anterior descartaba campos DEMO de forma explícita y no leía la tabla dedicada `demo_servicios_rurales`. Se restauran los campos activos y las referencias aprobadas de esa tabla, conservando país y filtros. Los registros reales se priorizan y las DEMOs se identifican en tarjeta y mapa; las tarjetas explican que no son ofertas reales. Sus enlaces llevan al flujo protegido de publicación, nunca al contacto con un anunciante ficticio.

Consulta agregada de solo lectura: producción tiene campos DEMO activos y servicios de referencia para los 19 países; UAT también contiene campos DEMO regionales. No se modificaron registros, estados, usuarios, permisos, credenciales o configuración productiva. Los campos pausados/borradores y las referencias no aprobadas conservan su estado y visibilidad anteriores.

## Comprobación solicitada, sin WT

Por instrucción del usuario, no se ejecutaron suites WT/UAT ni se volvió a correr npm test. Se realizaron lint, TypeScript, build y una inspección visual puntual del cambio:

- Web desktop y móvil de 320 px: header/hero sin desbordes.
- Resultados con overflow visible y sin altura máxima interna.
- Ampliar mapa y restaurarlo con Escape; botón de zoom operativo.
- Selector superior AR → BR, con dos tarjetas DEMO en el home de BR.
- Catálogos BR: un campo DEMO, un servicio de referencia y cuatro regiones por catálogo, leídos con cliente público de UAT.
- Módulo regional visible y cero errores JavaScript en esa inspección; sin envíos ni escrituras Supabase.

App Lite utiliza los mismos componentes de Preview y mantiene sus alias y enlaces. No se repitió una matriz completa de Lite, países o autenticación. Se actualizaron expectativas antiguas de los scripts de navegador para reflejar el nuevo hero y las regiones visibles, sin ejecutarlos.

Los workflows habituales del repositorio pueden ejecutarse automáticamente al subir el commit; no se alteraron para eludir controles. La entrega permanece en Preview/PR Draft. No hay merge ni despliegue Production. Las pruebas con sesión real, correos de recuperación, perfil y reporte siguen pendientes.

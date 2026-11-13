# Home blanco y explorador rural unificado — 13/11/2026

La selección visual del usuario se implementa como una página blanca, con el escudo RC existente más legible, fotografía existente de ganado en escala de grises mediante CSS y acentos coral. Se conserva la fotografía original. No se incorporan dependencias ni recursos externos nuevos.

## Experiencia

- Un solo explorador `Todo / Campos / Servicios`, resultados y mapa compartidos.
- País y búsqueda por provincia, localidad o zona declarada. Operación y aptitud solo en Campos; especialidad solo en Servicios. Los filtros específicos conservan su valor al alternar, pero no se aplican en Todo.
- Fichas alternadas por tipo para dar visibilidad a ambos. Títulos en negrita y etiquetas de tipo, iconos Lucide (ISC) con texto: trigo, ganadería, maquinaria, transporte, riego, veterinaria y demás especialidades existentes.
- Solo características publicadas: no se deducen prestaciones de campos a partir de fotos ni se inventan mejoras, precios, testimonios o calificaciones.
- Coordenadas válidas para los marcadores. Para servicios, el marcador es la base declarada; cobertura por texto, sin radio geográfico inventado. Etiquetas diferenciadas por color y texto. Cuando comparten coordenadas se desplazan las etiquetas visuales, no las ubicaciones.
- Búsqueda automática al mover el mapa, búsqueda manual opcional y restablecimiento de zona. Selección entre fichas y marcadores. Regreso desde el detalle conserva país, tipo, filtros y límites geográficos mediante una lista permitida de parámetros.
- En móvil, botón fijo para alternar fichas/mapa sin perder la búsqueda. El home de `/lite` comparte el mismo componente mediante la reescritura de Preview; los detalles Lite ya comparten componentes.
- Consultas independientes en paralelo y errores independientes: el fallo de servicios no elimina campos disponibles y viceversa. Sin coordenadas se mantiene la ficha al buscar en todo el país.

## Alcance de datos

Hasta 120 campos y 120 servicios activos por país, consultados con cliente público/RLS. Los filtros se aplican al conjunto cargado; el límite se informa cuando se alcanza. Los IDs de muestras DEMO se excluyen. UAT contiene publicaciones sintéticas; no se reemplazan fotos ausentes por imágenes que parezcan representar un inmueble real.

No hay escrituras, cambios de esquema, nuevas dependencias, envíos de correo, cambios de usuarios ni ajustes productivos. Se conserva la condición que activa el home nuevo únicamente en las ramas Preview autorizadas. Las restricciones de contacto/publicación de UAT permanecen.

## Validación

- Lint, TypeScript, 164 tests Node y build local de Preview aprobados.
- Web desktop / Web móvil / App Lite: `/`, `/v3` y `/lite` en 320, 375, 390, 768, 1280, 1440 y 1920 px sin desbordes; controles táctiles, filtros por tipo, vacío, limpieza y alternancia móvil comprobados.
- AR/es, BR/pt-BR y US/en: titulares, selector de país y filtros localizados comprobados.
- Navegador: marcadores de servicio y campo que comparten coordenadas seleccionan sus fichas, mover el mapa filtra ambos tipos, restablecer recupera resultados y volver del detalle conserva búsqueda. Sin errores JavaScript después de corregir la animación pendiente de Leaflet al desmontar el mapa.
- Transporte visual opcional de QA con curl/TLS validado, identificador de aplicación y Referer para imágenes y tiles OSM; no modifica respuestas de datos ni mide el optimizador remoto.

El Preview remoto conserva su protección de acceso. Esta validación no acredita ingreso Google, recuperación por correo, guardado de perfil ni reporte con una sesión real; esos pendientes del informe `auditoria-fichas-cuenta-email.md` siguen abiertos antes de PROD. Publicación final sujeta a autorización explícita del usuario.

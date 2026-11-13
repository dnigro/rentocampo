# Hero propio, cuenta mínima y enlaces — Preview

Se combina tipografía protagonista con foto rural panorámica gris: «Conectá con el campo», acento coral y dos CTA. No se usan métricas inventadas ni se agregan dependencias. El panel interno cambia a accesos compactos en dos columnas (una en móvil), filas de 104 px, iconos sin recuadros y flechas explícitas. Los permisos, datos y acciones de perfil/reporte no se alteran.

El mapa conservaba position:sticky, pero el desborde horizontal heredado creaba un contenedor de scroll. En el marco Preview se usa overflow-x:clip, sin crear otro scroll vertical, y se adapta la altura del mapa al viewport. La lista conserva scroll del documento y no vuelve al desplazamiento interno.

## Enlaces
- Logo del footer vuelve al home V3 con país.
- Ver mapa / mapa de servicios incluyen vista=mapa para abrirlo también en móvil; el estado se conserva al regresar desde una ficha.
- Cómo alquilar / Cómo publicar llevan a guías localizadas de FAQ que se abren automáticamente.
- Panel del propietario conserva país. Los destinos V3 se mapean a Lite cuando corresponde.
- CTA del hero mantienen destinos visibles #explorar y #como-funciona, con margen para el header.

## Verificación puntual autorizada, sin WT
Web desktop / Web móvil / App Lite:
- 14 destinos internos del footer web respondieron 200, sin fallback 404. Los privados terminaron en login conservando next y país. Los equivalentes Lite respondieron 200 y mantienen la superficie Lite.
- Los seis accesos del panel respondieron 200 tras redirigir al login esperado. No se guardaron perfiles, enviaron formularios ni se impersonó a un usuario.
- Instagram y Facebook respondieron 200 mediante GET. mailto:hola@rentocampo.com se comprobó como destino, sin enviar correo.
- Ambos CTA del hero alcanzan sus anclas. Enlaces de ayuda abren la pregunta correcta. Mapa móvil abierto mediante enlace, ancho 320 px sin desbordes.
- Durante scroll 970→1570 px el mapa mantuvo top=100 y bottom=820. Se extendió la lista mediante un espaciador DOM exclusivamente local para comprobar un recorrido largo; sin cambiar publicaciones.
- Hero AR/BR/US sin desbordes a 320 px; además revisión a 375/390 px. Panel mínimo con estructura de referencia e iconos reales revisado a 1440/320 px; no acredita una sesión privada real.
- Lint y build (incluye TypeScript) aprobados. Se añadieron casos de enlaces Lite sin ejecutar suites WT/UAT ni npm test.

La revisión remota con sesión del usuario y datos del reporte sigue pendiente. Se entrega sólo Preview, sin merge, cambios productivos o nuevas rutas auxiliares.

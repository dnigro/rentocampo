# Hero 06 y cuenta monocroma — Preview

Se recupera la dirección elegida «Tipografía monumental»: fondo azul profundo, Montserrat 900, título EL CAMPO / TE CONECTA con acento coral y una vaca gris recortada. La imagen decorativa fue generada con transparencia; no representa una publicación o un usuario. Se entrega como PNG público y se sirve mediante Next/Image. El buscador existente queda en un panel flotante; no se crea un buscador duplicado ni CTA de muestra. Se conservan tabs, filtros, país y mapa.

AccountOverview queda blanco, negro y gris: separadores de 1 px, sin tarjetas, bordes exteriores, fondos coloreados ni iconos con recuadro. Se sustituyen los iconos anteriores por una misma familia Lucide de trazo fino y chevrons. El componente sigue compartido por dashboard, Mi RentoCampo y perfil Lite autenticado. Permisos, datos privados y destinos no cambian.

Web desktop / Web móvil / App Lite: revisión puntual del home real a 1440/320 px para AR/BR/US, sin desbordes ni errores JS. Montserrat verificada en los spans del título. Ambos CTA llegan a #explorar y #como-funciona. Lite muestra un único panel de búsqueda, de ancho 320 px. La referencia local de cuenta con su misma estructura y hoja aislada confirma fondo transparente, sin borde superior, borde inferior de 1 px, radio cero e iconos grises rgb(110,110,115), también sin desbordes a 320 px. No se utilizó una sesión privada ni se guardaron datos.

Lint y build/TypeScript aprobados. Sin WT, UAT ni npm test por instrucción del usuario. Entrega sólo en Preview; sin cambios productivos ni nuevas rutas auxiliares.

Comprobación final a 320 px: las tres pestañas quedan dentro del panel de búsqueda (extremo derecho 291 px), en AR, BR y US. «Explorar mapa» conserva país y abre vista=mapa; panel móvil visible. La foto de la vaca conserva canal alfa y el blob de GitHub coincide exactamente con el hash del archivo local.

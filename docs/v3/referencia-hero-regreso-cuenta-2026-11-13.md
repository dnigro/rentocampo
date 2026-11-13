# Referencia visual, cuenta y regreso — Preview

## Correcciones
El regreso al reporte quedaba blanco porque una regla nueva aclaraba el fondo mientras una regla heredada mantenía el relleno de texto y la flecha blancos. Se fijan juntos fondo, color, -webkit-text-fill-color y trazo dentro de Preview. El destino conserva país y usa la navegación común web/Lite.

La cuenta ahora utiliza AccountOverview con CSS Module, ancho máximo de 1040 px, tarjetas contenidas y títulos/acciones explícitos. Dashboard, Mi RentoCampo y el perfil Lite autenticado reutilizan el componente. Las consultas privadas y controles de autorización siguen en servidor. El permiso del reporte conserva correo confirmado y canAccessManagementReport. No se concede acceso mediante metadata editable.

## Hero adaptado
Paisaje rural existente, en gris por CSS, tipografía condensada Anton autohospedada mediante next/font, título «Tu campo tiene potencial. Hacelo visible.», recuadro negro y botones verde oscuro/borde. La descripción incluye propietarios, productores y servicios rurales. El selector de país y el header acordado se conservan. ES/PT/EN y beneficio multirregional sin promesas de demanda. Se retiran las reglas del hero anterior que quedaron sin uso.

## Verificación puntual sin WT
- Web desktop / Web móvil / App Lite: componentes reales renderizados con datos locales de muestra, a 1440 y 320 px. Sin desbordes; hero BR/US también revisado a 320 px. Se verificó que los spans del título usan Anton, sin caer en la fuente general heredada.
- Regreso: fondo rgb(16,46,70); texto, relleno y flecha rgb(255,255,255). Etiqueta «Volver a mi cuenta» y destino /dashboard?pais=AR. Misma comprobación en desktop y móvil.
- Perfil Lite: los accesos mantienen /lite/perfil/editar, publicaciones y mensajes Lite, con país BR. Favoritos y reporte conservan sus módulos web existentes.
- Las rutas temporales de inspección (sin datos privados ni sesión) se eliminaron antes de compilar la entrega. Se limpiaron tipos generados de esas rutas locales.
- Lint y compilación/TypeScript aprobados. Se actualizaron expectativas del script visual para la imagen del hero y las guías actuales, sin ejecutar WT/UAT, npm test o ese script de suite.

No se usó una sesión real, no se enviaron formularios ni correos, ni se modificaron datos o configuración productiva. Preview solamente, PR Draft, sin merge o despliegue Production.

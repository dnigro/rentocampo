# Formularios, footer y banderas — Preview

Se reutiliza el footer completo del sitio con sus cuatro secciones, redes y términos, adaptando sus destinos al explorador regional. Se eliminan los enlaces Campos y Servicios rurales del header; permanecen país, cuenta y controles de sesión.

El selector muestra las banderas SVG locales de los 19 países junto a sus códigos, también en cada opción. Las referencias regionales y formularios comparten esos recursos. Los formularios de campo y servicio conservan campos, validaciones y operaciones; el marco Preview aplica estilos compactos sin el banner anterior. Los aliases Lite transmiten país y zona al flujo compartido.

Las fichas DEMO recuperan fotos ilustrativas locales cuando falta la imagen o falla su carga. Las publicaciones reales no reciben fotos de referencia. No se modifica la base de datos.

Validación: lint, TypeScript y compilación local. Inspección puntual de ambos formularios en escritorio y 320 px sin desbordes, 19 opciones con bandera, footer completo, header sin los enlaces retirados y fotos DEMO cargadas. Sin errores JavaScript. Las solicitudes de escritura se bloquearon durante la inspección; no se enviaron formularios. La ruta auxiliar local de inspección se retiró antes de compilar la entrega.

No se ejecutaron WT, UAT ni npm test por instrucción del usuario. No se acredita publicación real autenticada ni cambios productivos. Entrega sólo en rama de Preview y PR Draft.

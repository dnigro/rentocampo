# Integración del sitio, footer legal y tipografía — 13/11/2026

## Resultado

El marco visual del Preview ahora se aplica desde el layout raíz, por lo que acompaña las páginas públicas, autenticación, cuenta, rutas de aplicación y Lite. El home y los detalles V3 reutilizan el mismo marco, sin volver a dibujar encabezados o footers. Los encabezados y pies anteriores se omiten mediante contexto únicamente cuando existe el marco compartido; sus implementaciones se conservan para el sitio productivo.

- Encabezado y footer únicos con navegación a explorar, campos, servicios, cuenta, ingreso y registro. Menú móvil operable y enlace para saltar al contenido.
- Footer con Términos y condiciones enlazado a la página legal ya existente. No se reescribe su contenido ni se inventan condiciones nuevas.
- Login, registro, recuperación, nueva clave y retorno de autenticación integrados con el sitio. Se conservan los handlers de autenticación, Google, validación de sesiones y redirecciones seguras.
- Los enlaces regionales conservan tanto el país como el fragmento de destino; se corrige el armado de enlaces con #como-funciona.
- Hero con fondo cálido suave en degradado, compatible con la fotografía de ganado en gris y los acentos coral.
- Tipografía consistente: formularios de 16 px como mínimo, títulos de autenticación de 32 px en escritorio y 28 px en móvil; textos de apoyo de 14–16 px, mejor interlineado y títulos de fichas en negrita. El marco común usa DM Sans existente. Ajustes específicos neutralizan temas antiguos de autenticación sin alterar CSS productivo.
- Ícono de cuenta móvil mantiene un nombre accesible aunque el texto se oculte visualmente.

## Verificación

- 165 tests Node, lint sin warnings y build local de Preview aprobados.
- QA de integración de solo lectura en 13 rutas: /, /v3/mi-rentocampo, /login, /register, /recuperar-contrasena, /auth/reset-password, /auth/callback, /terminos-y-condiciones, /lite y las cuatro rutas Lite de ingresar/registro/recuperación/nueva-clave.
- Web desktop / Web móvil / App Lite: 320, 375, 390 y 1440 px; encabezado/footer únicos, un landmark main, sin desbordes, controles legibles, enlaces legales, ingreso/recuperación y visibilidad de contraseña sin enviar formularios.
- Encabezado/footer BR/pt-BR y US/en, enlaces regionales y anclas comprobados. El contenido legal existente conserva su idioma original.
- Regresión del home/explorador: tipos, filtros, mapa/fichas, ubicación compartida, regreso de detalle y países.
- Sin envíos de correo, altas de cuenta, cambios de contraseñas o perfiles ni escrituras de Supabase durante QA.

## Alcance de entrega

La condición isV3Preview mantiene la integración únicamente en las ramas Preview autorizadas. No se hace merge a main ni se despliega en Production. Las pruebas de diseño y navegación no acreditan ingreso real con Google, entrega de nuevos correos de recuperación, guardado de perfil ni reporte con una sesión real; estos pendientes del informe de autenticación siguen abiertos.

# Hero con presencia y cierre compacto del home

El bloque de pasos «Del mapa al contacto directo» se reemplaza por «¿Qué necesitás hoy?» con tres accesos: buscar un campo, preparar una publicación de campo y ofrecer servicios. Conserva el ancla #como-funciona del menú existente.

## Diseño

- Hero con banda azul profunda, título blanco y CTA coral con área táctil mínima de 48 px. Se conserva la foto de ganado en gris y el resto de la home sobre blanco.
- Tres tarjetas en una fila en escritorio; tarjetas bajas en móvil. Los enlaces de publicación abren las rutas existentes y requieren ingreso; las redirecciones conservan el destino y el país.
- FAQ plegadas dentro de un único acceso «Preguntas frecuentes». Las cinco respuestas están inicialmente ocultas y los acordeones interiores permiten abrir una pregunta por vez. No hay una segunda sección con un título gigante.
- QA verifica el cierre plegado por debajo de 370 px en escritorio y 610 px a 320/375/390 px de ancho. La longitud de resultados depende del catálogo existente; en escritorio la lista conserva su scroll interno.

## Limpieza y mantenimiento

- La página home compone Hero, explorador y cierre; no contiene la consulta y transformación de ambos catálogos.
- `lib/v3/load-home-listings.ts`: consulta pública de campos/servicios, normalización de coordenadas, galerías, exclusión de DEMO, errores independientes y límite de carga. Protegida con server-only.
- `lib/v3/types.ts`: contrato público serializable compartido por servidor y UI, sin importar tipos desde un componente cliente.
- `lib/v3/filter-listings.ts`: filtros puros y probados; la normalización de la búsqueda se hace una vez, en lugar de repetirla por publicación.
- `V3HomeHero` y `V3HomeActions`: componentes separados de presentación. Las FAQ reutilizan `data/home-faq.ts`, la misma fuente de las respuestas del home anterior; sin duplicación de copy ni cambios en sus condiciones comerciales.
- Se eliminan los estilos del bloque de pasos y la sobreescritura anterior del hero. CSS del home formateado por reglas y declaraciones para facilitar su edición.
- El contrato de solo lectura también revisa el nuevo loader después de extraerlo de la página.

## Validación

169 tests Node, lint sin warnings, TypeScript y build local de Preview aprobados. Las cuatro pruebas nuevas cubren ubicación con tildes, cobertura de prestadores, filtros por catálogo, operación dual y conservación de los datos originales.

Web desktop / Web móvil / App Lite: /, /v3 y /lite en 320, 375, 390 y 1440 px, sin desbordes; cierre compacto, hero legible, FAQ inicialmente plegadas, preguntas exclusivas y CTA de búsqueda comprobados. AR/es, BR/pt-BR y US/en. Destinos de publicación anónimos protegidos por login con next preservado. Regresión de explorador, filtros, mapa y retorno de detalles aprobada. Regresión de integración/auth/legal en 13 rutas aprobada, sin errores JavaScript ni escrituras Supabase.

No se envían correos, no se crean usuarios ni se modifica información productiva. La entrega permanece en Preview/PR Draft. No se acredita ingreso real con Google, recuperación por correo, guardado de perfil ni reporte con una sesión real; esos pendientes de la auditoría de autenticación permanecen antes de PROD. Las comprobaciones aprobadas no garantizan ausencia absoluta de defectos ni sustituyen esas pruebas.

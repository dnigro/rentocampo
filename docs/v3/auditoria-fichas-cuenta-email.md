# V3 — Fichas, cuenta y autenticación: implementación y auditoría

## Trabajo entregado en la rama de revisión

- Propuesta conceptual de Home con enfoque comercial, generada como imagen para revisión. Es una propuesta, no una captura del sitio publicado; no se instaló como imagen del producto.
- Fichas de campos: galería de hasta ocho fotos, navegación por secciones, información comercial, superficie, ambiente, rendimiento y disponibilidad cuando existen datos, y ubicación con coordenadas verificadas. Nunca se estiman coordenadas faltantes.
- Fichas de servicios: galería, descripción completa, actividades, país/provincia/localidad, cobertura y mapa cuando hay datos. La consulta acepta la galería opcional de producción y el esquema UAT anterior que aún no incluye esa columna. Se conservan filtros al regresar al catálogo.
- Las rutas de detalle web y Lite con UUID comparten estas fichas en Preview. La restricción a UUID conserva rutas como `/lite/campos/publicar`, que siguen protegidas por autenticación.
- Fotos con error de carga tienen un estado explícito; una publicación sin imágenes no utiliza fotografía inventada.
- Mi RentoCampo V3 dejó de ser un tablero demostrativo: visitantes ven ingreso/registro/recuperación; usuarios autenticados acceden a módulos reales de perfil, campos, servicios, mensajes y favoritos. El reporte gerencial aparece solo para la cuenta autorizada con email verificado. Ese acceso también se agregó a Lite.
- El lector privado del perfil sigue en el servidor, limitado por el ID del usuario obtenido con `getUser()`. Se conservó porque el teléfono no tiene permiso de lectura desde la API pública ni desde el rol authenticated. Si falta configuración o falla la consulta, se muestra un error recuperable; no se presenta un formulario vacío que pueda borrar datos.

## Correcciones de autenticación

1. Un único validador de destinos internos rechaza URLs externas, barras invertidas, controles y variantes codificadas en login, Google, callback y confirmación.
2. Cookies actualizadas y cabeceras anti-caché de Supabase SSR se propagan juntas. Respuestas privadas y de autenticación usan `private, no-store`; las redirecciones privadas preservan cookies actualizadas.
3. Las rutas gerencial y servicios privados se incluyen en la protección del proxy, además de sus validaciones del servidor.
4. Web y Lite comparten el formulario de restablecimiento. Se espera la inicialización automática del cliente PKCE y se verifica el usuario antes de permitir guardar, evitando el canje manual duplicado del mismo código.
5. Una confirmación de tipo recovery sin destino explícito vuelve al formulario de restablecimiento; la respuesta que redirige conserva las cookies de la sesión verificada.
6. Enlaces vencidos o sin sesión deshabilitan el guardado y ofrecen solicitar otro enlace.

## Comprobaciones reales de producción, solo lectura

- `https://www.rentocampo.com` redirige al dominio canónico `https://rentocampo.com/`, que responde HTTP 200.
- Login y recuperación responden HTTP 200. Perfil y reporte gerencial redirigen a login para visitantes anónimos.
- La cuenta administrativa indicada por el propietario tiene email verificado, inicio de sesión registrado, perfil activo y los tres roles comerciales. No está bloqueada ni eliminada, ni tiene onboarding pendiente. No se modificó su registro ni se inició sesión en su nombre.
- El reporte usa una lista autorizada independiente de los roles comerciales. No se agregaron privilegios, roles administrativos ni excepciones a RLS.
- Google y email están habilitados. El registro está habilitado y la confirmación de correo es obligatoria (`mailer_autoconfirm=false`).
- RLS está habilitado en perfiles, campos y servicios. Las políticas de escritura revisadas incluyen propiedad del registro. Se verificó además que la columna teléfono del perfil no puede leerse con anon ni authenticated; se preservó esa protección.
- El advisor de Supabase registra una advertencia: protección contra contraseñas filtradas deshabilitada. No se modificó la política de contraseñas de producción. [Referencia oficial](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Resend

- Dominio `rentocampo.com` verificado, envío habilitado, SPF y DKIM verificados. DMARC publicado con `p=quarantine`.
- Open tracking y click tracking desactivados, evitando reescritura de enlaces de autenticación por ese mecanismo.
- Muestra de los últimos 30 envíos: **27 delivered, 2 bounced, 1 suppressed**; 15 corresponden a asuntos relacionados con autenticación. Son estados de la muestra, no una garantía para todos los correos futuros.
- Los logs recientes muestran envíos SMTP aceptados. El correo de Auth utiliza Supabase con SMTP; el endpoint histórico `/api/resend-registro` es una invitación puntual protegida por secreto y no es el flujo normal de registro.
- La cuenta administrativa consultada no figura en la lista de supresión. No se eliminaron supresiones ni se reenviaron mensajes.
- No hay webhooks de Resend configurados. Queda pendiente integrar seguimiento de delivery/bounces en la aplicación si se desea observabilidad automática.
- Código mejorado: claves deterministas de idempotencia para notificaciones de mensajes y vencimiento de planes; las claves no contienen el email del destinatario. Los mensajes incorporan alternativa de texto plano. HTML dinámico escapado y claves estables probados con SDK simulado, sin envíos reales.
- La idempotencia del proveedor tiene retención limitada; no sustituye una cola persistente ni el registro duradero de eventos ya enviados.

## Validación

- Lint, TypeScript, **163 tests Node** y build de Preview aprobados localmente.
- Tests de seguridad ejercitan las implementaciones de proxy y confirmación con `NextRequest`/`NextResponse` reales y un proveedor sintético: cookies + no-store, redirecciones privadas, recuperación hacia reset y rechazo de destinos externos.
- Tests del módulo de cuenta comprueban acceso anónimo, selección del perfil por ID validado y enlace gerencial únicamente para la identidad autorizada y verificada. No usan sesiones ni credenciales reales.
- Browser QA de solo lectura: detalles campos/servicios y sus cuatro entradas web/Lite a 320, 375, 390, 768, 1280 y 1440 px; secciones, galería, navegación y ausencia de desbordes. Recuperación sin sesión probada en web/Lite, módulos privados protegidos y destinos manipulados rechazados. Sin escrituras de navegador a Supabase ni errores JavaScript.
- Galería con fixture local temporal: ocho fotos, teclado, Escape, retorno de foco y carrusel aprobados. Fixture eliminada al terminar.
- Se comprobó una referencia de imagen UAT con HTTP 200 y carga/decodificación en navegador. El puente opcional de QA usa curl con TLS validado para resolver la limitación de CA/proxy de Chromium; no modifica imágenes ni la aplicación. No acredita el rendimiento del optimizador remoto.

Runners: `tests/v3-details-auth-browser.mjs` y `tests/v3-gallery-browser.mjs`. El primero acepta `V3_VISUAL_BRIDGE=1` para el entorno administrado, además de las variables habituales `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`, `V3_TEST_URL` y `V3_EVIDENCE_DIR`.

## Límites y pendientes efectivos

- No se enviaron correos de prueba, crearon usuarios, cambiaron contraseñas, editaron perfiles ni modificaron datos, esquema, DNS o configuración de producción.
- No se ejecutó login real con Google ni recuperación de una cuenta real; esas verificaciones requieren interacción del titular y un entorno de pruebas con sus URLs permitidas. La configuración y los registros de entrega no sustituyen ese recorrido completo.
- No se acredita el render autenticado del reporte con la cuenta real: se verificaron estado de cuenta, reglas, enlaces y pruebas sintéticas, sin impersonación.
- Se requiere una clave administrativa UAT apropiada para probar la lectura privada y guardado de perfil de punta a punta. No se utilizó una clave productiva en UAT.
- El conector Vercel continúa respondiendo 404 para el proyecto conocido, aunque GitHub puede generar Previews. La navegación del deployment protegido y sus variables privadas permanecen sin inspección directa.
- Contacto y escritura sobre publicaciones productivas no se probaron desde Preview. No hay merge a main ni deployment Production.

# RentoCampo · Playbook de crecimiento orgánico ($0 en pauta)
**Inicio:** 21/10/2026 · **Owner:** Growth RentoCampo · **Horizonte piloto:** 30 días · **Estado:** estrategia activa, hipótesis en validación.

> Objetivo: construir adquisición de propietarios, productores y servicios rurales con un sistema repetible y medible, inspirado en *Predictable Revenue* (Aaron Ross / Marylou Tyler), adaptado a un marketplace bilateral. Una impresión o un seguidor no equivale a un registro ni a una conversación.

## 1. Marco operativo: Seeds / Nets / Spears
- **Seeds (semillas):** confianza, boca a boca y recomendaciones de propietarios/prestadores que comparten su ficha real.
- **Nets (redes):** SEO útil, contenidos y comunidades rurales existentes, colaboraciones orgánicas con organizaciones.
- **Spears (lanzas):** contacto muy específico con cooperativas, cámaras y comunidades rurales pertinentes. Pedir referencia / conexión; no enviar propuestas genéricas a escala.

Referencia de metodología: https://predictablerevenue.com/methodology/ ; https://predictablerevenue.com/15-minute-summary-of-predictable-revenue/ ; https://predictablerevenue.com/outbound-faq/

## 2. Perfiles prioritarios e hipótesis
1. **Prestadores rurales reales** (contratistas, siembra/cosecha, transporte, veterinaria, maquinaria). Hipótesis: aportan oferta local y son los primeros difusores de fichas.
2. **Propietarios** que disponen de campos para venta o alquiler en regiones productivas. Mostrar valor concreto: ficha localizable, fotos y contacto directo.
3. **Productores** con demanda territorial definida; activar una vez exista suficiente oferta visible para su necesidad.
4. **Aliados**: cooperativas, entidades rurales, redes de agronomías / prestadores con público genuino. No afirmar acuerdos hasta obtenerlos.

### Geografía inicial (concentración de oferta)
- **AR, zona núcleo:** sur de Santa Fe, norte bonaerense y sureste de Córdoba.
- **AR, interior bonaerense:** corredor Coronel Pringles / Tandil / Azul, sujeto a oferta real.
- **BR:** mantener publicaciones regionales ya programadas y medir interés; no ampliar inversión ni dar a entender que hay oferta que no existe.

Publicar páginas locales de SEO solo con contenido genuino, fichas reales y utilidad; prohibido crear landing pages geográficas vacías o masivas.

## 3. Línea de base confirmada por consulta agregada a Supabase PROD
Corte inicial 21/10/2026. Controles: perfiles con usuario de autenticación y correo confirmado, excluyendo las cuentas internas de prueba según configuración privada (sin publicar identificadores personales en este repositorio); campos cuyo ID no empieza `20000000-` ni título contiene `DEMO`, asociados a esos perfiles.
- Perfiles registrados y confirmados no excluidos: **5**.
- Nuevos perfiles no excluidos últimos 7 días: **1**.
- Campos reales activos: **3**.
- Servicios reales activos: **0**.
**Nota:** estos filtros no prueban por sí solos que cada persona sea comercialmente real. Revisar actividad, spam y duplicados si corresponde. No usar DEMO para atribuir conversiones.

**Analytics:** Windsor.ai informó el 21/10/2026 que las lecturas de GA4/Search Console estaban detenidas por límite del plan Free (6 fuentes conectadas vs. 1 permitida). No inventar visitas ni conversiones a partir de estos conectores hasta resolverlo sin gasto. Metricool sí ofrece estadísticas de contenidos.

## 4. Embudo y KPIs de gestión
`alcance relevante -> visita identificada -> registro confirmado -> perfil válido -> campo o servicio activo -> consulta real -> respuesta efectiva -> publicación compartida`

KPI | Definición | Fuente
--- | --- | ---
Exposición orgánica | Alcance y visualizaciones no pagas | Metricool
Sesiones / adquisición | Sesiones por país/canal/campaña UTM | GA4 cuando vuelva el acceso
Altas verificadas | nuevos `auth.users` con email confirmado + perfiles no prueba | Supabase (agregado)
Oferta activa real | campos activos + servicios activos no DEMO, excluyendo cuentas de prueba | Supabase
Consultas reales | primer mensaje/consulta con interlocutores válidos | tablas de chat existentes, tras inspección de esquema
Activación | cuentas verificadas que publican su primera oferta o realizan primera consulta | Supabase
Tasa registro | cuentas verificadas / visitas de origen identificable | GA4 + Supabase, sin adjudicar conversiones ambiguas
Alianzas | organizaciones que aceptan difundir y resultados atribuibles | registro de contactos y UTMs

**Métricas de vanidad no son objetivos comerciales:** no reportar impresiones, hashtags ni cantidad de posts como si fueran registros. No atribuir a un hashtag un alta si no hay trazabilidad.

## 5. Objetivos piloto (hipótesis, no proyecciones)
- 40 contactos institucionales calificados y verificados (sin scraping masivo ni spam).
- 5 alianzas voluntarias que compartan contenido propio.
- 30 registros confirmados nuevos, excluyendo pruebas.
- 15 nuevas publicaciones activas reales, priorizando **5 servicios** como mínimo.
- Medir origen e interacciones en fichas, con comparación semanal; si no hay datos de conversión, indicar "sin medición".

## 6. Calendario de contenidos y formato
- Mantener las **16 publicaciones de noviembre** ya programadas y aprobadas en Metricool; no duplicar, no modificar imágenes aprobadas sin criterio específico.
- Cambio aplicado 21/10/2026: todas las 16 tienen **5 hashtags** relevantes y mantienen imagen, fecha y ambos canales (Instagram/Facebook).
- Máximo 5 etiquetas IG: marca + actividad/intención + región; preferir 3-5 etiquetas específicas a listados masivos.
- Copy con localidad, servicio real, propuesta de valor y una sola CTA; en Instagram, dirigir al enlace de perfil o Story enlazada (no depender de URLs de caption como clicables).
- Estética oficial y QA obligatorio: aplicar [identidad visual y QA social 2026](./identidad-visual-y-qa-social-2026.md) a **todas** las piezas nuevas y futuras adaptaciones; prioridad a la referencia diagonal de Bolivia aportada el 29/10/2026 (verde inglés, grafito, gris/plateado mate, blanco y negro, fotos reales; sin efecto IA). Revisión autónoma de legibilidad, composición, copy, país/idioma y contenido; sin exigir validación de cada imagen.
- No presentar una foto ilustrativa como una propiedad, usuario o servicio real. Señalizar ilustraciones y DEMO.
- Antes de programar: revisar duplicados, país/idioma (PT-BR), fecha, medio, imagen y enlace.
- Próximos experimentos: versiones 3 vs. 5 hashtags en posts comparables; contenido de **ficha real específica** vs. mensaje genérico, orientado a clic/registros (no solo likes).

## 7. SEO y distribución local
- Optimizar títulos, descripción y enlazado interno de fichas reales; texto orientado a búsquedas reales: "servicios de cosecha en [localidad]" o "campo en alquiler en [localidad]" solo cuando el contenido exista.
- Verificar canónicas, sitemap, indexación y vista correcta de host `www` / no-`www`.
- Compartir fichas por WhatsApp desde acciones explícitas del usuario, sin mensajes automáticos a terceros.
- Evitar páginas programáticas de bajo valor y declaraciones no verificadas.
- Referencia: https://developers.google.com/search/docs/fundamentals/creating-helpful-content

## 8. Partners y comunicaciones: privacidad, legalidad y $0
- Contactos relevantes, verificables y de ámbito público; aproximación individual con contexto y posibilidad de no recibir más contactos. No importar bases personales ni enviar mails masivos no solicitados.
- **No usar Gmail personal ni correos personales del fundador para comunicaciones del proyecto.** Solo utilizar remitentes corporativos verificados en Resend para comunicaciones autorizadas y conformes a normativa; las comunicaciones institucionales no solicitadas se preparan para revisión.
- Sin pauta, boost, campañas Meta o presupuestos nuevos. Sin costos de software nuevos sin decisión explícita.
- No modificar cobros, planes ni checkout a partir de este playbook.
- No modificar producción sin QA y validación de cambios funcionales. Los documentos de estrategia no alteran el sitio.

## 9. Ritual semanal: Predictable Growth
Cada viernes:
1. Revisar una idea concreta de *Predictable Revenue* desde su fuente original (ICP, referral, specialización, Seeds/Nets/Spears, seguimiento y conversiones).
2. Comparar datos reales de 7 días vs. semana previa: perfiles confirmados, campos reales, servicios reales, consultas, canales, contenidos, países. Excluir pruebas y DEMO.
3. Registrar 1 experimento con hipótesis, acción, métrica principal, ventana y decisión continuar/cambiar/detener.
4. Reportar bloqueos de medición y costos con honestidad. Prohibido inferir ventas o tráfico con datos ausentes.
5. Priorizar creación de oferta local antes de ampliar a nuevos países.

**Regla de aprendizaje:** una sola variable relevante por experimento, resultados comparables, sin atribuciones causales injustificadas.

## 10. Backlog de producto para PRs separados
- Registrar UTMs en el embudo `register -> perfil -> first_publication -> first_chat`, privacidad mínima, sin persistir datos sensibles innecesarios.
- Diferenciar enlaces por canal al publicar en Instagram y Facebook, no `utm_source=metricool` genérico.
- Añadir botón de compartir ficha por WhatsApp con URL canónica y UTMs para referidos cuando el usuario lo active, sin enviar nada automáticamente.
- Dashboard de cohortes por país, rol, semana y activación, excluyendo DEMO y cuentas de prueba; permisos de acceso restringidos.
- SEO de listados/fichas reales, metadatos y sitemap; sin páginas vacías.
- Restablecer reportes fiables de GA4/Search Console sin pagar si es posible.

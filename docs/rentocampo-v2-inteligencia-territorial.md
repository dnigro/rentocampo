# RentoCampo V2 — inteligencia territorial

## Producto principal

El mapa es el producto. El usuario explora territorios y contrata reportes para comparar oportunidades productivas. Los servicios digitales se organizan alrededor de la geografía, no como un catálogo de suscripciones inconexas.

### Primera entrega técnica (este PR)

- Ruta aislada `/inteligencia-territorial`, sin enlaces desde la navegación principal y con `noindex`.
- Navegación por los siete países ya configurados en RentoCampo.
- Base OpenStreetMap monocromática y capas WMS de ISRIC SoilGrids: arcilla, pH y carbono orgánico; profundidades 0–5 y 5–15 cm.
- Click para obtener coordenadas, **sin inventar valores por parcela**.
- Falla de WMS no bloqueante: sigue visible el mapa base.
- Ningún cambio en tablas de producción, checkout, autenticación, mapas V1 o facturación.

## Fuentes y atribución

- [SoilGrids, ISRIC](https://docs.isric.org/globaldata/soilgrids/): mapas predictivos globales de suelo, 250 m nominales, licencia CC BY 4.0. Se debe mantener atribución al proveedor.
- [WMS SoilGrids](https://docs.isric.org/globaldata/soilgrids/wms_from_qgis_arcmap.html): capas para **visualizar** el raster (no mediciones ni análisis cuantitativo por punto).
- [WCS SoilGrids](https://docs.isric.org/globaldata/soilgrids/wcs.html): vía prevista para adquirir recortes y procesar valores cuantitativos.
- [FAO GAEZ](https://gaez.fao.org/): indicadores regionales agroecológicos y de aptitud; verificar escala, vigencia y licencias en cada dataset antes de integrar.
- La API REST puntual de SoilGrids figura temporalmente pausada y **no puede ser dependencia crítica**.

## Próxima evolución, todavía NO implementada

1. **Ingesta por lotes y catálogo de fuentes**: servicios WCS, FAO GAEZ y estadísticas oficiales agroproductivas por país; almacenar `source_id`, `source_url`, `collected_at`, `spatial_resolution`, `license`, `methodology_version`, `uncertainty`.
2. **Capas propias de demanda**: publicaciones y búsquedas agregadas, consultas expresas, servicios solicitados y otras señales verificables. Normalizar por geografía y ventana temporal; aplicar umbral de privacidad, evitar mostrar intención individual y no equiparar clics con transacciones.
3. **Motor de análisis**: recortar/correlacionar capas con polígonos de parcela, climáticos, accesibilidad y restricciones. Estimar indicadores con reglas agronómicas auditables antes de incorporar modelos. Mostrar incertidumbre y fecha.
4. **Asistente de IA con fuentes**: explicar indicadores ya calculados, comparar zonas y generar reportes referenciando los datos disponibles. Nunca emitir diagnósticos agronómicos sin soporte o presentar predicciones como mediciones.
5. **Licenciamiento/comercialización**: mapa exploratorio y reportes territoriales pagos por país; checkout desacoplado por proveedor. Evaluar Mercado Pago Cross Border antes de diseñar recurrencia regional.
6. **CivAtak/ATAK-CIV (opcional)**: evaluar interoperabilidad geoespacial según licencias y requisitos reales, no tratarlo como motor de clasificación de suelos.

## Criterios de aceptación para revisión del PR

- Abrir `/inteligencia-territorial` desde un preview (no desde producción).
- Cambiar país y verificar que se centra el mapa.
- Alternar arcilla, pH, carbono orgánico y mapa base, y ambas profundidades.
- Verificar la atribución de ISRIC y OpenStreetMap y el aviso de datos predictivos.
- Simular red sin acceso a WMS: el mapa base debe seguir disponible y mostrarse aviso de falla.
- Revisar visualización móvil y en Brasil (etiquetas PT).
- Antes de lanzar producto pago: revisar rendimiento y políticas de tiles de OSM; no usar su servicio comunitario como CDN de alto volumen.
- Ejecutar lint/build de Next.js y QA manual de capas WMS **pendientes hasta disponer de preview construido**.

## Límites científicos y comerciales

SoilGrids **no** es una API de IA generativa; ofrece productos predictivos realizados con aprendizaje automático. Sus mapas no reemplazan laboratorio, verificación in situ ni interpretación agronómica contextual. La capa de demanda por ahora no existe: no se muestran mapas de calor inventados. La demo solo ilustra datos públicos de suelo.

# GeoMarket V2 — Auditoría de confiabilidad (bloqueante para liberar preview)

Estado: NO APROBADO para presentación como centro de operaciones. No promover a producción.

## Hallazgos confirmados en código

1. NASA POWER entrega históricos/reanálisis, no precipitación prevista. Etiquetas de pronóstico deben eliminarse. **Corregido en la UI**: lluvia histórica.
2. Mapa 3x3 representa nueve consultas NASA POWER; NO es un mapa de calor continuo de alta resolución. No extrapolar resolución de parcela, no simular interpolación ni aptitud del suelo.
3. No hay verificación de grilla NASA devuelta por API ni detección de celdas duplicadas tras el redondeo espacial. **Bloqueante**.
4. La función excluye valores extremos inválidos pero no comprueba 14 días completos por variable ni coherencia de fechas. **Bloqueante**.
5. El cálculo promedia celdas sin ponderación por área ni prueba de cobertura. Mostrar siempre recuento válido/esperado y advertencia de cobertura parcial.
6. El cache público responde con 86400 segundos incluso para fallas 503: corregir a no-store para errores; vigencia distinta para datos y alertas.
7. NOAA sólo EE.UU.; una lista vacía puede significar cero alertas o error de conexión. Deben ser estados distintos y visibles.
8. NDVI Copernicus, SoilGrids, FIRMS, demanda, oportunidades y notificaciones aún no están conectados. No anunciar como activos ni inventar indicadores.
9. Botón Seguir zona no persiste: estado de sesión del componente solamente. Debe identificarse como prueba local o implementarse con autorización y persistencia.
10. El radio de interés no cambia consultas NASA ni mapa: actualmente decorativo. Debe filtrar una capa real o retirarse.
11. NASA POWER no es una estación meteorológica. Incluir metodología, escala espacial, fuente, cobertura temporal, fecha de consulta, faltantes y advertencias por capa.
12. Falta prueba de respuesta real del endpoint desde el preview; Vercel devolvió 403 al diagnóstico externo. Un build exitoso no certifica la calidad de los datos.

## Casos obligatorios de QA

- AR, UY, PY, US: API 200, fecha, variables numéricas, unidad, coordenadas, muestras válidas y serie cronológica.
- Falla de NASA, latencia, timeout, respuesta incompleta, valores -999: indicador NO DISPONIBLE, nunca cero falso.
- Lluvia acumulada: suma de días válidos y consistencia con barras diarias; comparar a mano tres puntos con NASA POWER.
- Temperatura, humedad y viento: comprobar unidades y fechas; no mezclar medias con máximos.
- NOAA: avisos activos vs sin avisos vs fuente caída; no anunciar ausencia de riesgo ante error.
- Cartografía: cobertura y resolución documentadas; polígonos ilustrativos claramente diferenciados de límites geográficos reales.
- Operaciones: ningún dato falso o simulado en KPIs; exportación con fuente, timestamp, zona y notas metodológicas.
- Costo: cuotas y términos de uso de cada proveedor, caching, tasa de consulta y presupuesto Vercel.

## Criterio de salida

No compartir nuevo preview para aprobación hasta superar QA de conectores y visualización, y contar con un mapa geoespacial suficientemente denso, leyenda con unidades, controles de capas y datos verificables. Mantener rama de laboratorio aislada.
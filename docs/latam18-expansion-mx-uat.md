# Expansión LATAM 7 → 18 · piloto UAT México

- Reutiliza selector, listados, formularios, Nominatim, capas Leaflet, filtros y perfiles.
- 11 países nuevos, mapas centrados por país, entidades federativas y 44 zonas editoriales georreferenciadas. **No se exhiben como demanda comercial verificada.**
- No hay pagos regionales automáticos; Mercado Pago de Argentina conserva el comportamiento anterior.
- DEMO: incorporar un campo y un servicio por nuevo país en el entorno UAT, con etiqueta explícita DEMO y nunca contarlos como actividad real. No se insertaron en producción.
- Preproducción: la rama exige UAT_SUPABASE_PUBLISHABLE_KEY y base separada. Nunca dar acceso a credenciales productivas.
- Primera y **única UAT completa**: México (32 entidades, publicación de campo y servicio, filtros/mapa/ficha, ingreso/registro, mensajes, recuperación, móvil). Los diez países restantes usan la misma arquitectura pero deben esperar el resultado de México.
- SQL de constraints: supabase/uat/latam18_country_checks.sql; aplicar solo a UAT, evaluar constraints antes de cualquier migración de producción.
- Las zonas del mapa son **referencias editoriales**, no leads verificados.
- Las campañas de noviembre continúan como borradores en Metricool; no enviar correos hasta autorizar y validar consentimiento/contactos.
- GitHub issue #252. No fusionar antes de QA. Evitar Vercel Agent y builds manuales de pago.

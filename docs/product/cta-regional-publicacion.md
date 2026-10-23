# Regla permanente: CTA regional de publicación — RentoCampo LATAM 18

## Contrato de producto (23 octubre 2026)
**Una sola lógica para los 18 países y para Campos y Servicios rurales.**

1. El bloque “Cada región tiene su oportunidad” se muestra al final de ambos listados, usando `REGIONES_PRODUCTIVAS[country]`; se mantiene visual y editorial. Los cuatro puntos son *zonas de referencia*, no demanda comprobada ni avisos reales.
2. En cualquier CTA para **publicar** (tarjetas regionales, publicidad DEMO, mapa, fichas DEMO y llamados del pie):
   - **Con sesión iniciada:** publicar campo → `/mis-campos/nuevo?pais=XX`; publicar servicio → `/mis-servicios-rurales/nuevo?pais=XX`.
   - **Sin sesión:** `/login?next=<ruta al formulario de publicación>`. Después del login, se debe llegar al formulario deseado.
   - `zona` se conserva cuando aplica. Un punto editorial nunca establece coordenadas catastrales ni ubicaciones verificadas automáticamente.
3. La ruta de registro (`/register`) sigue disponible para crear cuentas nuevas, pero nunca sustituye el botón de **iniciar sesión** cuando el usuario llega desde el CTA promocional.
4. **Fichas reales**: mantienen ver detalle, contactar, editar y flujos vigentes; jamás redirigir las ofertas reales hacia un CTA publicitario.
5. El CTA y sus textos deben salir de `lib/publicacion-regional.ts`, no de `href` hardcodeados. Usar `regionalPublicationHref` y `regionalPublicationLabel` para mantener comportamiento consistente.
6. Cada cambio debe cubrir 18 países, roles propietario/prestador, estado logueado/anónimo, mobile/desktop, y tests. Evitar cambios en producción sin CI/preview validado.

## Integraciones
- `components/campos/DemandaZonasPanel.tsx`: bloque reutilizable en listados Campos y Servicios.
- `components/campos/CamposListing.tsx` y `app/(public)/servicios-rurales/page.tsx`: obtienen sesión y proveen tipo y país.
- `app/(dashboard)/mis-campos/nuevo/page.tsx` y `app/(dashboard)/mis-servicios-rurales/nuevo/page.tsx`: respetan país (y zona orientativa) que provenga del CTA.
- Las tarjetas y fichas DEMO también emplean esta regla; las fichas reales mantienen su navegación habitual.

**Nota:** las regiones son referencias editoriales, nunca afirmar que son demanda probada; no contar DEMO como registros reales de Growth.

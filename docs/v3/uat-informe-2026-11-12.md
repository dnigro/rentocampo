# RentoCampo V3 — Informe técnico y matriz UAT
Fecha: 2026-11-12 · Rama: `feature/rentocampo-v3` · PR: #371 (borrador) · Entorno: Preview, nunca producción.

## Alcance implementado en la rama
- Home renovada: fotografía, buscador, categorías con íconos y tarjetas de publicaciones activas reales.
- Catálogo `/v3/campos`: filtros de país, operación, provincia, aptitud y hectáreas; grilla fotográfica y mapa Leaflet integrados.
- Interacción entre mapa y lista: marcador → tarjeta y foco sobre ficha → marcador destacado. En móvil existe alternancia lista/mapa.
- Ficha `/v3/campos/[id]`: lectura pública, galería hasta 8 imágenes, datos, precio y estado de contacto sin envíos.
- Servicios `/v3/servicios` y `/v3/servicios/[id]`: publicaciones activas, filtros por país/provincia/especialidad y detalle.
- Mi RentoCampo: estructura de panel, pestañas, favoritos demostrativos en sessionStorage y estados vacíos.
- Estilos encapsulados en `app/v3/v3-marketplace.css`; no modificaciones en `main`, migraciones ni políticas RLS.
- Preview sin escrituras al backend: mensajería, publicación, edición y eliminación deliberadamente deshabilitadas.

## Estado de calidad (NO sustituir por un OK sin evidencia)
| Control | Estado | Criterio de cierre |
| --- | --- | --- |
| Código comprometido en rama V3 | IMPLEMENTADO | Comprobar hashes y diferencia respecto de main |
| Pruebas de contrato `tests/v3-contract.test.mjs` | AGREGADAS, PENDIENTES DE EJECUCIÓN | CI Quality = success |
| `npm run lint` | PENDIENTE DE RESULTADO | CI Quality = success |
| `npm run test` | PENDIENTE DE RESULTADO | CI Quality = success |
| `npm run build` | PENDIENTE DE RESULTADO | CI Quality = success |
| Despliegue Vercel Preview | BLOQUEADO / SIN URL VERIFICADA | Deployment READY para commit HEAD |
| UAT visual desktop/tablet/mobile | PENDIENTE | Evidencia visual real por ancho |
| Registro/chat/publicaciones con UAT Supabase | NO HABILITADO | Base UAT aislada, tests de permisos y datos sintéticos |
| Validación de producción | FUERA DE ALCANCE | Prohibido alterar main/producción |

## Checklist manual UAT de solo lectura
1. Abrir `/v3`, buscar alquiler, entrar al catálogo y volver a Home desde el logo.
2. Verificar `/v3/campos?pais=AR` y otros países; ningún registro DEMO debe figurar como oferta real.
3. Cambiar operación/provincia/aptitud/hectáreas; el mapa y tarjetas deben reflejar el mismo subconjunto.
4. Hacer clic en marcadores; verificar realce y desplazamiento hasta tarjeta, incluidas listas vacías y campos sin coordenadas.
5. Verificar imágenes, precios, moneda, accesibilidad de botones y estado sin imágenes.
6. En 360, 390, 430, 768, 1024, 1280 y 1440 px: sin scroll horizontal; en celular alternar mapa/lista.
7. Abrir fichas de campo y servicio, probar ruta de retorno y estados de publicación inexistente.
8. Guardar y quitar favoritos; constatar que solo cambia sessionStorage en el navegador UAT.
9. Recorrer pestañas de Mi RentoCampo; no mostrar ni inventar datos personales de cuentas reales.
10. Confirmar meta robots noindex en V3 y ausencia de llamadas de escritura a Supabase en los flujos UAT.
11. Revisar consola del navegador, recursos de imágenes y tiles Leaflet, tiempo de interacción y foco accesible.
12. Comprobar que ninguna acción edita, elimina o publica registros reales.

## Bloqueos y restricciones
- La conexión Vercel reconoce el equipo RentoCampo, pero list_projects/list_deployments devolvieron cero resultados y los intentos de crear proyectos fueron rechazados (403). Se solicitó autorización de equipo.
- No se debe declarar un Preview en línea sin estado READY y URL verificada. Una URL de un commit anterior no valida este código.
- Los datos comerciales solo se consultan públicamente. Las operaciones de usuario exigen una base y autenticación de UAT separadas.
- La versión de producción en `rentocampo.com` no debe modificarse hasta autorización explícita.

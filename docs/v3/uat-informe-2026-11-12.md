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
| Pruebas de contrato `tests/v3-contract.test.mjs` | APROBADAS en GitHub CI | CI Quality = success |
| `npm run lint` | APROBADO en CI | CI Quality = success |
| `npm run test` | APROBADO: 144/144 pruebas | CI Quality = success |
| `npm run build` | APROBADO (Next.js 16.4.5) | CI Quality = success |
| Despliegue Vercel Preview | READY según GitHub Vercel bot (commit `519b1b0`); acceso HTTP directo pendiente por protección/permisos | Verificar navegación desde cuenta autorizada |
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
- La conexión Vercel reconoce el equipo RentoCampo, pero list_projects/list_deployments devolvieron cero resultados y los intentos de crear proyectos fueron rechazados (403). Se solicitó autorización de equipo. El bot Vercel confirmó READY para el commit `519b1b073abdcce122900d0398891dcf2701ae54`, y generó la URL `https://rentocampo-git-feature-rentocampo-v3-rento-campo.vercel.app`. Las solicitudes HTTP sin la autorización de Vercel no pudieron leer las páginas, por lo que no se acredita UAT visual manual.
- Preview: `https://rentocampo-git-feature-rentocampo-v3-rento-campo.vercel.app/v3` (estado READY informado por bot de Vercel; acceso del navegador y recorridos manuales **pendientes** por protección). El estado READY por sí solo no acredita funcionamiento real de rutas.
- Los datos comerciales solo se consultan públicamente. Las operaciones de usuario exigen una base y autenticación de UAT separadas.
- La versión de producción en `rentocampo.com` no debe modificarse hasta autorización explícita.

## Evidencia CI (commit 519b1b0)
- GitHub Actions Quality #1532: **success** — instalación, ESLint, 144/144 pruebas Node y Next.js build.
- Dependency security audit #136: **success**. El comando `npm ci` informó 24 advisories en dependencias (1 bajo, 12 moderados, 11 altos); el workflow exitoso no implica ausencia de vulnerabilidades. Debe evaluarse la criticidad real en producción por ruta/dependencia antes de aprobar un merge.
- GitHub Vercel status: **success**, despliegue READY según bot en PR #371.
- El intento de inspección HTTP de la URL Preview no fue posible sin acceso a la cuenta/protección, por lo que el UAT interactivo permanece **pendiente**.

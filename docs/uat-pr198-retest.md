# PR #198 — repetición UAT AR / UY / PY

## Cambios del candidato
- Alta: conserva país y rol de negocio productor/propietario/prestador; no otorga privilegios administrativos.
- Perfil: acepta AR/UY/PY y rechaza países inválidos; Uruguay disponible y etiquetas Provincia/Departamento correctas.
- Servicios: país persistido por publicación, independiente del perfil; formulario y geocodificador AR/UY/PY; edición conserva ubicación inicial; cambio de país limpia ubicación anterior.
- Lista, mapa y ficha de servicios consultan país real y coordenadas guardadas. Mantienen filtros y no mezclan mercados.
- Campos: enlaces lista/mapa conservan filtros; contenidos de demanda y enlaces SEO argentinos sólo aparecen en AR; títulos regionales.
- Registro: país explícito o preferencia guardada; cambio de URL remonta el formulario; publicar campo selecciona propietario. Header, pie, home y mapa conservan país.
- Aislamiento: sólo la preview de la rama regional apunta a `wibqszhvuvpjycheaxzi`. Se eliminan del proceso las credenciales heredadas Postgres, MercadoPago, Resend, cron y secretos alternativos Supabase. Clave administrativa de otro proyecto se descarta. Las páginas públicas y Auth UAT siguen disponibles; las APIs administrativas requieren la clave privada UAT correcta.

## Preparación
La migración `20261015214052_regional_profile_service_countries.sql` ya se aplicó exclusivamente en Supabase UAT. No se aplicó a producción. Las publicaciones legacy sin país permanecen en AR; las nuevas omisiones de país se derivan del perfil una sola vez. No se reescriben los perfiles históricos ni sus roles.

La clave `SUPABASE_SERVICE_ROLE_KEY` UAT continúa en el archivo local ignorado por git. Su transferencia a Vercel sigue pendiente de aprobación explícita: no copiar secretos en comentarios, chat o repositorio. No ejecutar pruebas de escritura en una preview hasta verificar el origen UAT y configurar esta Secret exclusiva de la rama. Mantener pagos y correo transaccional deshabilitados. Supabase Auth de prueba usa el buzón ficticio autorizado.

## Validación reproducible
Node 24 y dependencias del lockfile. En el checkout, con `.env.local` privado apuntando únicamente a UAT:

```sh
npm run lint
node --test tests/regional-navigation.test.mjs
npm run build
node tests/regional-integration.mjs
```

El runner de integración inicia y detiene `next start` en el mismo proceso de ejecución que realiza las peticiones HTTP. Crea identidades administrativas ficticias, cierra sus sesiones y las elimina al finalizar; también elimina las imágenes de prueba. No sustituye un registro real ni una prueba visual.

`tests/regional-trigger.sql` comprueba nueve combinaciones país/rol dentro de una transacción con ROLLBACK, sólo en UAT.

## Recorrido pendiente en Work
1. Confirmar SHA de la PR, preview y URL Supabase UAT; comprobar que pagos/correo real siguen bloqueados.
2. Para AR/UY/PY: registro con correo autorizado, confirmación real, login y recuperación de contraseña. No desactivar confirmación para simular éxito.
3. Probar los tres roles; guardar y recargar perfil; cambiar país sin ubicaciones residuales.
4. Publicar, editar y desactivar campo con foto; comprobar país, departamento y moneda.
5. Publicar y editar servicio real por país con foto, geocodificación y coordenadas. Verificar lista, filtros, mapa, ficha y ausencia en otros mercados.
6. Ida/vuelta lista/mapa con Artigas sin resultados, Maldonado e Itapúa; conservar operación, aptitud, disponibilidad y rangos.
7. Header, pie, home, login y mapa: país/rol correctos con navegación cliente, recarga y entrada directa.
8. Regresión de favoritos, mensajes y aislamiento entre dos cuentas; limpiar únicamente fixtures de UAT.

## Límites y decisión
El límite de tres campos reales no cambia: #204 requiere una decisión de producto explícita. Los tickets #200–#206 permanecen abiertos hasta repetir la UAT visual. La entrega de estas correcciones no autoriza merge ni despliegue de producción.

Advisor UAT: sin nuevos avisos de las funciones incorporadas. Permanecen advertencias sobre `delete_own_account` SECURITY DEFINER intencional y protección de contraseñas filtradas desactivada; no se modificaron planes ni controles pagos.


## Pase V1 a producción (15 de octubre de 2026)
Migración registrada por Supabase PROD con versión `20261015214052` bajo el nombre `regional_profile_service_countries`. Se conservaron 6 usuarios, 6 perfiles, 37 campos, 3 servicios y 12 demos. Los 3 servicios legados se asignaron a AR. La misma DDL fue aplicada en UAT con versión interna `20261015142105`; no ejecutar nuevamente sin revisar el historial de cada entorno. Las advertencias del Security Advisor continúan sin cambios frente a la línea base.

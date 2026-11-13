# Chacra de Misiones y navegación — Preview

La consulta de sólo lectura en producción confirmó que `e7a4994a-6a8c-4089-813d-0ec1cc7afadf` (CHACRA EN VENTA) está activa, país AR, aptitud mixta, venta, provincia Misiones. El rol anon puede leerla con los mismos filtros públicos. Sus coordenadas son nulas. La consulta por ID en UAT no devolvió registros: ese campo productivo no está copiado a preproducción. No se insertaron datos ni se cambiaron credenciales o entornos.

El filtro de mapa descartaba cualquier publicación sin coordenadas al mover o ampliar el mapa. Ahora conserva esas fichas en la lista, indicando que su ubicación precisa está pendiente y sin inventar marcadores. Las publicaciones con coordenadas siguen respetando los límites geográficos; los filtros de país, actividad, operación y texto se conservan. El conteo distingue la inclusión de ubicaciones pendientes.

El mapa compartido anima el zoom, respeta movimiento reducido, limita los clics consecutivos a un paso cada 450 ms y espera 350 ms tras el movimiento antes de actualizar resultados. Se limpia el temporizador al desmontar. Se retira la frontera de carga de V3 para conservar la pantalla previa hasta que la ficha esté lista.

Web desktop / Web móvil / App Lite: componentes comunes; aliases Lite de catálogo y detalle apuntan a las mismas rutas V3 únicamente en Preview. Textos ES/PT/EN. Lint, TypeScript y build local aprobados. Se añadieron casos de regresión del filtro sin ejecutar suites WT/UAT ni npm test, según instrucción del usuario.

No se modifica producción. El registro real seguirá ausente de la base UAT; la corrección permite encontrarlo en listados conectados a producción cuando se apruebe y publique esta versión.

Inspección puntual del mapa en navegador: tres clics rápidos avanzan un único nivel (5 → 6); ancho móvil 320/320 px; sin errores JavaScript. La muestra local no devolvió fichas en esa inspección, por lo que no acredita la transición real de detalle. Comprobación directa del filtro con los atributos públicos de la chacra: Misiones + mixta + venta conserva una coincidencia después de aplicar límites del mapa; no genera marcador; un punto conocido fuera del área sigue excluido.

# RentoCampo — regla obligatoria de paridad de interfaces

**Alcance permanente:** todos los desarrollos y cambios futuros de diseño, navegación, comportamiento, textos, registro/login, perfiles, publicación, CTA y accesibilidad se deben evaluar e implementar en estas tres superficies del producto:

1. **Web desktop** (anchos grandes): `/` y rutas de aplicación web.
2. **Web móvil** (incluidas pantallas de 320 px): mismas rutas, diseño responsive y controles táctiles.
3. **App Lite/PWA**: rutas `/lite/**`; no asumir que heredan cambios de componentes web. Inspeccionar sus equivalentes explícitamente.

## Checklist previo a cada PR
- Identificar la ruta/componente CSS de las tres superficies y aplicar el mismo objetivo funcional y de contenido. Mantener diferencias visuales justificadas por el dispositivo.
- Verificar mercados e idiomas ya soportados, en especial AR/es, BR/pt-BR y US/en.
- Probar desktop, móvil 320/375/390 px y App Lite: ancho sin desbordes, CTA visible, contraste, foco, navegación, jerarquía, títulos y textos.
- Probar estados de usuario (anónimo/autenticado), errores, recuperación de clave y perfil. Evitar pedir datos antes de necesitarlos; nunca perder datos preexistentes al ocultar campos.
- Verificar que el botón y el flujo son operativos, no sólo visuales; preservar compatibilidad con publicaciones.
- Ejecutar `npm run lint`, `node --test tests/ux-parity.test.mjs` y `npm run build`. El PR debe pasar CI y obtener preview. No desplegar en PROD sin pruebas y aprobación cuando corresponda.
- Revisar y actualizar `tests/ux-parity.test.mjs` si se agregan rutas o componentes homólogos.
- En la descripción del PR incluir explícitamente "Web desktop / Web móvil / App Lite" con estado y evidencia de cada superficie.

**No considerar un cambio terminado sólo porque está correcto en una de las tres versiones.** Reutilizar componentes comunes siempre que sea viable; si son diferentes, implementar y validar ambos códigos.

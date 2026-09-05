# ✅ RentoCampo — Checklist de Desarrollo

Usá este archivo como plantilla para cada sesión de trabajo. Copialo, completá las casillas y commitealo si querés tracking.

---

## 🚀 Inicio de Sesión

- [ ] `git pull origin main` — traer los últimos cambios
- [ ] Abrir VS Code: `code .`
- [ ] Iniciar Live Server (clic derecho en `index.html` → "Open with Live Server")
- [ ] Verificar que `http://127.0.0.1:5500` abre la landing correctamente

---

## 🛠️ Durante el Desarrollo

- [ ] Editar los archivos necesarios (`index.html`, `styles.css`, `main.js`)
- [ ] Verificar cambios en el navegador (Live Server auto-recarga)
- [ ] Revisar en mobile (DevTools → Toggle Device Toolbar o `Ctrl+Shift+M`)
- [ ] Verificar que no hay errores en la consola del navegador (`F12`)

---

## 💾 Commit y Deploy

- [ ] Revisar los cambios: `git diff`
- [ ] Agregar archivos: `git add .`
- [ ] Commit con mensaje descriptivo:
  ```bash
  git commit -m "feat: descripción corta del cambio"
  ```
  Convención de mensajes:
  - `feat:` nueva funcionalidad
  - `fix:` corrección de bug
  - `style:` cambios visuales/CSS
  - `docs:` cambios en documentación
  - `chore:` tareas de mantenimiento

- [ ] Push: `git push origin main`

---

## ✅ Verificación Post-Deploy

- [ ] Esperar ~30 segundos
- [ ] Abrir https://rentocampo.vercel.app y verificar el cambio
- [ ] Revisar https://vercel.com/dashboard → proyecto rentocampo → estado ✅ Ready
- [ ] Probar el formulario/botón de WhatsApp si fue modificado
- [ ] Verificar en mobile (navegador del celular o DevTools)

---

## 🔚 Cierre de Sesión

- [ ] Confirmar que el deploy fue exitoso
- [ ] Cerrar Live Server (botón "Port: 5500" en la barra inferior de VS Code)
- [ ] Actualizar `WORKFLOW.md` si cambió algo del roadmap
- [ ] Si hay tareas pendientes, abrí un issue en GitHub

---

## 📋 Plantilla de Issue / Tarea

```
## Tarea: [nombre]

**Objetivo:** Qué queremos lograr

**Archivos a modificar:**
- [ ] index.html
- [ ] styles.css
- [ ] main.js

**Criterios de aceptación:**
- [ ] El cambio se ve en la URL de producción
- [ ] Funciona en mobile
- [ ] No hay errores en consola

**Notas:**
```

---

**Última actualización:** 2026-08-28  
**Mantenido por:** @dnigro

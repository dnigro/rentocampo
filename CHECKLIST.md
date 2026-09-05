# ✅ RentoCampo — Checklist de sesión de trabajo

Copiá este checklist al inicio de cada sesión para no olvidar ningún paso.

---

## 🟢 Al comenzar la sesión

- [ ] `git pull origin main` — traer los últimos cambios
- [ ] Abrir VS Code: `code ~/rentocampo`
- [ ] Activar Live Server: click en **"Go Live"** en la barra inferior de VS Code
- [ ] Verificar que http://127.0.0.1:5500 abre correctamente en el navegador

---

## 🔄 Durante el desarrollo

- [ ] Hacer cambios en `index.html`, `styles.css` o `main.js`
- [ ] Verificar los cambios en el navegador (Live Server recarga automáticamente)
- [ ] Commitear frecuentemente con mensajes descriptivos:
  ```bash
  git add .
  git commit -m "feat: descripción corta del cambio"
  ```

---

## 🚀 Al terminar / deployar

- [ ] Revisar los cambios: `git diff` o `git status`
- [ ] Commitear todo:
  ```bash
  git add .
  git commit -m "feat: resumen de lo que hice"
  ```
- [ ] Push a main:
  ```bash
  git push origin main
  ```
- [ ] Esperar ~30 segundos y verificar el deploy en https://rentocampo.vercel.app
- [ ] Verificar en https://vercel.com/ que el deploy fue exitoso

---

## 📋 Comandos de referencia rápida

```bash
# Ver estado del repo
git status

# Ver historial de commits
git log --oneline -10

# Deshacer cambios no commiteados
git checkout -- .

# Ver diferencias
git diff

# Actualizar desde GitHub
git pull origin main

# Deployar
git add . && git commit -m "feat: cambio" && git push origin main
```

---

## 🌐 Links importantes

| Link | Descripción |
|------|-------------|
| http://127.0.0.1:5500 | Live Server local |
| https://rentocampo.vercel.app | Producción |
| https://github.com/dnigro/rentocampo | Repositorio GitHub |
| https://vercel.com/ | Dashboard Vercel |

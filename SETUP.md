# 🚀 RentoCampo — Guía de Setup para Desarrolladores

Esta guía te lleva paso a paso desde cero hasta tener el entorno listo, con auto-deploy en Vercel y VS Code configurado.

---

## 📋 Requisitos Previos

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Git | 2.x | https://git-scm.com |
| VS Code | 1.80+ | https://code.visualstudio.com |
| Node.js (opcional) | 18+ | https://nodejs.org |

---

## ⚡ Inicio Rápido (5 minutos)

```bash
# 1. Clonar el repositorio
git clone https://github.com/dnigro/rentocampo.git
cd rentocampo

# 2. Abrir en VS Code
code .
```

Cuando VS Code abra, verás una notificación para instalar las extensiones recomendadas. **Hacé clic en "Install All"**.

---

## 🧩 Extensiones de VS Code

Las extensiones están definidas en `.vscode/extensions.json` y VS Code las sugerirá automáticamente.

| Extensión | ID | Función |
|---|---|---|
| Prettier | `esbenp.prettier-vscode` | Formateador de código |
| Live Server | `ritwickdey.liveserver` | Servidor local con hot-reload |
| HTML CSS Support | `ecmel.vscode-html-css` | Autocompletado en HTML/CSS |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` | Soporte Tailwind (para futuro) |
| SonarLint | `sonarsource.sonarlint-vscode` | Análisis de calidad de código |

Para instalar manualmente:

```
Ctrl+Shift+X → Buscar por nombre → Install
```

---

## 💻 Flujo de Desarrollo Local

### Iniciar servidor local

1. Abrí `index.html` en el explorador de archivos de VS Code
2. Hacé clic derecho → **"Open with Live Server"**
3. El navegador abre `http://127.0.0.1:5500` con hot-reload automático

### Editar y ver cambios

```
index.html  → Estructura y contenido
styles.css  → Estilos y diseño
main.js     → Lógica (formulario WhatsApp, etc.)
```

Cada vez que guardás un archivo, Live Server recarga el navegador automáticamente.

### Formateo automático

VS Code está configurado para formatear con Prettier al guardar (`editor.formatOnSave: true`). No necesitás hacer nada extra.

---

## 🔄 Auto-Deploy en Vercel

### Cómo funciona

```
Editás código en VS Code
    ↓
git add . && git commit -m "tu mensaje"
    ↓
git push origin main
    ↓
Vercel detecta el push automáticamente
    ↓
Deploy en ~30 segundos
    ↓
https://rentocampo.vercel.app ✅
```

### Comandos de deploy

```bash
# Guardar cambios y deployar
git add .
git commit -m "feat: descripción del cambio"
git push origin main
```

### Verificar el deploy

1. Ir a https://vercel.com/dashboard
2. Buscar el proyecto `rentocampo`
3. Ver el status del último deploy (debería ser ✅ Ready)
4. Clic en la URL para ver el resultado

---

## 📁 Estructura del Proyecto

```
rentocampo/
├── index.html          # Landing page principal
├── styles.css          # Estilos globales
├── main.js             # Lógica frontend (formulario WhatsApp)
├── vercel.json         # Configuración de Vercel (headers, rewrites)
├── .vercelignore       # Archivos excluidos del deploy
├── .gitignore          # Archivos excluidos de Git
├── .vscode/
│   ├── extensions.json # Extensiones recomendadas
│   └── settings.json   # Configuración del editor
├── README.md           # Documentación general
├── WORKFLOW.md         # Estrategia de desarrollo y roadmap
├── SETUP.md            # Esta guía
└── CHECKLIST.md        # Checklist de tareas reutilizable
```

---

## 🔧 Configuración de Vercel

El archivo `vercel.json` ya está configurado con:

- **Cache optimizado**: HTML con 1 hora de cache, CSS/JS con 1 año (inmutable)
- **Rewrites**: Todas las rutas redirigen a `index.html` (útil si agregás rutas en el futuro)

No necesitás modificarlo a menos que agregues nuevas páginas o rutas.

### Variables de entorno

La landing no usa variables de entorno. Si en el futuro necesitás agregar una:

1. Ir a Vercel Dashboard → tu proyecto → Settings → Environment Variables
2. Agregar la variable
3. Hacer un nuevo push para que se aplique

---

## ✅ Verificación del Pipeline

Para confirmar que todo funciona:

```bash
# 1. Hacé un cambio de prueba (por ejemplo, en index.html)
echo "<!-- test -->" >> index.html

# 2. Commiteá y pusheá
git add index.html
git commit -m "test: verificar pipeline de deploy"
git push origin main

# 3. En ~30 segundos, verificá en:
#    https://rentocampo.vercel.app
#    https://vercel.com/dashboard → proyecto rentocampo

# 4. Revertí el cambio de prueba si es necesario
git revert HEAD
git push origin main
```

---

## 🛠️ Solución de Problemas

### Live Server no abre

- Verificar que la extensión `ritwickdey.liveserver` está instalada
- Hacer clic derecho en `index.html` → "Open with Live Server"
- Si el puerto 5500 está ocupado: VS Code Settings → `liveServer.settings.port` → cambiar a 5501

### Prettier no formatea al guardar

- Verificar que `esbenp.prettier-vscode` está instalada
- `Ctrl+Shift+P` → "Format Document With..." → Seleccionar Prettier
- Si hay conflicto de formateadores: `Ctrl+Shift+P` → "Open User Settings (JSON)" → agregar:
  ```json
  "[html]": { "editor.defaultFormatter": "esbenp.prettier-vscode" }
  ```

### El deploy en Vercel falla

1. Verificar en https://vercel.com/dashboard → tu proyecto → última deployment
2. Clic en el deploy fallido → ver los logs
3. Causas comunes:
   - Error de sintaxis en `vercel.json` → validar JSON en https://jsonlint.com
   - Archivos faltantes → verificar que `index.html` existe en la raíz

### Push rechazado por Git

```bash
# Si hay cambios remotos que no tenés localmente:
git pull origin main
# Resolver conflictos si los hay
git push origin main
```

### VS Code no sugiere extensiones

- `Ctrl+Shift+P` → "Extensions: Show Recommended Extensions"
- Instalar desde esa lista

---

## 📚 Recursos

- [Vercel Docs](https://vercel.com/docs)
- [VS Code Docs](https://code.visualstudio.com/docs)
- [Prettier Config](https://prettier.io/docs/en/configuration.html)
- [Live Server Docs](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)

---

**Última actualización:** 2026-08-28  
**Mantenido por:** @dnigro

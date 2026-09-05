# 🌾 RentoCampo — Guía de Setup Local

## Requisitos previos

| Herramienta | Versión mínima | Descarga |
|-------------|---------------|---------|
| Git | 2.x | https://git-scm.com/ |
| VS Code | 1.80+ | https://code.visualstudio.com/ |
| Navegador moderno | Chrome/Firefox/Edge | — |

---

## ⚡ Setup automático (una línea)

> ⚠️ **Seguridad:** Se recomienda descargar y revisar el script antes de ejecutarlo (opción B).

**Opción A — descarga y ejecuta directamente:**

```bash
curl -fsSL https://raw.githubusercontent.com/dnigro/rentocampo/main/setup.sh | bash
```

**Opción B (recomendada) — descarga primero, revisá el script, luego ejecutalo:**

```bash
curl -fsSL https://raw.githubusercontent.com/dnigro/rentocampo/main/setup.sh -o setup.sh
# Revisá el contenido:
cat setup.sh
# Ejecutá cuando estés conforme:
bash setup.sh
```

El script va a:
1. Clonar (o actualizar) el repositorio en `~/rentocampo`
2. Verificar que todos los archivos de configuración están en su lugar
3. Verificar VS Code y la extensión Live Server
4. Verificar la conexión con el remote de GitHub (Vercel auto-deploy)
5. Abrir VS Code automáticamente

---

## 🔧 Setup manual paso a paso

```bash
# 1. Clonar el repo
git clone https://github.com/dnigro/rentocampo.git
cd rentocampo

# 2. Abrir en VS Code (instalar extensiones recomendadas cuando aparezca el prompt)
code .
```

---

## 🚀 Flujo de trabajo diario

```bash
# Ver Live Server en tiempo real
# → En VS Code: click en "Go Live" en la barra de estado inferior

# Commitear y deployar
git add .
git commit -m "feat: descripción del cambio"
git push origin main
# ✅ Vercel auto-deploya en ~30 segundos
```

**Producción:** https://rentocampo.vercel.app

---

## 🧩 Extensiones VS Code recomendadas

Definidas en `.vscode/extensions.json` — VS Code las sugiere automáticamente al abrir el proyecto.

| Extensión | Descripción |
|-----------|-------------|
| Prettier | Formateador de código |
| Live Server | Servidor local con recarga en vivo |
| Tailwind CSS IntelliSense | Autocompletado de clases Tailwind |
| HTML CSS Support | Soporte HTML/CSS mejorado |
| SonarLint | Análisis estático de código |

---

## 🔍 Verificar configuración manualmente

```bash
# Archivos que deben existir:
ls .vscode/extensions.json   # extensiones VS Code
ls .vscode/settings.json     # configuración del editor
ls vercel.json               # configuración de deploy
ls .gitignore                # archivos ignorados por git

# Remote de git (para Vercel auto-deploy)
git remote -v
```

---

## 🛠️ Troubleshooting

**`code` no se reconoce como comando**
→ Abrí VS Code, presioná `Cmd+Shift+P` (Mac) o `Ctrl+Shift+P` (Windows/Linux), buscá "Shell Command: Install 'code' command in PATH" y ejecutalo.

**Live Server no aparece**
→ En VS Code, ir a Extensions (`Ctrl+Shift+X`), buscar "Live Server" e instalar el de Ritwick Dey.

**El push no triggerea deploy en Vercel**
→ Verificar que el proyecto en https://vercel.com/ está conectado al repositorio `dnigro/rentocampo` y que el branch de producción es `main`.

---

## 📁 Estructura del proyecto

```
rentocampo/
├── index.html          # Página principal
├── styles.css          # Estilos
├── main.js             # Lógica JavaScript
├── vercel.json         # Configuración Vercel
├── .vscode/
│   ├── extensions.json # Extensiones recomendadas
│   └── settings.json   # Configuración del editor
├── .gitignore
├── .vercelignore
├── setup.sh            # Script de setup automático
├── SETUP.md            # Esta guía
└── CHECKLIST.md        # Checklist por sesión
```

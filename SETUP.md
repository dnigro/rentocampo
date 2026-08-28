# RentoCampo - Guía de Setup Automático

## 🚀 Setup en un solo comando

```bash
curl -fsSL https://raw.githubusercontent.com/dnigro/rentocampo/main/setup.sh -o setup.sh
# Revisá el script antes de ejecutarlo (opcional pero recomendado)
bash setup.sh
```

O si ya tenés el repo clonado:

```bash
bash setup.sh
```

---

## 📋 Requisitos previos

- **Git** instalado ([git-scm.com](https://git-scm.com/))
- **VS Code** instalado ([code.visualstudio.com](https://code.visualstudio.com/))
- **Node.js** (opcional, solo para herramientas extra)

---

## 🔧 Setup manual paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/dnigro/rentocampo.git
cd rentocampo
```

### 2. Traer los últimos cambios

```bash
git pull origin main
```

### 3. Abrir en VS Code

```bash
code .
```

### 4. Instalar extensiones recomendadas

VS Code va a mostrar una notificación:
> "This workspace has extension recommendations"

→ Hacé click en **"Install All"**

Las extensiones que se instalan automáticamente:
- **Prettier** (`esbenp.prettier-vscode`) — Formateador de código
- **Live Server** (`ritwickdey.liveserver`) — Servidor local con hot reload
- **Tailwind CSS** (`bradlc.vscode-tailwindcss`) — Soporte Tailwind
- **HTML CSS Support** (`ecmel.vscode-html-css`) — Autocompletado CSS
- **SonarLint** (`sonarsource.sonarlint-vscode`) — Análisis de calidad

### 5. Iniciar Live Server

Abrí `index.html` y hacé click en **"Go Live"** en la barra inferior de VS Code.

Tu landing va a estar disponible en: `http://127.0.0.1:5500`

---

## 🔄 Flujo de desarrollo diario

```bash
# 1. Traer últimos cambios
git pull origin main

# 2. Editar archivos
# - index.html
# - styles.css
# - main.js

# 3. Verificar en Live Server (automático con hot reload)

# 4. Commit y push
git add .
git commit -m "feat: descripción del cambio"
git push origin main
```

✅ **Vercel detecta el push y redeploya automáticamente en ~30 segundos**

---

## 🌐 URLs importantes

| Entorno | URL |
|---------|-----|
| Producción | https://rentocampo.vercel.app |
| Local | http://127.0.0.1:5500 |
| Repositorio | https://github.com/dnigro/rentocampo |

---

## 🔍 Verificar que todo funciona

### Checklist de verificación

- [ ] `git status` muestra el repo limpio
- [ ] VS Code tiene las extensiones instaladas
- [ ] Live Server corre en `http://127.0.0.1:5500`
- [ ] Guardás un archivo y se auto-formatea
- [ ] Push a main → Vercel redeploya

### Verificar deploy en Vercel

1. Hacé un push cualquiera
2. Entrá a [vercel.com/dnigro/rentocampo](https://vercel.com/dnigro/rentocampo)
3. Verificá que el build corrió exitosamente
4. Abrí https://rentocampo.vercel.app

---

## 🛠️ Troubleshooting

### VS Code no sugiere extensiones
→ Abrí la paleta de comandos (`Ctrl+Shift+P`) y buscá:
`Extensions: Show Recommended Extensions`

### Live Server no arranca
→ Verificá que la extensión `ritwickdey.liveserver` está instalada  
→ Click derecho en `index.html` → "Open with Live Server"

### Vercel no redeploya
→ Verificá que el push llegó a `main` con `git log --oneline -5`  
→ Revisá el dashboard de Vercel para ver errores de build

### Error al formatear con Prettier
→ Abrí la paleta de comandos y ejecutá: `Format Document With...` → elegí Prettier

---

## 📁 Estructura del proyecto

```
rentocampo/
├── index.html          ← Landing page principal
├── styles.css          ← Estilos
├── main.js             ← JavaScript (formulario WhatsApp)
├── vercel.json         ← Configuración de Vercel
├── .gitignore          ← Archivos ignorados por Git
├── .vercelignore       ← Archivos ignorados en deploy
├── .vscode/
│   ├── extensions.json ← Extensiones recomendadas
│   └── settings.json   ← Configuración del editor
├── README.md           ← Info del proyecto
├── SETUP.md            ← Este archivo
├── CHECKLIST.md        ← Checklist de trabajo
└── WORKFLOW.md         ← Estrategia de desarrollo
```

---

**Última actualización:** 2026-08-28  
¿Problemas? Abrí un issue en el repo o escribí a dantenigro@gmail.com

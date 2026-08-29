# rentocampo

Landing page para [RentoCampo](https://rentocampo.vercel.app) — conecta propietarios de campos con arrendatarios en Argentina.

## 🚀 Desarrollo local con VS Code

### Requisitos
- [VS Code](https://code.visualstudio.com/)
- Extensión **Live Server** (se sugiere automáticamente al abrir el proyecto)

### Pasos
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/dnigro/rentocampo.git
   cd rentocampo
   ```
2. Abrir en VS Code:
   ```bash
   code .
   ```
3. Instalar las extensiones recomendadas cuando VS Code lo sugiera.
4. Click derecho en `index.html` → **"Open with Live Server"** para ver los cambios en vivo.

## 📦 Deploy automático con Vercel

Cada push a la rama `main` dispara un deploy automático en Vercel:

```
git add .
git commit -m "feat: descripción del cambio"
git push origin main
# ✅ Vercel detecta el push y redeploya automáticamente
```

URL de producción: **https://rentocampo.vercel.app**

## 🗂 Estructura del proyecto

```
rentocampo/
├── index.html        # Página principal
├── css/              # Estilos
├── js/               # Scripts
├── assets/           # Imágenes y recursos
├── vercel.json       # Configuración de Vercel
└── .vscode/          # Configuración de VS Code
```

## 🛠 Stack

- HTML5 / CSS3 / JavaScript (vanilla)
- Deploy: [Vercel](https://vercel.com)
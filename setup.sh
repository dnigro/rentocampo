#!/usr/bin/env bash
# setup.sh — RentoCampo local setup script
# Usage: bash setup.sh
# Or run directly from the repo root after cloning.

set -e

# Print a friendly message on unexpected errors
trap 'echo ""; echo "❌ Error inesperado. Revisá el mensaje de arriba e intentá de nuevo."' ERR

REPO_URL="https://github.com/dnigro/rentocampo.git"
DIR="rentocampo"

echo ""
echo "🌾 RentoCampo — Setup automático"
echo "================================="
echo ""

# ── 1. Clone or update ──────────────────────────────────────────────────────

if [ -d "$DIR/.git" ]; then
  echo "📂 Repositorio ya existe. Actualizando..."
  cd "$DIR"
  git pull origin main
  echo "✅ Repo actualizado"
elif [ "$(basename "$PWD")" = "$DIR" ] && [ -d ".git" ]; then
  echo "📂 Dentro del repositorio. Actualizando..."
  git pull origin main
  echo "✅ Repo actualizado"
else
  echo "📥 Clonando repositorio..."
  git clone "$REPO_URL"
  cd "$DIR"
  echo "✅ Repo clonado"
fi

echo ""

# ── 2. Verify key files ─────────────────────────────────────────────────────

echo "🔍 Verificando archivos de configuración..."

FILES=(".vscode/extensions.json" ".vscode/settings.json" "vercel.json" ".gitignore")
ALL_OK=true

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    echo "  ✅ $f"
  else
    echo "  ❌ $f (no encontrado)"
    ALL_OK=false
  fi
done

if [ "$ALL_OK" = false ]; then
  echo ""
  echo "⚠️  Algunos archivos de configuración faltan. Revisá el repo."
  exit 1
fi

echo ""

# ── 3. Open in VS Code ───────────────────────────────────────────────────────

if command -v code &>/dev/null; then
  echo "🖥️  Abriendo VS Code..."
  code .
  echo "✅ VS Code abierto"
  echo ""
  echo "👉 VS Code va a sugerir instalar extensiones recomendadas."
  echo "   Hacé click en 'Install All' cuando aparezca la notificación."
  echo ""
  echo "👉 Para iniciar Live Server:"
  echo "   Abrí index.html y hacé click en 'Go Live' en la barra inferior."
else
  echo "⚠️  VS Code (comando 'code') no encontrado en el PATH."
  echo "   Abrí VS Code manualmente y abrí la carpeta: $(pwd)"
  echo ""
  echo "   Para agregar 'code' al PATH en VS Code:"
  echo "   Ctrl+Shift+P → 'Shell Command: Install code command in PATH'"
fi

echo ""
echo "🚀 Setup completo!"
echo ""
echo "📌 Próximos pasos:"
echo "   1. Instalar extensiones recomendadas en VS Code"
echo "   2. Abrir index.html y click en 'Go Live'"
echo "   3. Editar archivos — los cambios se ven en tiempo real"
echo "   4. git add . && git commit -m 'feat: tu cambio' && git push"
echo "   5. Vercel redeploya automáticamente en ~30 segundos"
echo ""
echo "🌐 Producción: https://rentocampo.vercel.app"
echo "📁 Repo:       https://github.com/dnigro/rentocampo"
echo ""

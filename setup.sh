#!/usr/bin/env bash
# ============================================================
# RentoCampo — Automated local development setup
# Usage: bash setup.sh
# ============================================================

set -e

REPO_URL="https://github.com/dnigro/rentocampo.git"
TARGET_DIR="$HOME/rentocampo"

# Clean up a partial clone if the script exits unexpectedly during cloning
_CLONING=false
trap 'if [ "$_CLONING" = true ] && [ -d "$TARGET_DIR" ] && [ ! -d "$TARGET_DIR/.git" ]; then
  echo ""; echo "⚠️  La clonación fue interrumpida. Limpiando $TARGET_DIR ..."; rm -rf "$TARGET_DIR"; fi' EXIT

echo ""
echo "🌾 RentoCampo — Setup automático"
echo "================================="
echo ""

# ── 1. Clone or update ──────────────────────────────────────
if [ -d "$TARGET_DIR/.git" ]; then
  echo "📂 Repositorio ya existe. Actualizando..."
  if ! git -C "$TARGET_DIR" pull --ff-only; then
    echo "❌ No se pudo actualizar el repositorio."
    echo "   Si hay cambios locales sin commitear, ejecutá 'git stash' primero."
    exit 1
  fi
  echo "✅ Repo actualizado"
else
  echo "📥 Clonando repositorio en $TARGET_DIR ..."
  _CLONING=true
  if ! git clone "$REPO_URL" "$TARGET_DIR"; then
    echo "❌ Error al clonar el repositorio. Verificá tu conexión a internet y permisos."
    exit 1
  fi
  _CLONING=false
  echo "✅ Repo clonado"
fi

# ── 2. Verify configuration files ───────────────────────────
echo ""
echo "🔍 Verificando archivos de configuración..."
FILES=(
  ".vscode/extensions.json"
  ".vscode/settings.json"
  "vercel.json"
  ".gitignore"
)
ALL_OK=true
for f in "${FILES[@]}"; do
  if [ -f "$TARGET_DIR/$f" ]; then
    echo "  ✅ $f"
  else
    echo "  ❌ $f — FALTANTE"
    ALL_OK=false
  fi
done

if [ "$ALL_OK" = false ]; then
  echo ""
  echo "⚠️  Algunos archivos de configuración no se encontraron."
  echo "   Revisá el repositorio en GitHub."
  exit 1
fi

# ── 3. Check VS Code installation ───────────────────────────
echo ""
echo "🔍 Verificando VS Code..."
if command -v code &>/dev/null; then
  echo "  ✅ VS Code está instalado ($(code --version | head -1))"
  VSCODE_AVAILABLE=true
else
  echo "  ⚠️  VS Code no encontrado en el PATH."
  echo "     Instalalo desde https://code.visualstudio.com/"
  VSCODE_AVAILABLE=false
fi

# ── 4. Check Live Server (VS Code extension) ─────────────────
if [ "$VSCODE_AVAILABLE" = true ]; then
  echo ""
  echo "🔍 Verificando extensión Live Server..."
  if code --list-extensions 2>/dev/null | grep -q "ritwickdey.liveserver"; then
    echo "  ✅ Live Server instalado"
  else
    echo "  ℹ️  Live Server no está instalado todavía."
    echo "     Se instalará automáticamente cuando abras el proyecto en VS Code"
    echo "     (las extensiones recomendadas aparecen en .vscode/extensions.json)."
  fi
fi

# ── 5. Check git remote / Vercel ────────────────────────────
echo ""
echo "🔍 Verificando git remote (Vercel auto-deploy)..."
REMOTE=$(git -C "$TARGET_DIR" remote get-url origin 2>/dev/null || true)
if [ -n "$REMOTE" ]; then
  echo "  ✅ Remote origin: $REMOTE"
  echo "  ✅ Cada 'git push origin main' dispara un deploy en Vercel automáticamente"
else
  echo "  ⚠️  No se encontró remote origin."
fi

# ── 6. Open VS Code ──────────────────────────────────────────
echo ""
if [ "$VSCODE_AVAILABLE" = true ]; then
  echo "🚀 Abriendo VS Code..."
  code "$TARGET_DIR"
  echo "  ✅ VS Code abierto en $TARGET_DIR"
else
  echo "💡 Abrí VS Code manualmente y elegí:"
  echo "   File → Open Folder → $TARGET_DIR"
fi

# ── 7. Final summary ─────────────────────────────────────────
echo ""
echo "🎉 Setup completo!"
echo ""
echo "📌 Próximos pasos:"
echo "   1. En VS Code: instalar extensiones recomendadas cuando aparezca el prompt"
echo "   2. Abrir index.html y hacer click en 'Go Live' (barra inferior de VS Code)"
echo "   3. Editar archivos — los cambios se ven en tiempo real"
echo "   4. Para deployar:"
echo "      git add ."
echo "      git commit -m 'feat: tu cambio'"
echo "      git push origin main"
echo "   5. Vercel redeploya automáticamente en ~30 segundos"
echo ""
echo "🌐 Producción: https://rentocampo.vercel.app"
echo "📁 Repo local:  $TARGET_DIR"
echo "📁 GitHub:      https://github.com/dnigro/rentocampo"
echo ""

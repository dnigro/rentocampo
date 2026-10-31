# RentoCampo Lite · iPhone / iPad por TestFlight

**Estado:** Android APK 0.2.2 y compilación iOS Simulator verificados en GitHub Actions. La IPA firmada y TestFlight requieren conectar **tu cuenta Apple Developer** con **Expo EAS** una sola vez. El flujo de este repositorio es **exclusivamente manual**: no ejecuta builds pagos ni envía a App Store por cada push.

## 1. Inicializar Expo sin entregar contraseñas por chat

En tu equipo o sesión de desarrollo autorizada:

```sh
git checkout feat/mobile-app-foundation
cd apps/mobile
npx --yes eas-cli@latest login
npx --yes eas-cli@latest init
npx --yes eas-cli@latest credentials --platform ios
```

En el asistente de credenciales, elegí el perfil `production` y asociá tu cuenta Apple Developer para crear/seleccionar el certificado de distribución y provisioning profile del **bundle ID `com.rentocampo.app`**. Configurá una **App Store Connect API Key** para EAS Submit, desde el gestor de credenciales de EAS (no copies el `.p8` al repositorio, tampoco a ChatGPT).

`eas init` genera `expo.extra.eas.projectId` en `apps/mobile/app.json`. Subí ese cambio a la rama `feat/mobile-app-foundation`.

## 2. Registrar app en App Store Connect

Abrí https://appstoreconnect.apple.com/ → **Apps → + → New App**. Elegí la organización/Team de Apple correcta, nombre RentoCampo, plataforma iOS y el mismo bundle ID `com.rentocampo.app`.

En la ficha creada copiá el **Apple ID numérico de App Store Connect** (no es una clave privada) y agregalo a:

```json
{
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "APPLE_ID_NUMERICO"
      }
    }
  }
}
```

dentro de `apps/mobile/eas.json`, sin eliminar las demás configuraciones.

## 3. Conectar Expo con GitHub de forma segura

Desde Expo → **Account settings → Access tokens**, generá un token con acceso al proyecto. Guardalo como secreto `EXPO_TOKEN` en el repositorio GitHub: **Settings → Secrets and variables → Actions → New repository secret**. Nunca compartas el token en el chat, en PRs, issues o commits.

## 4. Lanzar TestFlight de manera controlada

GitHub → **Actions → RentoCampo iOS firmado - TestFlight (manual) → Run workflow**.

- `signed-build`: genera una compilación firmada en EAS, sin subirla a TestFlight.
- `testflight-submit`: construye y luego carga la versión en App Store Connect para TestFlight. Esta opción es **intencional y manual**. No pone la app a la venta ni la publica en la App Store.

Para invitar testers: App Store Connect → **RentoCampo → TestFlight → Internal Testing**. Los testers deben instalar la app TestFlight de Apple.

## Verificaciones antes de invitar personas

- Revisar el escudo RC oficial en launcher, encabezado y pantalla de inicio.
- Comprobar Inicio / Campos / Servicios / Perfil, login, recuperación de contraseña, cambio de país e idiomas.
- Verificar imágenes reales y fallback de DEMO en la WebView iOS.
- Probar en iPhone y iPad reales.
- Confirmar aspectos de privacidad, cumplimiento de cifrado y condiciones de Apple.

**Importante:** el ZIP del simulador de iOS no sirve para instalar la aplicación en un iPhone. La primera carga a TestFlight puede requerir completar información y verificaciones adicionales de Apple. `Expo EAS` y Apple Developer son servicios externos; su uso puede tener costos según la cuenta y los recursos utilizados.

Documentación oficial: https://docs.expo.dev/submit/ios/ y https://docs.expo.dev/submit/testflight/.

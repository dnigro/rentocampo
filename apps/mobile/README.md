# RentoCampo App Lite — Android + iOS

La app utiliza **un solo código React Native / Expo 54** para Android y iOS. Se conecta a https://rentocampo.com para los listados, registro, mensajes y operaciones de Campos, Servicios y Perfil.

## Estado de la versión 0.2.2

- Android: compila como APK instalable desde `.github/workflows/mobile-android-debug.yml`.
- iOS Simulator: `.github/workflows/mobile-ios-simulator.yml` compila y adjunta un archivo **sin firmar** `.app` para simulador macOS.
- iPhone / iPad físicos: hay que obtener certificados y perfiles de firma de Apple antes de generar una IPA para TestFlight o instalación en dispositivo. No se puede instalar el artefacto del simulador en un iPhone.
- TestFlight / App Store: configurados los perfiles EAS en `eas.json`, pero **sin lanzamiento automático**. Se requiere Apple Developer Program y un proyecto Expo (EAS) asociado; no hay credenciales ni proyecto EAS predefinidos.

## Misma identidad en ambas plataformas

Escudo original **RC** desde `assets/icon.png`; encabezado nativo verde inglés, blanco, gris y plateado; navegación **Inicio / Campos / Servicios / Perfil**; selector de país. El catálogo, los DEMO y las fotografías se cargan desde la web pública de RentoCampo. Se mantiene la misma base de datos. El idioma regional se sincroniza por país.

## Desarrollo

```sh
cd apps/mobile
npm install
npx expo install --fix
npm run typecheck
npx expo start
```

En una máquina Mac con Xcode y CocoaPods:

```sh
cd apps/mobile
npx expo prebuild --platform ios --clean
npx expo run:ios
```

## Construcciones con EAS

La primera vez se debe iniciar sesión y asociar el proyecto Expo: `npx eas-cli login` y `npx eas-cli init`. No se almacena ningún token ni secreto en Git.

```sh
cd apps/mobile
# Android APK de prueba
npx eas-cli build --platform android --profile android-apk

# iOS Simulator, sin firma Apple
npx eas-cli build --platform ios --profile ios-simulator

# iPhone físico: requiere cuenta Apple Developer y dispositivos registrados
npx eas-cli build --platform ios --profile ios-device-test

# TestFlight: requiere Apple Developer, firma y App Store Connect
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --profile production
```

El último paso **no** se ejecuta de forma automática, para evitar costos y publicaciones involuntarias. El propietario de la cuenta debe autorizar y configurar las credenciales.

## Checklist mínimo antes de distribuir a testers

1. Comprobar el ícono oficial RC al instalar y en el encabezado, sin texto superpuesto.
2. Inicio, Campos, Servicios y Perfil en Android e iOS.
3. Comprobar fotografías reales y reemplazo ilustrativo cuando faltan fotos de DEMO.
4. Registro, recuperación de contraseña, login, mensajería y estado de sesión.
5. Cambio AR / BR / US y navegación por regiones; probar permisos/cookies en WKWebView.
6. Confirmar dispositivos, versión mínima de iOS y firma del bundle `com.rentocampo.app`.

## Límites

La app requiere Internet para la mayoría de sus funciones. La compilación de simulador no implica que ya exista una IPA firmada ni que TestFlight se encuentre disponible. Para pruebas sin cuenta Apple, usar el sitio en Safari o la app del simulador.

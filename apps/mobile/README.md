# RentoCampo Mobile — prototipo interno

Aplicación React Native con Expo en el MISMO repositorio que la web. Es un primer shell de navegación, NO una app completa ni lista para Google Play/App Store.

## Ejecutar localmente
Requisitos: Node.js y npm, Android Emulator o Expo Go compatible.

```sh
cd apps/mobile
npm install
npx expo install --fix
npm run start
```

Se usan versiones iniciales de Expo SDK 54. Ejecutar `expo install --fix` y verificar la matriz de versiones antes de considerar un build; las dependencias no fueron instaladas ni probadas en CI.

## Qué funciona en este prototipo
- Pantalla inicial nativa, blanco/negro, con accesos a campos, servicios y login.
- Los enlaces se abren en el navegador externo, conservando la web productiva y su sesión web.
- No solicita claves, ni modifica Supabase, ni requiere cuenta de desarrollador.

## Qué NO funciona todavía
- No tiene login nativo, mapas nativos, mensajería nativa, favoritos nativos, notificaciones ni Firebase.
- No se generó APK/IPA ni se verificó compilación en dispositivo.
- El monograma RC es SOLO texto provisional; reemplazarlo con el asset final aprobado antes de publicar.
- Este shell no debe enviarse a revisión de tiendas: aún necesita funciones móviles reales.

## Próximos pasos
1. Ejecutar en Android y verificar compatibilidad del SDK.
2. Crear adaptador de API/autenticación móvil (Supabase) y deep links.
3. Implementar listados y fichas nativas con APIs existentes, sin duplicar backend.
4. Analítica Firebase y notificaciones.
5. Revisión de privacidad, assets definitivos, compilaciones firmadas y tiendas.

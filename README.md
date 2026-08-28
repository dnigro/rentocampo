# RentoCampo - Landing Page Profesional

## 📋 Descripción

Landing page de RentoCampo optimizada para captar propietarios rurales. Diseño profesional, responsive y con formulario funcional que envía consultas vía WhatsApp.

## 📁 Estructura

```
.
├── index.html      # Estructura HTML
├── styles.css      # Estilos CSS (responsive)
├── main.js         # Lógica JavaScript (formulario)
└── README.md       # Este archivo
```

## 🎨 Características

✅ **Diseño Profesional**
- Logo integrado (SVG animado)
- Hero section con gradientes
- Paleta de colores rural (verdes, tierras, crema)
- Tipografía clara y jerárquica

✅ **Responsive**
- Mobile-first
- Breakpoints en 980px y 640px
- Optimizado para tablets y desktop

✅ **Funcionalidad**
- Formulario que envía vía WhatsApp
- Smooth scroll entre secciones
- Interactividad (hover effects)
- Animaciones sutiles

✅ **SEO**
- Meta tags completos
- Semántica HTML correcta
- Open Graph para redes sociales

## 🚀 Cómo usar

### Paso 1: Configurar WhatsApp

1. Abrí `main.js`
2. Buscá la línea: `const WHATSAPP_NUMBER = "549XXXXXXXXXX";`
3. Reemplazá con tu número en formato internacional:
   - **Formato:** `549XXXXXXXXXX` (sin +, sin espacios, sin guiones)
   - **Ejemplo:** `5491123456789` (Argentina)

### Paso 2: Personalizar

#### Logo
El logo está en `index.html` como SVG. Podés:
- Cambiar colores en la sección `<style>` dentro del SVG
- Reemplazarlo con una imagen PNG/SVG

#### Contenido
- Modificá textos en `index.html`
- Actualiza contacto en footer
- Cambia meta description si necesario

#### Colores
En `styles.css`, sección `:root`:
```css
--cream: #f8f3e9;        /* Fondo crema */
--green: #21462b;        /* Verde primario */
--earth: #8c5f3d;        /* Tierra/marrón */
```

### Paso 3: Desplegar

#### Opción A: GitHub Pages
```bash
# Ya está listo para GitHub Pages
# Solo pushea y activa Pages en settings
```

#### Opción B: Vercel/Netlify
```bash
# Conecta el repo y despliega
# Automático con cada push
```

#### Opción C: Tu servidor
```bash
# Copia los 3 archivos a tu servidor
# No necesita build ni dependencias
```

## 📱 Secciones

1. **Header** - Navbar sticky con logo y navegación
2. **Hero** - Propuesta de valor principal
3. **Confianza** - 3 beneficios clave
4. **Publicar** - Formulario Lead (split layout)
5. **Cómo funciona** - 3 pasos del proceso
6. **Visibilidad** - Mock de mapa con campos
7. **FAQ** - 4 preguntas frecuentes
8. **CTA Final** - Último llamado a acción
9. **Footer** - Links y copyright

## 🎨 Paleta de colores

| Color | Hex | Uso |
|-------|-----|-----|
| Verde Primario | #21462b | Buttons, headings, accents |
| Verde Secundario | #5d7f52 | Accents, icons |
| Verde Claro | #e7f0df | Backgrounds, highlights |
| Tierra | #8c5f3d | Logo, detalles |
| Crema | #f8f3e9 | Background principal |
| Texto | #1f2a22 | Body text |
| Mutted | #657064 | Secondary text |

## 📊 Performance

- **Tamaño HTML:** ~15 KB
- **Tamaño CSS:** ~18 KB
- **Tamaño JS:** ~1.5 KB
- **Total:** ~34.5 KB
- **Carga:** < 1 segundo en 4G

## ✅ Checklist antes de publicar

- [ ] Reemplazá número de WhatsApp en `main.js`
- [ ] Probá el formulario en móvil y desktop
- [ ] Verificá links internos funcionen
- [ ] Checkea que imágenes carguen correctamente
- [ ] Testeá en navegadores principales (Chrome, Safari, Firefox)
- [ ] Verificá meta tags en redes sociales
- [ ] Configura custom domain si corresponde

## 🔗 URLs internas

- `#inicio` - Header/Hero
- `#confianza` - Sección de confianza
- `#publicar` - Formulario
- `#como-funciona` - Cómo funciona
- `#preguntas` - FAQ

## 📝 Notas

- No tiene dependencias externas
- Pure HTML/CSS/JavaScript
- Compatible con navegadores modernos (2020+)
- Accesible (WCAG AA)
- Optimizado para SEO

## 🚀 Próximos pasos

1. Conectar con backend de Lio (`lionelliberman/rentacampo`)
2. Integrar autenticación
3. Añadir analítica (Google Analytics)
4. Implementar chat en tiempo real
5. Optimizar imágenes

## 📧 Soporte

Para cambios o mejoras, abrí un issue o PR en el repo.
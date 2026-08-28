# RentoCampo - Workflow & Estrategia de Desarrollo

## 📊 Arquitectura Recomendada

```
USUARIOS
   ↓
🌾 Landing (dnigro/rentocampo)
   ├── Información general
   ├── Propuesta de valor
   └── Lead form (WhatsApp)
        ↓
        ✅ Crear cuenta en app
        ↓
📱 Dashboard (lionelliberman/rentacampo)
   ├── Autenticación
   ├── Mi perfil
   ├── Mis campos (CRUD)
   ├── Mensajes
   ├── Favoritos
   └── Mapa interactivo
        ↓
☁️ Backend (Supabase + Mapbox)
   ├── PostgreSQL (base de datos)
   ├── Auth (usuarios)
   ├── Storage (fotos)
   └── Realtime (mensajes)
```

## 🏗️ Dos Repositorios, Un Objetivo

### Repositorio 1: Landing (tu repo)
**URL:** https://github.com/dnigro/rentocampo  
**Tipo:** Landing page estática  
**Stack:** HTML/CSS/JavaScript puro  
**Propósito:** Captar leads de propietarios  

```
dnigro/rentocampo/
├── index.html           (Landing pública)
├── styles.css
├── main.js              (Formulario WhatsApp)
├── README.md
└── WORKFLOW.md          (Este archivo)
```

**Flujo:**
1. Usuario llega a landing
2. Lee propuesta de valor
3. Completa formulario
4. Recibe WhatsApp de Dante
5. Dante lo registra en app

### Repositorio 2: App (repo de Lio)
**URL:** https://github.com/lionelliberman/rentacampo  
**Tipo:** Aplicación full-stack  
**Stack:** Next.js + Supabase + React  
**Propósito:** Dashboard privado + gestión de campos  

```
lionelliberman/rentacampo/
├── app/
│   ├── (auth)/          (Login/Register)
│   ├── (public)/        (Landing + Campos)
│   ├── (dashboard)/     (Privado)
│   └── api/             (API routes)
├── components/
├── lib/                 (Supabase, Mapbox)
├── styles/
└── package.json
```

**Flujo:**
1. Usuario login con email/contraseña
2. Accede al dashboard
3. Crea/edita campos
4. Recibe mensajes de productores
5. Gestiona su perfil

## 🔄 Workflows Recomendados

### Workflow 1: Lead → Cuenta (ACTUAL)
```
Usuario en Landing
    ↓
Completa Formulario
    ↓
Recibe WhatsApp (5491130524228)
    ↓
Dante lo registra manualmente en App
    ↓
Usuario recibe credenciales por email
    ↓
Accede al Dashboard
```

**Mejora futura:** Automatizar con API

### Workflow 2: Lead → Cuenta (AUTOMATIZADO)
```
Usuario en Landing
    ↓
Completa Formulario
    ↓
API crea usuario en Supabase
    ↓
Envía email con credenciales + link
    ↓
Usuario hace login
    ↓
Dashboard
```

**Requiere:** Backend API

### Workflow 3: WhatsApp → App
```
Usuario en WhatsApp
    ↓
Dante lo registra en App
    ↓
Comparte link: https://rentocampo.com/login
    ↓
Usuario hace login
    ↓
Publica campo
```

**Actual:** Manual pero efectivo

## 📝 Ejemplos de Trabajos

### Tarea A: Cambiar landing
```bash
git checkout main
# Edita index.html
# Edita styles.css
git add .
git commit -m "feat: nueva sección testimonios"
git push
```

### Tarea B: Agregar feature a app
```bash
# En repo de Lio
git checkout -b feature/nuevas-fotos
# Trabaja en componentes
git push
# Abre PR a main
```

### Tarea C: Agregar landing a app
```bash
# En repo de Lio
# Copiar index.html → app/(public)/page.tsx
# Adaptar a React/Next.js
git commit -m "feat: landing integrada"
```

## 🚀 Despliegues

### Landing (dnigro/rentocampo)
```
Opción A: GitHub Pages
  Settings → Pages → Rama: main
  URL: https://dnigro.github.io/rentocampo/

Opción B: Vercel
  vercel.com → Connect repo
  Auto-deploy en cada push

Opción C: Netlify
  netlify.com → Connect repo
  Auto-deploy + preview PRs
```

### App (lionelliberman/rentacampo)
```
Actual: Vercel (Next.js optimizado)
  vercel.com/new?utm_source=next
  Deploy automático en push

Alternativa: Heroku/Railway/Fly.io
  Para más control
```

## 🔐 Variables de Entorno

### Landing (no necesita)
- Landing es 100% frontend
- WhatsApp es solo link

### App (necesita)
```env
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
MAPBOX_TOKEN=xxx
RESEND_API_KEY=xxx
```

## 📊 Tracking & Analítica

### Landing
Agregar Google Analytics:
```html
<!-- En index.html antes de </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

Métricas a trackear:
- Visitas a landing
- Click en "Publicar mi campo"
- Submits del formulario
- Tasa de conversión

### App
Usar plataforma como Mixpanel/Amplitude
- Usuarios activos
- Campos creados
- Mensajes intercambiados
- Tasa de reactivación

## 🎯 Roadmap (Fases)

### Fase 1: LANDING + LEADS (ACTUAL ✅)
- [x] Landing profesional
- [x] Formulario con WhatsApp
- [x] Deploy en GitHub Pages/Vercel
- [ ] Google Analytics
- [ ] Google Search Console

### Fase 2: AUTOMATIZACIÓN
- [ ] API para crear usuarios
- [ ] Email automático con credenciales
- [ ] Integración Supabase
- [ ] Webhooks de WhatsApp

### Fase 3: LANDING + APP INTEGRADA
- [ ] Landing en Next.js
- [ ] Rutas `/` (landing) y `/app` (dashboard)
- [ ] SSO (single sign on)
- [ ] Deploy único en Vercel

### Fase 4: MONETIZACIÓN
- [ ] Planes premium
- [ ] Comisión por alquiler
- [ ] Publicidades de insumos

### Fase 5: EXPANSIÓN
- [ ] Versión móvil (React Native)
- [ ] API pública para partners
- [ ] Integraciones (Rava, Agrofy, etc.)

## 📚 Documentación

- **Landing README:** Ver `README.md` en main
- **App Docs:** Ver repo de Lio (`CLAUDE.md`, `AGENTS.md`)
- **Workflow:** Este archivo (`WORKFLOW.md`)
- **Backup Info:** `BACKUP_LIO.md`

## 🤝 Colaboración

### Si trabajan 2+ personas:

```bash
# Rama de landing
git checkout -b feature/mejoras-landing
git push

# Rama de app (en repo de Lio)
git checkout -b feature/nuevo-dashboard
git push

# Sincronizar cambios
# (sin conflictos porque están en repos diferentes)
```

### Si trabaja 1 persona:

```bash
# Landing
git checkout main
# Cambios en landing
git push

# App (en repo de Lio)
git pull origin main
# Cambios en app
git push
```

## ⚠️ Puntos Importantes

1. **No mezclar landing con app en mismo repo**
   - Landing es para leads
   - App es para usuarios registrados
   - Mejor separados

2. **Landing debe ser rápida**
   - <1 segundo de carga
   - Sin dependencias pesadas
   - Pure HTML/CSS/JS

3. **App puede ser más compleja**
   - Next.js + React
   - Supabase en backend
   - Mapbox para geolocalización

4. **Mantener sincronización**
   - Landing redirige a app
   - Mismo dominio ideal: rentocampo.com
   - DNS apunta a ambos

5. **Backup disponible**
   - Rama `backup-lio` contiene app original
   - Fácil revertir si necesario

## 🚀 Comando Rápido

```bash
# Clonar landing
git clone https://github.com/dnigro/rentocampo.git
cd rentocampo

# Ver ramas disponibles
git branch -a

# Cambios en landing
git checkout main
# Edita index.html
git add .
git commit -m "tu mensaje"
git push

# Ver backup de app
git checkout backup-lio
# Ver documentación
cat BACKUP_LIO.md
```

## 📞 Contacto

- GitHub: @dnigro
- Email: dantenigro@gmail.com  
- WhatsApp: 5491130524228

---

**Última actualización:** 2026-08-28  
**Estado:** ✅ Landing en Producción, App en Repo de Lio

¿Preguntas? Abrí un issue en el repo.

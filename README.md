This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Variables de entorno

Copiá `.env.example` como `.env.local` para desarrollo. En Vercel configurá
las variables públicas de Supabase tanto para **Preview** como para
**Production**: se necesitan durante el build para prerenderizar las rutas de
autenticación.

| Variable | Alcance | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Preview + Production | URL pública de Supabase; requerida |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Preview + Production | Clave pública; requerida |
| `NEXT_PUBLIC_APP_URL` | Preview + Production | Origen usado en notificaciones por email |
| `SUPABASE_SERVICE_ROLE_KEY` | Servidor | APIs administrativas y sitemap dinámico |
| `RESEND_API_KEY` | Servidor | Emails de notificación |
| `RESEND_FROM_EMAIL` | Servidor | Remitente verificado; opcional |
| `RESEND_REGISTRATION_SECRET` | Servidor | Protege el endpoint de reenvío de registro |

Nunca expongas `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` ni
`RESEND_REGISTRATION_SECRET` con el prefijo `NEXT_PUBLIC_`. Usá credenciales
separadas para Preview si no querés que las pruebas escriban sobre producción.
Antes de publicar cambios de datos, ejecutá las migraciones de
`supabase/migrations` en Supabase.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Cada pull request ejecuta `npm ci`, ESLint y un build de producción mediante
GitHub Actions. La integración Git de Vercel genera el Preview después del push
de la rama.

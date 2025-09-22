# VotaVideo

Aplicación creada con [Next.js](https://nextjs.org) para gestionar propuestas de vídeos, votar por ellas y publicar los vídeos finalizados.

## Requisitos previos

- Node.js 18 o superior
- npm (o pnpm/yarn/bun)

## Puesta en marcha

Instala las dependencias y arranca el servidor de desarrollo:

```bash
npm install
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Infraestructura durante el desarrollo

- **Base de datos:** [Neon](https://neon.tech/) aloja la instancia de PostgreSQL utilizada en desarrollo.
- **Almacenamiento de imágenes:** las miniaturas se suben a [Imgur](https://imgur.com/), y las URLs resultantes se usan en la aplicación.

## Despliegue

El proyecto se despliega en [Vercel](https://vercel.com/). Durante las primeras pruebas de build se registraron los siguientes errores relacionados con ESLint y el uso del componente `<img />`:

```
23:14:49.445 ./src/app/VideoProposalList.tsx
77:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
100:13 Warning: Using `<img>` could result in slower LCP ...  @next/next/no-img-element

23:14:49.446 ./src/app/admin/CreateProposalForm.tsx
36:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
```

Quedan anotados como referencia por si vuelven a aparecer en futuros despliegues.

## Recursos adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de NextAuth.js](https://next-auth.js.org/getting-started/introduction)

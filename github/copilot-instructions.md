
## Contexto general
Este es un proyecto profesional de **eCommerce** llamado **Refrielectricos**, estructurado como un **monorepo** con:
- **Frontend:** Next.js (App Router, TypeScript, TailwindCSS)
- **Backend:** NestJS (TypeScript, modular)
- **Base de datos:** PostgreSQL en Neon.tech
- **ORM:** Prisma
- **Despliegue:** Vercel (frontend) + Render/Railway (backend)

El objetivo es construir una tienda online moderna, escalable y mantenible, desarrollada con buenas prácticas de arquitectura limpia.

---

## Estado actual del proyecto

### Backend (NestJS) - ✅ Configurado
- **Base de datos:** Conectada a Neon (PostgreSQL) mediante Prisma ORM
- **Modelos Prisma implementados:**
  - `User` (id, email, name, password, role: USER/ADMIN, orders, timestamps)
  - `Product` (id, name, description, price, stock, orderItems, timestamps)
  - `Order` (id, user, items, total, status: PENDING/PAID/SHIPPED/CANCELLED, timestamps)
  - `OrderItem` (id, order, product, quantity, price)
- **Servicios configurados:**
  - `PrismaService` (gestión de conexión DB con lifecycle hooks)
  - `PrismaModule` (módulo global para inyección en toda la app)
  - `ProductsModule`, `UsersModule`, `OrdersModule` (módulos con DTOs, validación y endpoints CRUD)
  - `OrdersService` crea órdenes en transacciones (`prisma.$transaction`) y guarda `OrderItem` con el precio en el momento de la compra
- **Endpoints básicos funcionando:**
  - `GET /` → mensaje de bienvenida
  - `GET /health` → health check
  - `GET /users` → lista de usuarios desde DB
- **Seed script:** `pnpm run seed` crea datos de ejemplo (usuario admin, 2 productos, 1 orden)
- **Configuración:**
  - TypeScript en modo CommonJS (compatible con Nest)
  - Variables de entorno cargadas con `dotenv`
  - Cliente Prisma generado en `backend/generated/prisma/`
  - Puerto por defecto: 3000

### Frontend (Next.js) - ⏳ Pendiente
- Estructura base creada, aún no configurado

### Próximos pasos sugeridos
2. **Backend:**
   - Crear módulos separados: `UsersModule`, `ProductsModule`, `OrdersModule`
   - Implementar autenticación JWT con guards y bcrypt
   - Añadir DTOs y validación con `class-validator`
   - Crear endpoints CRUD completos para productos y órdenes
  - Notas recientes: se modularizó el backend (`ProductsModule`, `UsersModule`, `OrdersModule`) y se refactorizó `OrdersService.create` para usar consultas por lote y transacciones.
  - Se añadió una solución temporal para warnings del analizador de tipos de Prisma: se permite la importación del cliente generado y se ajustó `tsconfig.json` (`typeRoots`) para exponer los tipos generados; además se añadieron suppression comments en `orders.service.ts` para evitar errores del linter mientras se consolida la tipificación del cliente.
2. **Frontend:**
   - Configurar conexión con API backend
   - Implementar páginas: home, catálogo, detalle producto, carrito, checkout
   - Crear componentes reutilizables (ProductCard, Navbar, etc.)
3. **Infraestructura:**
   - Configurar CI/CD con GitHub Actions
   - Preparar deployment en Vercel (frontend) y Render/Railway (backend)

---

## Estructura del repositorio
Backend - NestJS
backend/
├── dist/                # Código JavaScript compilado (no versionar)
├── generated/           # Archivos generados (e.g., por Prisma Client)
├── node_modules/        # Dependencias del backend
├── prisma/              # Definición del esquema DB (`schema.prisma`) y migraciones
├── src/                 # Código fuente principal: Controladores, Servicios, Módulos (auth, products, orders, etc.)
├── test/                # Pruebas unitarias y de integración (Jest, Supertest)
├── .env                 # Variables de entorno locales (no subir a Git)
├── .eslintrc.mjs
├── .prettierrc
├── nest-cli.json
├── package.json         # Scripts de NestJS y dependencias
├── pnpm-lock.yaml       # Archivo de bloqueo de dependencias
├── README.md            # Documentación específica del Backend
└── tsconfig.json        # Configuración de TypeScript

frontend/refrielectricos/
├── .next/               # Cache de Next.js (no versionar)
├── app/                 # Rutas, layouts y páginas (App Router)
├── components/          # Componentes React reutilizables (UI)
├── lib/                 # Lógica auxiliar: data fetching (`api.ts`), utilidades
├── node_modules/        # Dependencias del frontend
[cite_start]├── public/              # Assets estáticos (imágenes, favicons) [cite: 160]
├── src/                 # (Opcional) Código fuente adicional, e.g. hooks personalizados
├── bun.lock             # Archivo de bloqueo de dependencias (si se usa Bun)
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts       # Configuración de Next.js (incluye manejo de imágenes y CDN)
├── package.json         # Scripts de Next.js y dependencias
├── postcss.config.mjs   # Configuración de PostCSS (para TailwindCSS)
├── README.md            # Documentación específica del Frontend
└── tsconfig.json

./
[cite_start]├── .github/             # GitHub Actions para CI/CD (lint, build, tests, deploy) [cite: 134, 329]
│   └── copilot-instructions.md # (Documento de contexto para la IA)
[cite_start]├── infra/               # Scripts y configuraciones para despliegue en Render/Railway/Neon [cite: 69, 71]
├── .gitignore           # Archivos ignorados por Git
└── README.md            # Documentación principal y comandos de desarrollo
---

## Objetivo de desarrollo
Copilot debe ayudar a:
1. Generar componentes **React/Next.js** accesibles, tipados y reutilizables.  
2. Sugerir controladores y servicios **NestJS** siguiendo buenas prácticas (Inyección de dependencias, módulos, DTOs).  
3. Proponer consultas Prisma seguras y eficientes (sin SQL raw).  
4. Promover un código **limpio, modular y documentado**.  
5. Respetar las convenciones de TypeScript, ESLint y Prettier.

---

## Reglas y convenciones
- Usar **TypeScript** en todo el proyecto.  
- Actualizar el `copilot-instructions.md` con cada cambio 
relevante.
- Usar **ESLint** y **Prettier** para mantener estilo consistente.
- Evitar lógica de negocio en controladores; delegarla a servicios.  
- Usar **DTOs** y **class-validator** en NestJS.  
- En Next.js, separar lógica de UI y data fetching (`/lib/api.ts`).  
- Implementar autenticación JWT manualmente (sin NextAuth).  
- Mantener los nombres en inglés para código y en español solo para textos de UI.  
- No generar código con `any` ni lógica duplicada.  
- Priorizar composición de componentes antes que herencia.  
- Usar `async/await` y manejo de errores estructurado (`try/catch` + logs).

---

## Autenticación y seguridad
- Autenticación con JWT y roles: `admin`, `vendor`, `client`.  
- Las contraseñas se almacenan con `bcrypt`.  
- Sanitizar entrada de datos (`class-validator` en NestJS, `zod` o `yup` en frontend).  
- Proteger contra XSS, CSRF y SQL Injection.  
- Variables de entorno seguras (`.env`, no subirlas al repo).

---

## Buenas prácticas para Copilot
- Mantener consistencia entre entidades Prisma y DTOs.  
- En React, preferir componentes funcionales con hooks (`useEffect`, `useState`, `useReducer`).  
- Para datos del backend, usar `fetch` o `axios` con endpoints REST.  
- Documentar funciones clave con JSDoc.  
- Evitar sugerir dependencias no justificadas o sin tipado.

---

## Misión final
Crear una plataforma eCommerce moderna, con:
- Flujo completo de usuario: catálogo → carrito → checkout → pago.  
- Panel de administración (dashboard) para gestionar productos, usuarios y pedidos.  
- Arquitectura sólida y extensible, con monitoreo, logs y CI/CD.  
- Código claro y mantenible que sirva como referencia profesional.

---

**Autor:** Juan Camacho  
**Proyecto:** Refrielectricos G&E S.A.S  
**Stack:** Next.js + NestJS + Prisma + Neon  
**Objetivo:** Aprender a construir y dominar todo el stack fullstack de un eCommerce.

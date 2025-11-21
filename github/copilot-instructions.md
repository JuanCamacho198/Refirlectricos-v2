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
  - `Product` (id, name, description, price, stock, image_url, category, brand, sku, tags, isActive, orderItems, timestamps)
  - `Order` (id, user, items, total, status: PENDING/PAID/SHIPPED/CANCELLED, timestamps)
  - `OrderItem` (id, order, product, quantity, price)
- **Servicios configurados:**
  - `PrismaService` (gestión de conexión DB con lifecycle hooks)
  - `PrismaModule` (módulo global para inyección en toda la app)
  - `ProductsModule`, `UsersModule`, `OrdersModule` (módulos con DTOs, validación y endpoints CRUD)
  - `AuthModule` (JWT, bcrypt, Passport, Guards)
  - `OrdersService` crea órdenes en transacciones (`prisma.$transaction`) y guarda `OrderItem` con el precio en el momento de la compra
- **Endpoints básicos funcionando:**
  - `GET /` → mensaje de bienvenida
  - `GET /health` → health check
  - `GET /users` → lista de usuarios desde DB
  - `POST /auth/login`, `POST /auth/register` → autenticación
  - `GET /products`, `GET /products/:id` → catálogo y detalle
  - `POST /orders` → creación de órdenes (protegido)
- **Seed script:** `pnpm run seed` crea datos de ejemplo (usuario admin, 2 productos, 1 orden)
- **Configuración:**
  - TypeScript en modo CommonJS (compatible con Nest)
  - Variables de entorno cargadas con `dotenv`
  - Cliente Prisma generado en `backend/generated/prisma/`
  - Puerto: 4000 (CORS habilitado)
  - Autenticación JWT implementada y rutas protegidas con `JwtAuthGuard`

### Frontend (Next.js) - 🚧 En desarrollo (Avanzado)
- **Stack:** Next.js 16 (App Router), TailwindCSS 4.
- **Utilidades:** 
  - `axios` (Cliente HTTP con interceptores para JWT).
  - `clsx` + `tailwind-merge` (Manejo dinámico de clases).
  - `lucide-react` (Iconografía).
- **Estado:**
  - **Contextos:** `AuthContext` (Login/Register/Logout), `CartContext` (Carrito persistente), `WishlistContext` (Favoritos) y `ToastContext` (Notificaciones) implementados.
  - **Componentes UI:** `Button`, `Input`, `Card`, `Modal`, `Navbar` (con búsqueda y menú de usuario), `Footer` (moderno y responsivo).
  - **Páginas Implementadas:**
    - `page.tsx`: Home con listado de productos.
    - `(auth)/login` & `(auth)/register`: Flujo completo de autenticación.
    - `(shop)/products`: Catálogo con filtros avanzados (Categoría, Marca, Precio, Búsqueda) y debounce.
    - `(shop)/products/[id]`: Detalle de producto con galería y zoom.
    - `(shop)/cart`: Vista de carrito con gestión de cantidades.
    - `(shop)/checkout`: Formulario de envío y creación de orden.
    - `(shop)/checkout/success`: Confirmación de compra.
    - `(shop)/profile/wishlists`: Gestión de listas de deseos.
    - `admin/users`: Gestión de usuarios y roles.
    - `admin/settings`: Configuración de la tienda (UI).
    - `admin/products`: Gestión completa de productos (CRUD con nuevos campos: Categoría, Marca, SKU, Tags).

### Próximos pasos sugeridos
2. **Backend:**
   - (Completado) Crear módulos separados: `UsersModule`, `ProductsModule`, `OrdersModule`
   - (Completado) Implementar autenticación JWT con guards y bcrypt
   - (Completado) Añadir DTOs y validación con `class-validator`
   - (Completado) Crear endpoints CRUD completos para productos y órdenes
   - (Completado) Implementar módulo de `Wishlists` (Favoritos).
   - (Completado) Actualizar modelo `Product` con campos para filtros avanzados (`category`, `brand`, `sku`, `tags`).
   - Notas recientes: se implementó autenticación completa (JWT, bcrypt, Guards) y se protegieron las rutas sensibles. Se corrigieron problemas de tipos en `tsconfig.json`.

3. **Frontend:**
   - (Completado) Configurar conexión con API backend (Axios/Fetch)
   - (Completado) **Fase 1 (UI Base):** Refactorizar `ProductCard`, crear componentes UI (`Button`, `Input`, `Modal`).
   - (Completado) **Fase 2 (Estado):** Implementar `CartContext` para manejo global del carrito y persistencia.
   - (Completado) **Fase 3 (Páginas):** Detalle de producto (`/products/[id]`), Login/Register (`/auth/*`).
   - (Completado) **Fase 4 (Checkout):** Página de resumen de carrito y envío de orden a la API protegida.
   - (Completado) **Fase 5 (Usuario):** Perfil de usuario, historial de órdenes y Wishlist (Favoritos).
   - (Completado) **Fase 6 (Admin):** Panel de administración para productos y órdenes.
     - Dashboard con estadísticas.
     - Gestión de Productos (CRUD completo con imágenes y nuevos campos).
     - Gestión de Pedidos (Listado y cambio de estado).
     - Gestión de Usuarios (Roles y eliminación).
     - Protección de rutas con RolesGuard (Backend) y AdminLayout (Frontend).
   - (Completado) **Mejoras de UX:**
     - Navbar con búsqueda integrada y menú de usuario mejorado.
     - Footer moderno.
     - Filtros de productos avanzados con debounce.
     - Modal de confirmación para acciones críticas (guardar/editar productos).
   - (Completado) **Correcciones y Estabilidad:**
     - Solucionado error de migraciones Prisma (`PrismaClientKnownRequestError`).
     - Implementado manejo de errores robusto en Backend (Logs, Try-Catch).
     - Corregidos tipos en Frontend (Interfaces estrictas, eliminación de `any`).
     - Configuración de `ValidationPipe` con conversión implícita.
     - Implementado sistema de notificaciones (`ToastContext`).

4. **Infraestructura:**
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
├── public/  
│   ├── branding/        # Logos y favicons
│   ├── icons/           # Iconos SVG personalizados
│   └── images/             # Assets estáticos (imágenes, favicons)
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
- **Usar pnpm** como gestor de paquetes.
- **cumplir con ESLint y Prettier** en cada archivo generado.
- **Gestor de Paquetes:** Usar estrictamente **pnpm** para instalar dependencias y ejecutar scripts.
- Usar **TypeScript** en todo el proyecto.  
- Actualizar el `copilot-instructions.md` con cada cambio 
relevante.
- **Validación Formularios:** React Hook Form + Zod 
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

### General
- **DRY (Don't Repeat Yourself):** Extraer lógica reutilizable a hooks o utilidades.
- **KISS (Keep It Simple, Stupid):** Preferir soluciones simples y legibles.
- **Tipado Estricto:** No usar `any`. Definir interfaces/types para props, estados y respuestas de API.

### Next.js (Frontend)
- **Server Components:** Usar Server Components por defecto. Usar `'use client'` solo cuando sea necesario (hooks, interactividad).
- **Optimización de Imágenes:** Usar siempre `next/image` con dimensiones o `fill`.
- **Estructura de Carpetas:** Seguir la estructura de `app/` router. Colocar componentes específicos de una página dentro de su carpeta si no se reutilizan.
- **Data Fetching:** Usar `fetch` con cache/revalidate en Server Components. Usar SWR o TanStack Query en Client Components si es complejo.
- **Manejo de Errores:** Usar `error.tsx` y `not-found.tsx` para manejo de errores declarativo.

### NestJS (Backend)
- **Arquitectura Modular:** Mantener la separación clara: Controller (Rutas) -> Service (Lógica) -> Repository/Prisma (Datos).
- **DTOs y Validación:** Usar `class-validator` y `class-transformer` en todos los DTOs de entrada.
- **Inyección de Dependencias:** Usar siempre la inyección de dependencias del constructor.
- **Manejo de Excepciones:** Usar `HttpException` y filtros de excepción personalizados. No devolver 500 genéricos si se conoce el error.
- **Configuración:** Usar `ConfigService` para variables de entorno, nunca `process.env` directo en el código.

### HTML & Accesibilidad
- **Semántica:** Usar etiquetas semánticas (`<main>`, `<section>`, `<article>`, `<nav>`, `<header>`, `<footer>`) en lugar de `<div>` genéricos.
- **Accesibilidad (a11y):**
  - `alt` descriptivo en todas las imágenes.
  - `aria-label` en botones sin texto visible (solo iconos).
  - Estructura correcta de encabezados (`h1` -> `h2` -> `h3`).
  - Formularios con `label` asociado a cada `input`.

### Tailwind CSS 4 & UI
- **Mobile First:** Escribir clases base para móvil y usar prefijos (`sm:`, `md:`, `lg:`) para pantallas más grandes.
- **Clases Utilitarias:** Evitar `@apply` en CSS siempre que sea posible; usar clases directamente en el JSX.
- **Consistencia:** Usar las variables de color definidas (`bg-blue-600`, `text-gray-900`) y no valores arbitrarios (`bg-[#123456]`) salvo excepciones justificadas.
- **Modo Oscuro:** Usar siempre el prefijo `dark:` para definir estilos en modo oscuro.
- **Componentes UI:** Usar `clsx` y `tailwind-merge` (o la utilidad `cn`) para combinar clases condicionales.
- **Configuración:** Usar variables CSS nativas en `globals.css` para la configuración del tema (Tailwind v4).
---

## Variables de Entorno (Referencia para generación de código)
Copilot debe asumir que estas variables existen:

**Frontend (.env.local):**
- `NEXT_PUBLIC_API_URL`: URL base del backend (ej. http://localhost:4000).

**Backend (.env):**
- `DATABASE_URL`: Conexión a Neon PostgreSQL.
- `JWT_SECRET`: Clave para firmar tokens.
- `PORT`: Puerto del servidor (default 4000).

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

# Arquitectura y Diseño Frontend - Refrielectricos

Este documento define los estándares de diseño, estructura de carpetas, paleta de colores y hooks globales para el desarrollo del frontend en Next js.

---

## 1. Identidad Visual (UI/UX)

### Paleta de Colores
Basada en el rubro de "Refrigeración y Electricidad", buscamos transmitir confianza, limpieza y energía.

| Nombre | Variable Tailwind | Código Hex | Uso |
| :--- | :--- | :--- | :--- |
| **Primary Blue** | `bg-blue-600` | `#2563EB` | Botones principales, Navbar, Enlaces activos. |
| **Deep Blue** | `bg-blue-900` | `#1E3A8A` | Footer, Encabezados oscuros. |
| **Electric Cyan** | `text-cyan-500` | `#06B6D4` | Detalles, Iconos, Hovers sutiles. |
| **Alert Orange** | `bg-orange-500` | `#F97316` | Ofertas, Badges de stock bajo, Call to Action secundario. |
| **Success Green** | `text-green-600` | `#16A34A` | Mensajes de éxito, Stock disponible. |
| **Error Red** | `text-red-600` | `#DC2626` | Errores de formulario, Sin stock. |
| **Background** | `bg-gray-50` | `#F9FAFB` | Fondo general de la aplicación. |
| **Surface** | `bg-white` | `#FFFFFF` | Tarjetas, Modales, Navbar. |

### Modo Oscuro (Dark Mode)
Implementado con `next-themes` y clases `dark:` de Tailwind.
- **Background:** `#0a0a0a` (`dark:bg-gray-900`)
- **Surface:** `#1f2937` (`dark:bg-gray-800`)
- **Text Primary:** `#ffffff` (`dark:text-white`)
- **Text Secondary:** `#9ca3af` (`dark:text-gray-400`)
- **Borders:** `#374151` (`dark:border-gray-700`)

### Tipografía
- **Fuente Principal:** `Geist Sans` (Default Next.js) o `Inter`.
- **Pesos:**
  - Regular (400): Texto cuerpo.
  - Medium (500): Botones, Enlaces.
  - Bold (700): Títulos.

### Reglas de Diseño
- **Modo Oscuro:** Todas las nuevas páginas y componentes deben soportar modo oscuro (`dark:` classes) desde el inicio.
- **Glassmorphism:** Usar `bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl` para elementos flotantes o sticky.
- **Transiciones:** Usar `transition-colors duration-300` para cambios de tema suaves.

---

## 2. Estructura de Carpetas (App Router)

Seguiremos una estructura modular y atómica para facilitar la escalabilidad.

```
frontend/refrielectricos/
├── app/
│   ├── (auth)/              # Grupo de rutas de autenticación (sin layout global si se requiere)
│   │   ├── login/
│   │   └── register/
│   ├── (shop)/              # Grupo de rutas de tienda
│   │   ├── products/
│   │   │   └── [id]/        # Detalle de producto
│   │   ├── cart/            # Carrito de compras
│   │   └── checkout/        # Proceso de pago
│   ├── admin/               # Panel de administración (protegido por rol)
│   ├── layout.tsx           # Layout raíz (Providers, Navbar, Footer)
│   └── page.tsx             # Home Page
├── components/
│   ├── ui/                  # Componentes base (átomos) sin lógica de negocio
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Badge.tsx
│   ├── layout/              # Componentes estructurales
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── features/            # Componentes con lógica de negocio específica
│       ├── products/
│       │   ├── ProductCard.tsx
│       │   └── ProductGrid.tsx
│       ├── cart/
│       │   ├── CartItem.tsx
│       │   └── CartSummary.tsx
│       └── auth/
│           └── LoginForm.tsx
├── lib/
│   ├── api.ts               # Instancia de Axios configurada
│   ├── utils.ts             # Utilidades (cn para tailwind-merge, formatCurrency)
│   └── constants.ts         # Constantes globales (URLs, Configs)
├── hooks/                   # Custom Hooks reutilizables
│   ├── useAuth.ts           # Manejo de sesión y usuario
│   ├── useCart.ts           # Lógica del carrito (añadir, quitar, total)
│   └── useToast.ts          # Notificaciones emergentes
├── context/                 # React Contexts
│   ├── AuthContext.tsx      # Estado global de autenticación
│   ├── CartContext.tsx      # Estado global del carrito
│   ├── WishlistContext.tsx  # Estado global de favoritos
│   └── ToastContext.tsx     # Sistema de notificaciones
└── types/                   # Definiciones de TypeScript compartidas
    ├── product.ts
    ├── user.ts
    └── api.ts
```

---

## 3. Requisitos Funcionales Frontend

### Core (Tienda)
1.  **Catálogo:** Listado de productos con filtros básicos (categoría, precio).
2.  **Búsqueda:** Barra de búsqueda en Navbar.
3.  **Detalle:** Vista individual con imágenes, descripción, precio y stock.
4.  **Carrito:**
    - Persistencia en `localStorage`.
    - Modificar cantidades.
    - Resumen de costos.

### Autenticación
1.  **Login/Registro:** Formularios con validación.
2.  **Protección de Rutas:** Middleware o HOC para redirigir si no hay sesión.
3.  **Persistencia:** Token JWT en `localStorage` o Cookies.

### Checkout
1.  **Resumen:** Vista final antes de pagar.
2.  **Envío de Orden:** Conexión con endpoint `POST /orders`.
3.  **Feedback:** Pantalla de éxito o error tras la compra.

---

## 4. Hooks Globales Planeados

### `useAuth`
Abstrae la lógica de autenticación.
- `user`: Datos del usuario actual o null.
- `login(credentials)`: Llama a API y guarda token.
- `logout()`: Limpia token y estado.
- `register(data)`: Crea cuenta.

### `useCart`
Maneja el estado del carrito de compras.
- `items`: Array de productos en carrito.
- `addItem(product, quantity)`: Añade o actualiza cantidad.
- `removeItem(productId)`: Elimina item.
- `clearCart()`: Vacía el carrito.
- `total`: Precio total calculado.

### `useWishlist`
Maneja el estado de la lista de deseos.
- `wishlists`: Listas del usuario.
- `addToWishlist(productId)`: Agrega a favoritos.
- `removeFromWishlist(productId)`: Elimina de favoritos.
- `isInWishlist(productId)`: Verifica si está en favoritos.

### `useToast`
Maneja las notificaciones emergentes.
- `addToast(message, type)`: Muestra un mensaje (success, error, info, warning).
- `removeToast(id)`: Elimina un mensaje manualmente.

### `useFetch` (Opcional o usar SWR/TanStack Query)
Para peticiones de datos.
- `data`, `loading`, `error`.
- Revalidación automática.

---

## 5. Stack Tecnológico Confirmado
- **Framework:** Next.js 16 (App Router).
- **Estilos:** TailwindCSS 4 + `clsx` + `tailwind-merge`.
- **Iconos:** Lucide React.
- **HTTP:** Axios.
- **Estado:** React Context + Hooks.



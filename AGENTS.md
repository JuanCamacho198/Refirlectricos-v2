# AGENTS.md - Refrielectricos E-Commerce Development Guidelines

## Project Overview

Refrielectricos is a full-stack e-commerce platform for refrigeration equipment and supplies. Built with NestJS (backend) and Next.js 14 (frontend), featuring a monorepo structure managed with pnpm workspaces.

**Tech Stack:**
- **Backend**: NestJS, Prisma ORM, PostgreSQL, JWT Authentication
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Zustand
- **Database**: PostgreSQL on Railway
- **Cloud**: Cloudinary (image hosting)
- **Payments**: Wompi integration

---

## Build/Lint/Test Commands

### Backend (NestJS)
```bash
# Development
pnpm -C backend run start:dev    # Start with hot reload
pnpm -C backend run build        # Build for production
pnpm -C backend run start        # Start production server

# Testing
pnpm -C backend run test         # Run all unit tests
pnpm -C backend run test:watch   # Run tests in watch mode
pnpm -C backend run test:cov     # Run tests with coverage
pnpm -C backend run test:e2e     # Run end-to-end tests

# Run single test file
cd backend && npx jest src/path/to/file.spec.ts

# Run single test by pattern
cd backend && npx jest -t "test name pattern"

# Quality
pnpm -C backend run lint         # Lint and auto-fix
pnpm -C backend run format       # Format with Prettier
```

### Frontend (Next.js)
```bash
# Development
pnpm -C frontend/refrielectricos run dev      # Start dev server
pnpm -C frontend/refrielectricos run build    # Build for production
pnpm -C frontend/refrielectricos run start    # Start production server

# Testing
pnpm -C frontend/refrielectricos run test         # Run unit tests
pnpm -C frontend/refrielectricos run test:watch   # Run tests in watch mode
pnpm -C frontend/refrielectricos run test:e2e     # Run E2E tests (Playwright)
pnpm -C frontend/refrielectricos run test:e2e:ui  # Run E2E tests with UI

# Run single test file
cd frontend/refrielectricos && npx jest __tests__/component.test.tsx

# Run single test by pattern
cd frontend/refrielectricos && npx jest -t "component name"
```

### Monorepo Commands
```bash
# Install all dependencies
pnpm install

# Lint entire project
pnpm run lint

# Format entire project
pnpm run format
```

---

## Documentation Guidelines

### File Location
- **Always** place new documentation files in the `.docs/` directory at the root of the project.
- Use kebab-case for filenames (e.g., `.docs/rate-limiting.md`).
- Update the main `README.md` or this `AGENTS.md` if the new documentation is critical.

### Documentation Types
- **README**: Project overview, setup, and quick start.
- **API Docs**: Detailed endpoint documentation (prefer Swagger/OpenAPI).
- **Architecture**: System design and data flow.
- **Guides**: Step-by-step instructions for specific features (e.g., Rate Limiting).

### Best Practices
- **Audience-focused**: Write for developers and maintainers.
- **Example-driven**: Include code snippets and configuration examples.
- **Maintainable**: Keep documentation close to the implementation.
- **Clear & Concise**: Use structured headings and simple language.

---

## Project Structure

### Backend Structure
```
backend/src/
├── modules/           # Feature-based modules
│   ├── auth/          # Authentication & authorization
│   ├── users/         # User management
│   ├── products/      # Product catalog & variants
│   ├── cart/          # Shopping cart
│   ├── orders/        # Order processing
│   ├── payments/      # Payment integration (Wompi)
│   ├── addresses/     # User addresses
│   ├── wishlists/     # Wishlist functionality
│   ├── reviews/       # Product reviews
│   ├── questions/     # Product Q&A
│   ├── notifications/ # In-app notifications
│   ├── dashboard/     # Admin dashboard stats
│   ├── files/         # File uploads (Cloudinary)
│   └── settings/      # Site settings
├── common/            # Shared utilities, guards, pipes
├── config/            # Configuration files
└── main.ts           # Application entry point
```

### Frontend Structure
```
frontend/refrielectricos/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes (login, register)
│   ├── (shop)/              # Shopping routes
│   ├── admin/               # Admin dashboard
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # Base UI components
│   ├── layout/              # Layout components
│   ├── features/            # Feature-specific components
│   └── admin/               # Admin-specific components
├── lib/                     # Utilities, API clients, formatters
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript type definitions
├── context/                 # React context providers
├── store/                   # Zustand stores
├── schemas/                 # Zod validation schemas
└── data/                    # Static data (e.g., Colombia regions)
```

---

## Code Style Guidelines

### TypeScript & Typing
- **Strict typing required**: No implicit `any`, avoid `any` unless absolutely necessary with comments
- **Interface definitions**: Define interfaces for API responses, component props, and complex objects
- **Type imports**: Use `import type` for type-only imports to reduce bundle size
- **Generic types**: Use generics for reusable components and utilities

### Imports Order
```typescript
// 1. React/Next.js imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. External libraries (alphabetical)
import axios from 'axios'
import { format } from 'date-fns'

// 3. Internal imports (relative paths, grouped by type)
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import type { Product } from '@/types/product'
```

### Naming Conventions
| Type | Convention | Examples |
|------|------------|----------|
| Components | PascalCase | `ProductCard`, `UserProfile` |
| Component files | kebab-case | `product-card.tsx`, `user-avatar.tsx` |
| Utility files | camelCase | `formatCurrency.ts`, `apiClient.ts` |
| Hooks | camelCase with `use` | `useAuth`, `useCart` |
| Types/Interfaces | PascalCase | `User`, `ApiResponse`, `ProductFilters` |
| Constants | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `MAX_UPLOAD_SIZE` |
| Functions | camelCase | `getUserData`, `formatPrice`, `isValidEmail` |
| Database fields | snake_case | `created_at`, `user_id` |

---

## Component Patterns

### Server Component (Default)
```typescript
export default function ProductPage({ params }: { params: { id: string } }) {
  return <div>Product content</div>
}
```

### Client Component (Interactive)
```typescript
'use client'

interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-md transition-colors',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700'
      )}
    >
      {children}
    </button>
  )
}
```

### Component Props Pattern
```typescript
interface CardProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4',
        className
      )}
    >
      {children}
    </div>
  )
}
```

---

## Styling (Tailwind CSS)

### Guidelines
- **Mobile-first**: Start with mobile styles, add responsive prefixes (`sm:`, `md:`, `lg:`)
- **Dark mode**: Always include `dark:` variants for new components
- **Utility classes**: Prefer Tailwind utilities over custom CSS
- **Dynamic classes**: Use `clsx` or `cn` utility for conditional classes

### Example
```typescript
import { cn } from '@/lib/utils'

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4',
      className
    )}>
      {children}
    </div>
  )
}
```

---

## API Integration

### Frontend API Calls
```typescript
export async function getProducts(params?: ProductFilters) {
  const response = await api.get<Product[]>('/products', { params })
  return response.data
}

export async function createOrder(data: CreateOrderDTO) {
  const response = await api.post<Order>('/orders', data)
  return response.data
}
```

### Backend API Responses
```typescript
@Post('products')
async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
  return this.productsService.create(createProductDto)
}

@Get('products/:id')
async findOne(@Param('id') id: string): Promise<Product> {
  const product = await this.productsService.findById(id)
  if (!product) {
    throw new NotFoundException(`Product with ID ${id} not found`)
  }
  return product
}
```

### API Response Format
- **Success**: Return directly the data or `{ data: ... }` for arrays
- **Errors**: Throw `HttpException` with appropriate status code
- **Validation**: Use class-validator decorators on DTOs

---

## Database & ORM (Prisma)

### Query Optimization
- Use `select` to fetch only needed fields
- Use `include` for relations (avoid N+1 problems)
- Prefer `findUnique` over `findFirst` when searching by ID

### Example
```typescript
// Good - selective fields
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
    images: true
  },
  where: { active: true }
})

// Good - with relations
const order = await prisma.order.findUnique({
  where: { id },
  include: {
    items: true,
    shippingAddress: true,
    user: {
      select: { id: true, name: true, email: true }
    }
  }
})
```

---

## Error Handling

### Backend (NestJS)
```typescript
try {
  const result = await this.service.operation()
  return result
} catch (error) {
  this.logger.error('Operation failed', error)
  throw new HttpException(
    'Operation failed',
    HttpStatus.INTERNAL_SERVER_ERROR
  )
}
```

### Frontend (React)
```typescript
const [error, setError] = useState<string | null>(null)

try {
  const data = await api.get(endpoint)
  // handle success
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unknown error')
}
```

---

## Authentication & Authorization

### Backend
- JWT-based authentication using Passport
- Guards protect routes: `@UseAuth(JwtAuthGuard)`
- Role-based access: Custom decorators for admin routes

### Frontend
- Auth store with Zustand for state management
- Protected routes check authentication status
- httpOnly cookies preferred for token storage

### User Roles
- `USER`: Standard customer
- `ADMIN`: Full access to dashboard and management features

---

## State Management

### Global State (Zustand)
```typescript
// Auth store
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: LoginDTO) => Promise<void>
  logout: () => void
}

// Cart store
interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  total: () => number
}
```

### Server State (React Query)
- Use for server data that needs caching/refetching
- Built-in loading and error states
- Automatic refetching on focus

---

## Testing Guidelines

### Unit Tests (Jest)
```typescript
describe('ProductCard', () => {
  it('renders product name and price', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
  })
})
```

### E2E Tests (Playwright)
```typescript
test('user can add product to cart', async ({ page }) => {
  await page.goto('/products')
  await page.click('[data-testid="add-to-cart"]')
  await expect(page.locator('[data-testid="cart-count"]')).toContainText('1')
})
```

### Testing Best Practices
- Write tests for critical paths (checkout, auth, payments)
- Use `data-testid` for E2E element selection
- Mock external services in unit tests
- Aim for meaningful coverage, not just percentage

---

## Git Workflow

### Branch Naming
- Features: `feature/description`
- Bug fixes: `fix/issue-number`
- Hot fixes: `hotfix/description`

### Commit Message Format
```
type(scope): subject

feat(auth): add Google OAuth login
fix(cart): resolve quantity update bug
docs(readme): update installation instructions
chore(deps): update dependencies
```

### Allowed Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Pre-commit Hooks
- ESLint checks
- Prettier formatting
- Husky manages hooks via `lint-staged`

---

## Performance Considerations

### Frontend
- Use `next/image` with proper `sizes` attribute
- Implement lazy loading for routes and components
- Use React.memo for expensive components
- Debounce search inputs with `useDebounce` hook

### Backend
- Use Prisma `select` and `include` to limit fetched data
- Implement pagination for list endpoints
- Cache frequently accessed data when needed
- Use database indexes on frequently queried columns

### Database
- Add indexes on: `user_id`, `product_id`, `created_at`, `slug`
- Use `take` and `skip` for pagination
- Avoid N+1 queries with proper `include` usage

---

## Security Guidelines

### Input Validation
- Frontend: Zod schemas for form validation
- Backend: class-validator decorators on DTOs
- Validate all user inputs on the server

### Authentication
- JWT tokens in httpOnly cookies (preferred)
- Implement proper password hashing (bcrypt)
- Add rate limiting on auth endpoints

### API Protection
- Use guards for protected routes
- Implement CORS properly
- Validate request bodies and query parameters

### Environment Variables
- Never commit `.env` files
- Use Railway environment variables
- Prefix sensitive variables: `JWT_SECRET`, `DATABASE_URL`

---

## Deployment

### Environment Variables Required
```
# Backend
DATABASE_URL, JWT_SECRET, JWT_EXPIRATION, CLOUDINARY_URL

# Frontend
NEXT_PUBLIC_API_URL, NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
```

### Build Commands
```bash
# Backend
pnpm -C backend run build
pnpm -C backend run start:prod

# Frontend
pnpm -C frontend/refrielectricos run build
pnpm -C frontend/refrielectricos run start
```

---

## Common Workflows

### Adding a New Feature
1. Create feature branch from `develop`
2. Add backend endpoint (controller + service + DTO)
3. Add database migration if needed
4. Create frontend components and pages
5. Add tests (unit + E2E if applicable)
6. Update documentation
7. Create pull request for review

### Fixing a Bug
1. Create issue or use existing issue number
2. Create branch: `fix/issue-number-description`
3. Write failing test first (TDD approach)
4. Implement fix
5. Verify test passes
6. Create pull request

### Database Migrations
```bash
# Create new migration
cd backend && npx prisma migrate dev --name migration_name

# Apply migrations in production
cd backend && npx prisma migrate deploy

# Reset database (dev only)
cd backend && npx prisma migrate reset
```

---

## External Integrations

### Cloudinary (Images)
- Upload product and user images via files module
- Use optimized transformations for thumbnails
- Store only public_id in database

### Wompi (Payments)
- Payment processing for orders
- Webhook handling for payment events
- Support for Colombian payment methods

### Colombia Data
- Use provided `colombiaData.js` for departments/cities
- Pre-loaded with valid Colombia regions

---

## Additional Resources

- **Copilot Instructions**: See `.github/copilot-instructions.md` for detailed AI assistant guidelines
- **Backend README**: See `backend/README.md` for backend-specific documentation
- **Frontend README**: See `frontend/refrielectricos/README.md` for frontend-specific documentation

---

## Quick Reference

| Task | Command |
|------|---------|
| Start dev servers | `pnpm run dev` |
| Run all tests | `pnpm run test` |
| Lint project | `pnpm run lint` |
| Format code | `pnpm run format` |
| Install deps | `pnpm install` |
| Database reset | `cd backend && npx prisma migrate reset` |

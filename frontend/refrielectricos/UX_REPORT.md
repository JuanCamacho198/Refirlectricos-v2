# Reporte de UX y QA - Refrielectricos

Fecha: 8 de Diciembre, 2025
Sitio: https://frontend-production-4178.up.railway.app/

## 1. Hallazgos Principales

### A. Formularios de Autenticación (Login/Registro)
*   **Falta de Feedback Visual:** Al enviar formularios vacíos o con datos inválidos (ej. email incorrecto), no se observaron mensajes de error explícitos en la interfaz (textos rojos debajo de los inputs). Es posible que se esté confiando únicamente en la validación nativa del navegador, lo cual ofrece una experiencia pobre.
*   **Recomendación:** Implementar mensajes de validación en tiempo real o al hacer submit usando componentes de UI (ej. React Hook Form con mensajes de error visibles).

### B. Persistencia de Sesión
*   **Comportamiento:** Durante las pruebas automatizadas, la sesión pareció perderse al navegar directamente a rutas protegidas (`/profile/addresses`) después de loguearse.
*   **Recomendación:** Verificar la configuración de cookies (`SameSite`, `Secure`) y el manejo de tokens (JWT/Session) para asegurar que la sesión persista correctamente entre recargas y navegaciones.

### C. Rutas Protegidas
*   **Redirección:** Al intentar acceder a `/profile/addresses` sin sesión, se redirige correctamente al Login.
*   **Mejora:** Sería ideal que, tras iniciar sesión, el usuario fuera redirigido automáticamente a la página que intentaba visitar originalmente (Deep Linking), en lugar de ir siempre al Home.

### D. Accesibilidad y Usabilidad
*   **Feedback de Éxito:** El registro exitoso muestra un mensaje "Toast" ("Cuenta creada exitosamente"), lo cual es excelente.
*   **Navegación:** El menú de usuario (dropdown) es funcional y permite cerrar sesión correctamente.

## 2. Escenarios de Prueba Cubiertos (Playwright)

Se ha generado el archivo `tests/e2e/auth-flows.spec.ts` cubriendo:

1.  **Registro:**
    *   Validación de campos vacíos/inválidos.
    *   Flujo exitoso con creación de usuario único.
    *   Verificación de redirección y mensajes de éxito.

2.  **Login:**
    *   Intento con credenciales erróneas.
    *   (Estructura para) Login exitoso.

3.  **Perfil (Direcciones):**
    *   Verificación de protección de ruta (redirección a login).
    *   Flujo completo: Registro -> Navegación a Direcciones -> Agregar Dirección (simulado).

4.  **Admin:**
    *   Verificación de control de acceso a rutas administrativas.

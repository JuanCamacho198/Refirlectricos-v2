const path = require('path');

const toPosixPath = (p) => p.split(path.sep).join('/');

module.exports = {
  // Configuración para el Backend (NestJS - ESLint estándar)
  'backend/**/*.{ts,tsx}': (filenames) => {
    const cwd = process.cwd();
    const backendDir = path.join(cwd, 'backend');
    const relativeFiles = filenames.map((f) => toPosixPath(path.relative(backendDir, f)));
    const filesStr = relativeFiles.join(' ');
    return `pnpm -C backend exec eslint ${filesStr} --fix`;
  },

  // Configuración para el Frontend (Next.js - next lint)
  'frontend/refrielectricos/**/*.{ts,tsx}': (filenames) => {
    const cwd = process.cwd();
    const frontendDir = path.join(cwd, 'frontend', 'refrielectricos');
    const relativeFiles = filenames.map((f) => toPosixPath(path.relative(frontendDir, f)));
    const filesStr = relativeFiles.join(' ');
    // Usamos eslint directamente porque next lint tiene problemas con --file en algunas versiones
    return `pnpm -C frontend/refrielectricos exec eslint ${filesStr} --fix`;
  },
};
# Gestión de Inventario — Aliados Facilísimo

Dashboard interno de inventario para gestión de productos con control de stock, categorías y precios.

---

## Requisitos previos

- **Node.js** v18 o superior
- **npm** v9 o superior

---

## Instalación

```bash
npm install
```

---

## Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:4321`.

---

## Build de producción

```bash
npm run build
```

El servidor standalone se genera en la carpeta `dist/`. Para iniciarlo:

```bash
node dist/server/entry.mjs
```

Para previsualizar el build localmente antes de desplegar:

```bash
npm run preview
```

---

## Rutas de la aplicación

| Ruta | Descripción |
|---|---|
| `/` | Página de inicio |
| `/inventory/` | Dashboard principal de inventario |
| `/api/products` | API REST de productos (GET / POST / PUT / DELETE) |

---

## Base de datos

El proyecto usa un **archivo JSON como base de datos** — no requiere ninguna base de datos externa.

Los datos se almacenan en:

```
src/data/products.json
```

Este archivo se crea automáticamente vacío (`[]`) si no existe al iniciar el servidor. **No lo elimines si tienes datos en producción** — es la única fuente de verdad de la aplicación.

---

## Estructura del proyecto

```
src/
├── components/     # Componentes Astro reutilizables (tabla, modales, KPIs, widgets)
├── data/           # products.json — base de datos local
├── pages/
│   ├── api/        # Endpoints REST
│   └── inventory/  # Dashboard
├── styles/         # CSS personalizado (glassmorphism)
└── utils/          # Utilidades (stub de permisos)
```

---

## Variables de entorno

Este proyecto **no requiere variables de entorno**. No es necesario crear un archivo `.env`.

---

## Tecnologías

- [Astro 4](https://astro.build) — Framework SSR
- [Tailwind CSS 3](https://tailwindcss.com) — Estilos utilitarios
- [TypeScript](https://www.typescriptlang.org) — Tipado estático
- Node.js adapter (modo standalone)

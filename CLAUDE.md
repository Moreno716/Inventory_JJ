# CLAUDE.md — Contexto del proyecto para Claude Code

## ¿Qué es este proyecto?

Aplicación web de gestión de inventario interna llamada **"Tienda JJ"**. Es una app SSR construida con Astro 4 + Node.js que permite crear, editar, eliminar y buscar productos con categorías y precios. Diseñada mobile-first para uso desde celular.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Astro 4 (SSR, `output: "server"`) |
| Servidor | `@astrojs/node` adapter en modo `standalone` |
| Estilos | Tailwind CSS v3 + CSS personalizado (glassmorphism) |
| Lenguaje | TypeScript |
| Base de datos | Archivo JSON plano en disco (`src/data/products.json`) |
| Interactividad | Scripts de navegador nativos dentro de bloques `<script>` en componentes `.astro` |

React está instalado como dependencia pero **no se usa actualmente** en ningún componente.

## Estructura del proyecto

```
src/
├── components/
│   ├── CategoryDistributionWidget.astro  # Widget barra de categorías (sidebar)
│   ├── InventarioForm.astro              # Buscador + botón "Nuevo Producto"
│   ├── InventarioTable.astro             # Tabla principal con controles +/- de cantidad
│   ├── InventoryModals.astro             # Modales: Agregar / Editar / Eliminar
│   ├── KpiCards.astro                    # 4 tarjetas KPI (productos, stock, valor, categorías)
│   └── StockAlertsWidget.astro           # Alertas de stock bajo (cantidad < 5)
├── data/
│   └── products.json                     # BASE DE DATOS — JSON plano en disco
├── pages/
│   ├── api/
│   │   └── products.ts                   # API REST: GET / POST / PUT / DELETE
│   ├── index.astro                       # Página de inicio / landing
│   └── inventory/
│       └── index.astro                   # Dashboard principal (dos columnas)
├── styles/
│   └── inventory.css                     # Fuentes, orbes de brillo, grid overlay, paneles glass
└── utils/
    └── permissionUtils.ts                # Stub de autenticación (siempre retorna true)
```

## Rutas de la aplicación

| Ruta | Archivo | Descripción |
|---|---|---|
| `/` | `src/pages/index.astro` | Landing page con hero y CTA |
| `/inventory/` | `src/pages/inventory/index.astro` | Dashboard principal |
| `/api/products` | `src/pages/api/products.ts` | API REST de productos |

## Base de datos

**No hay base de datos externa.** Todos los datos se almacenan en:

```
src/data/products.json
```

La API lee y escribe este archivo directamente con `node:fs/promises`. El archivo se inicializa automáticamente como `[]` si no existe.

### Esquema de producto

```ts
{
  id: number;           // Timestamp como ID (Date.now())
  nombre: string;       // requerido
  categoria: string;    // opcional
  precio: number;       // opcional
  fechaCreacion: string; // ISO 8601
}
```

### Endpoints de la API

| Método | Descripción |
|---|---|
| `GET /api/products` | Lista todos los productos |
| `POST /api/products` | Crea un producto nuevo |
| `PUT /api/products` | Actualiza un producto existente (requiere `id` en el body) |
| `DELETE /api/products?id=<id>` | Elimina un producto por ID |

## Variables de entorno

**No hay variables de entorno.** El proyecto no usa archivos `.env`. Solo se usa `import.meta.env.DEV` de Astro para detectar el modo de desarrollo.

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo con hot reload (puerto 4321 por defecto)
npm run build    # Build de producción
npm run preview  # Previsualizar el build de producción localmente
```

## Patrones de interactividad

Toda la lógica de cliente vive dentro de bloques `<script>` en los componentes `.astro`. No hay componentes React montados. Los componentes se comunican mediante un evento DOM personalizado:

```js
document.dispatchEvent(new CustomEvent('inventarioActualizado'));
```

Este evento se despacha después de agregar un producto para que la tabla se recargue automáticamente.

## Consideraciones al modificar el proyecto

- **Si agregas campos al esquema de producto**, actualiza: el modal de agregar/editar en `InventoryModals.astro`, la tabla en `InventarioTable.astro`, los KPI en `KpiCards.astro`, y la API en `src/pages/api/products.ts`.
- **El archivo `products.json` es la única fuente de verdad** — no hay migraciones, no hay ORM.
- **`permissionUtils.ts` es un stub** — si se agrega autenticación real, ese es el punto de entrada.
- **Archivos legados en raíz** (`index.html`, `script.js`, `style.css`) son prototipos anteriores y no forman parte de la aplicación Astro.
- El proyecto usa el alias `@` → `./src` en imports de TypeScript y Astro.

## Paleta de colores / Branding

| Token | Valor | Uso |
|---|---|---|
| Fondo principal | `#001A6E` (navy) | Background del dashboard |
| Acento / teal | `#00D2C4` | Bordes, highlights, KPIs |
| Glass panel | `rgba(255,255,255,0.12)` | Tarjetas y modales |
| Texto | `white` / `rgba(255,255,255,0.7)` | Texto principal y secundario |

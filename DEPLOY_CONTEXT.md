# Contexto de despliegue: Cloudflare Workers + KV

Este documento resume todo lo aprendido desplegando una app SSR en Cloudflare Workers
con almacenamiento en KV. Sirve de referencia para nuevos proyectos.

---

## Modelo de despliegue elegido: Cloudflare Workers (NO Pages)

**¿Por qué Workers y no Pages?**
- Cloudflare Pages tiene un modelo de despliegue distinto que genera conflictos con
  los adapters modernos de frameworks SSR.
- Workers+Assets es el modelo nativo que los adapters actuales generan directamente.
- Evita hacks de configuración post-build y es más simple de mantener.

---

## Archivos clave del proyecto

### `wrangler.toml` (en la raíz del proyecto)
```toml
name = "nombre-del-worker"
compatibility_date = "2024-09-23"

# NO poner aquí: main, [assets] — esos los genera el adapter en dist/server/wrangler.json
# SÍ poner aquí: el KV binding (para que el adapter lo incluya en su config generada)

[[kv_namespaces]]
binding = "INVENTORY_KV"
id = "TU_KV_NAMESPACE_ID"
```

**CRÍTICO:** No agregar `main` ni `[assets]` aquí.
El `@cloudflare/vite-plugin` lee `wrangler.toml` durante el build y falla si `main`
apunta a un archivo que aún no existe (es el output del build, no el input).

### `scripts/patch-deploy.mjs`
Script que inyecta el KV binding en el `wrangler.json` generado por el adapter:
```js
import { readFileSync, writeFileSync } from 'node:fs';

const configPath = './dist/server/wrangler.json';
const config = JSON.parse(readFileSync(configPath, 'utf8'));

config.kv_namespaces = [{
  binding: "INVENTORY_KV",
  id: "TU_KV_NAMESPACE_ID",
}];

writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Added INVENTORY_KV to dist/server/wrangler.json');
```

### `package.json` — script de build
```json
"build": "COMANDO_BUILD_DEL_FRAMEWORK && node scripts/patch-deploy.mjs"
```
- Astro: `astro build && node scripts/patch-deploy.mjs`
- Angular con adapter SSR: `ng build && node scripts/patch-deploy.mjs`

### `.github/workflows/deploy.yml`
```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'       # Verificar versión mínima del framework
          cache: 'npm'

      - run: npm ci

      - run: npm run build

      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          command: deploy --config dist/server/wrangler.json
          # El adapter genera dist/server/wrangler.json con main y assets correctos
```

---

## Configuración de GitHub Secrets (hacer una sola vez por repo)

En GitHub → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Cómo obtenerlo |
|--------|----------------|
| `CF_API_TOKEN` | dash.cloudflare.com → Mi perfil → API Tokens → Create Token → plantilla "Edit Cloudflare Workers" → seleccionar cuenta en Account Resources |
| `CF_ACCOUNT_ID` | dash.cloudflare.com → Workers & Pages → columna derecha → "Account ID" |

---

## KV Namespace

### Crear el namespace
En dash.cloudflare.com → Workers & Pages → KV → Create namespace.
Copiar el ID generado y pegarlo en `wrangler.toml` y en `scripts/patch-deploy.mjs`.

### Acceder al KV en el código (Astro v7 / frameworks modernos)
```typescript
// CORRECTO para Astro v7+ y frameworks con adapter Cloudflare moderno
import { env } from "cloudflare:workers";

export function getKV() {
  const kv = (env as any)?.INVENTORY_KV;
  if (kv) return kv;
  // Fallback en memoria para desarrollo local sin KV configurado
  const _devStore = new Map<string, string>();
  return {
    get: async (key: string) => _devStore.get(key) ?? null,
    put: async (key: string, value: string) => { _devStore.set(key, value); },
    delete: async (key: string) => { _devStore.delete(key); },
  };
}
```

**IMPORTANTE:** `locals.runtime.env` fue eliminado en Astro v6+.
La forma correcta es `import { env } from "cloudflare:workers"`.
Este módulo está disponible nativamente en el runtime de Workers y es
polyfilled por `@cloudflare/vite-plugin` en desarrollo local.

### ¿Por qué KV y no archivos JSON?
Los Workers de Cloudflare NO tienen acceso a disco. El runtime es browser-like,
sin `node:fs`. Los datos deben vivir en:
- **KV** — pares clave-valor, simple, eventual consistency. Ideal para datos de app.
- **D1** — SQLite serverless. Mejor para datos relacionales complejos.
- **R2** — Almacenamiento de objetos. Para archivos/imágenes.

---

## Errores comunes y sus soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `main doesn't point to an existing file` | `main` en `wrangler.toml` durante build | Quitar `main` y `[assets]` de `wrangler.toml` |
| `The name 'ASSETS' is reserved in Pages projects` | Usar Pages en vez de Workers | Migrar a Workers |
| `locals.runtime.env has been removed` | API vieja de acceso a bindings | Usar `import { env } from "cloudflare:workers"` |
| `ERR_TOO_MANY_REDIRECTS` | Archivo `public/_redirects` con regla que genera loop | Eliminar o revisar `_redirects` |
| CSS sin estilos (Tailwind) | Falta `postcss.config.mjs` | Crear el archivo con plugins tailwindcss y autoprefixer |
| Node.js version error en CI | Versión de Node incompatible | Usar Node 22+ (Astro 7 requiere >=22.12.0) |

---

## CSS con Tailwind (si aplica)

Crear `postcss.config.mjs`:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Agregar al archivo CSS principal (antes de los estilos custom):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Sin `postcss.config.mjs`, Tailwind no procesa ninguna clase de utilidad
y el CSS generado queda vacío, aunque el HTML renderice correctamente.

---

## Flujo completo de primer deploy

1. Crear KV namespace en Cloudflare dashboard → copiar ID
2. Configurar `wrangler.toml` con nombre y KV (sin `main`/`assets`)
3. Crear `scripts/patch-deploy.mjs` con el KV ID
4. Crear `.github/workflows/deploy.yml` con Node 22+
5. Agregar secrets `CF_API_TOKEN` y `CF_ACCOUNT_ID` en GitHub
6. Push a `main` → GitHub Action despliega automáticamente
7. El Worker se crea solo en Cloudflare si no existe

El Worker queda disponible en:
`https://nombre-del-worker.TU-SUBCUENTA.workers.dev`

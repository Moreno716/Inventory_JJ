import {
  readFileSync, writeFileSync, copyFileSync,
  mkdirSync, readdirSync, statSync, rmSync,
  existsSync, appendFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { build } from 'esbuild';

// 1. Flatten dist/client/* → dist/*
// The adapter puts static assets in dist/client/ (Workers+Assets model) but
// Pages Advanced Mode expects them at the root of pages_build_output_dir (dist/).
function copyDir(src, dest) {
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}
copyDir('./dist/client', './dist');
rmSync('./dist/client', { recursive: true });
console.log('Flattened dist/client → dist');

// 2. Bundle entry.mjs into a single self-contained _worker.js.
// Pages Advanced Mode requires _worker.js to be a fully bundled ESM file —
// it does NOT resolve external imports at runtime. A thin re-export like
// `export { default } from './server/entry.mjs'` silently fails because
// Pages never bundles the server/ directory's chunks.
console.log('Bundling dist/server/entry.mjs → dist/_worker.js ...');
await build({
  entryPoints: ['./dist/server/entry.mjs'],
  bundle: true,
  format: 'esm',
  outfile: './dist/_worker.js',
  platform: 'browser',      // Cloudflare Workers uses a browser-like environment
  conditions: ['workerd', 'worker', 'browser'],
  // Mark node: and cloudflare: namespaces as external — available at runtime
  external: ['node:*', 'cloudflare:*'],
  // Allow top-level await (used by Astro's entry)
  supported: { 'top-level-await': true },
  minify: false,             // Keep readable for debugging
  logLevel: 'info',
});
console.log('Created dist/_worker.js (bundled)');

// 3. Exclude server/ from static asset serving (it's now embedded in _worker.js,
//    but the directory still exists and should not be served as public files).
const assetsIgnorePath = './dist/.assetsignore';
const existing = existsSync(assetsIgnorePath) ? readFileSync(assetsIgnorePath, 'utf8') : '';
if (!existing.includes('server/')) {
  appendFileSync(assetsIgnorePath, '\nserver/\n');
}
console.log('Updated .assetsignore to exclude server/');

// 4. Remove .wrangler/deploy/config.json so Pages uses wrangler.toml directly
// (the adapter generates this file to redirect to dist/server/wrangler.json,
// which is a Workers+Assets config incompatible with traditional Pages CI).
if (existsSync('./.wrangler/deploy/config.json')) {
  rmSync('./.wrangler/deploy/config.json');
  console.log('Removed .wrangler/deploy/config.json');
}

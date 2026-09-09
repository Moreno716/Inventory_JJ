import {
  readFileSync, writeFileSync, copyFileSync,
  mkdirSync, readdirSync, statSync, rmSync,
  existsSync, appendFileSync,
} from 'node:fs';
import { join } from 'node:path';

// 1. Flatten dist/client/* → dist/*
// The adapter puts static assets in dist/client/ (Workers+Assets model) but
// Pages Advanced Mode expects them at the root of pages_build_output_dir (dist/).
// Astro generates /_astro/ links so assets must be at dist/_astro/, not dist/client/_astro/.
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

// 2. Create dist/_worker.js for Pages Advanced Mode.
// Pages bundles ESM imports, so this thin re-export is enough.
// The Worker uses env.ASSETS (auto-provided by Pages) and env.INVENTORY_KV (dashboard binding).
writeFileSync('./dist/_worker.js', `export { default } from './server/entry.mjs';\n`);
console.log('Created dist/_worker.js');

// 3. Exclude server/ from static asset serving (it's Worker code, not public files).
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

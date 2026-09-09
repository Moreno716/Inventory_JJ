import { readFileSync, writeFileSync } from 'node:fs';

const path = './dist/server/wrangler.json';
const config = JSON.parse(readFileSync(path, 'utf8'));

// Cloudflare Pages reserves the binding name 'ASSETS' — remove it so Pages deploy succeeds.
// Pages handles static assets automatically via pages_build_output_dir; no binding needed.
delete config.assets;
if (config.previews) delete config.previews.assets;

writeFileSync(path, JSON.stringify(config, null, 2));
console.log('Patched dist/server/wrangler.json: removed reserved ASSETS binding');

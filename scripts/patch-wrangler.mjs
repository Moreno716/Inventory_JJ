import { readFileSync, writeFileSync } from 'node:fs';

const path = './dist/server/wrangler.json';
const config = JSON.parse(readFileSync(path, 'utf8'));

// Remove pages_build_output_dir: incompatible with `main` in Workers+Assets mode.
// The adapter v14 targets Cloudflare Workers+Assets, not traditional Pages mode.
delete config.pages_build_output_dir;

// Add assets.directory so Pages CI knows where to upload static files.
// Path is relative to dist/server/wrangler.json → dist/client/
if (config.assets) {
  config.assets.directory = '../client';
} else {
  config.assets = { binding: 'ASSETS', directory: '../client' };
}

writeFileSync(path, JSON.stringify(config, null, 2));
console.log('Patched dist/server/wrangler.json: removed pages_build_output_dir, added assets.directory');

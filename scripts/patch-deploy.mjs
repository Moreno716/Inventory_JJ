import { readFileSync, writeFileSync } from 'node:fs';

const configPath = './dist/server/wrangler.json';
const config = JSON.parse(readFileSync(configPath, 'utf8'));

config.kv_namespaces = [{
  binding: "INVENTORY_KV",
  id: "a4641925e7884923b41828e41d428f57",
}];

writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Added INVENTORY_KV to dist/server/wrangler.json');

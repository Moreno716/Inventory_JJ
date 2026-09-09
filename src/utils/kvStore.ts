import { env } from "cloudflare:workers";

const _devStore = new Map<string, string>();

export function getKV(): KVNamespace {
  const kv = (env as any)?.INVENTORY_KV;
  if (kv) return kv;
  return {
    get: async (key: string) => _devStore.get(key) ?? null,
    put: async (key: string, value: string) => { _devStore.set(key, value); },
    delete: async (key: string) => { _devStore.delete(key); },
  };
}

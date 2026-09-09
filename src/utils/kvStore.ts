// In-memory fallback used only during local dev (npm run dev).
// In Cloudflare Pages, locals.runtime.env.INVENTORY_KV is the real KV namespace.
const _devStore = new Map<string, string>();

export function getKV(locals: App.Locals): KVNamespace {
  const kv = locals.runtime?.env?.INVENTORY_KV;
  if (kv) return kv;
  return {
    get: async (key) => _devStore.get(key) ?? null,
    put: async (key, value) => { _devStore.set(key, value); },
    delete: async (key) => { _devStore.delete(key); },
  };
}

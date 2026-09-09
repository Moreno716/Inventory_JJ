export async function readCategories(KV: KVNamespace): Promise<string[]> {
  try {
    const data = await KV.get('categories');
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveCategories(KV: KVNamespace, cats: string[]): Promise<void> {
  await KV.put('categories', JSON.stringify(cats));
}

export async function addCategory(KV: KVNamespace, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  const cats = await readCategories(KV);
  if (cats.some(c => c.toLowerCase() === trimmed.toLowerCase())) return;
  cats.push(trimmed);
  cats.sort((a, b) => a.localeCompare(b, 'es'));
  await saveCategories(KV, cats);
}

export async function removeCategory(KV: KVNamespace, name: string): Promise<void> {
  const cats = await readCategories(KV);
  await saveCategories(KV, cats.filter(c => c !== name));
}

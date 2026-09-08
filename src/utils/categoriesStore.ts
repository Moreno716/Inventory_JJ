import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const catsPath = fileURLToPath(new URL("../data/categories.json", import.meta.url));

export async function readCategories(): Promise<string[]> {
  try {
    const content = await fs.readFile(catsPath, "utf-8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveCategories(cats: string[]): Promise<void> {
  await fs.mkdir(path.dirname(catsPath), { recursive: true });
  await fs.writeFile(catsPath, JSON.stringify(cats, null, 2));
}

export async function addCategory(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  const cats = await readCategories();
  if (cats.some(c => c.toLowerCase() === trimmed.toLowerCase())) return;
  cats.push(trimmed);
  cats.sort((a, b) => a.localeCompare(b, "es"));
  await saveCategories(cats);
}

export async function removeCategory(name: string): Promise<void> {
  const cats = await readCategories();
  await saveCategories(cats.filter(c => c !== name));
}

import type { APIRoute } from "astro";
import { readCategories, addCategory, removeCategory } from "@/utils/categoriesStore";
import { getKV } from "@/utils/kvStore";

export const GET: APIRoute = async ({ locals }) => {
  const KV = getKV(locals);
  const cats = await readCategories(KV);
  return new Response(JSON.stringify(cats), {
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const KV = getKV(locals);
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    await addCategory(KV, body.nombre || "");
    const cats = await readCategories(KV);
    return new Response(JSON.stringify(cats), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    const KV = getKV(locals);
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    await removeCategory(KV, body.nombre || "");
    const cats = await readCategories(KV);
    return new Response(JSON.stringify(cats), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

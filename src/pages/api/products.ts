import type { APIRoute } from "astro";
import { getKV } from "@/utils/kvStore";
import { addCategory } from "@/utils/categoriesStore";

async function readProducts(KV: KVNamespace): Promise<any[]> {
  try {
    const data = await KV.get('products');
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const GET: APIRoute = async ({ locals }) => {
  try {
    const KV = getKV(locals);
    const products = await readProducts(KV);
    return new Response(JSON.stringify(products), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("[]", {
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const KV = getKV(locals);
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    const products = await readProducts(KV);

    const newProduct = {
      id: Date.now(),
      nombre: (body.nombre || "").trim(),
      categoria: (body.categoria || "").trim(),
      precio: Number(body.precio) || 0,
      fechaCreacion: new Date().toISOString(),
    };

    products.push(newProduct);
    await KV.put('products', JSON.stringify(products));
    if (newProduct.categoria) await addCategory(KV, newProduct.categoria);

    return new Response(JSON.stringify(newProduct), {
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

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const KV = getKV(locals);
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    const products = await readProducts(KV);

    const index = products.findIndex((p: any) => String(p.id) === String(body.id));
    if (index === -1) {
      return new Response(JSON.stringify({ error: "Producto no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updated = {
      ...products[index],
      nombre: (body.nombre ?? products[index].nombre).trim(),
      categoria: (body.categoria ?? products[index].categoria ?? "").trim(),
      precio: Number(body.precio ?? products[index].precio) || 0,
    };

    products[index] = updated;
    await KV.put('products', JSON.stringify(products));
    if (updated.categoria) await addCategory(KV, updated.categoria);

    return new Response(JSON.stringify(updated), {
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
    const id = Number(body.id);
    let products = await readProducts(KV);

    products = products.filter((p: any) => p.id !== id);
    await KV.put('products', JSON.stringify(products));

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

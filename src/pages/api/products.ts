import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addCategory } from "@/utils/categoriesStore";

const dataPath = fileURLToPath(new URL("../../data/products.json", import.meta.url));

async function initFile() {
  try {
    await fs.readFile(dataPath, "utf-8");
  } catch {
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, "[]");
  }
}

async function readProducts() {
  try {
    const content = await fs.readFile(dataPath, "utf-8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const GET: APIRoute = async () => {
  try {
    await initFile();
    const content = await fs.readFile(dataPath, "utf-8");
    return new Response(content || "[]", {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("[]", {
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    await initFile();
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    const products = await readProducts();

    const newProduct = {
      id: Date.now(),
      nombre: (body.nombre || "").trim(),
      categoria: (body.categoria || "").trim(),
      precio: Number(body.precio) || 0,
      fechaCreacion: new Date().toISOString(),
    };

    products.push(newProduct);
    await fs.writeFile(dataPath, JSON.stringify(products, null, 2));
    if (newProduct.categoria) await addCategory(newProduct.categoria);

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

export const PUT: APIRoute = async ({ request }) => {
  try {
    await initFile();
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    const products = await readProducts();

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
    await fs.writeFile(dataPath, JSON.stringify(products, null, 2));
    if (updated.categoria) await addCategory(updated.categoria);

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

export const DELETE: APIRoute = async ({ request }) => {
  try {
    await initFile();
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    const id = Number(body.id);
    let products = await readProducts();

    products = products.filter((p: any) => p.id !== id);
    await fs.writeFile(dataPath, JSON.stringify(products, null, 2));

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

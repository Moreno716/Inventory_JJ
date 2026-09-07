import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

function normalizeBody(body: any) {
  if (!body || typeof body !== "object") return {};
  return body;
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
    console.log("Raw request body:", text);
    const body = text ? JSON.parse(text) : {};
    const normalizedBody = normalizeBody(body);
    const products = await readProducts();

    const newProduct = {
      id: Date.now(),
      nombre: normalizedBody.nombre || "",
      cantidad: Number(normalizedBody.cantidad) || 0,
      categoria: normalizedBody.categoria || "",
      precio: Number(normalizedBody.precio) || 0,
      descripcion: normalizedBody.descripcion || "",
      fechaCreacion: new Date().toISOString(),
    };

    products.push(newProduct);

    await fs.writeFile(dataPath, JSON.stringify(products, null, 2));

    return new Response(JSON.stringify(newProduct), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    await initFile();

    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    const normalizedBody = normalizeBody(body);
    const products = await readProducts();

    const index = products.findIndex((product: any) => String(product.id) === String(normalizedBody.id));
    if (index === -1) {
      return new Response(JSON.stringify({ error: "Producto no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updatedProduct = {
      ...products[index],
      nombre: normalizedBody.nombre ?? products[index].nombre,
      cantidad: Number(normalizedBody.cantidad ?? products[index].cantidad) || 0,
      categoria: normalizedBody.categoria ?? products[index].categoria,
      precio: Number(normalizedBody.precio ?? products[index].precio) || 0,
      descripcion: normalizedBody.descripcion ?? products[index].descripcion,
    };

    products[index] = updatedProduct;
    await fs.writeFile(dataPath, JSON.stringify(products, null, 2));

    return new Response(JSON.stringify(updatedProduct), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    await initFile();

    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    const normalizedBody = normalizeBody(body);
    const id = Number(normalizedBody.id);
    let products = await readProducts();

    products = products.filter((p: any) => p.id !== id);
    await fs.writeFile(dataPath, JSON.stringify(products, null, 2));

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
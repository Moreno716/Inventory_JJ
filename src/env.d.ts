/// <reference path="../.astro/types.d.ts" />

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

declare namespace App {
  interface Locals {
    runtime?: {
      env?: {
        INVENTORY_KV?: KVNamespace;
      };
    };
  }
}

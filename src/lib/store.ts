import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { categories, phoneBrands, products } from "@/data/products";
import type { DB } from "@/data/types";
import { defaultSettings } from "./site";

/**
 * Fayl əsaslı verilənlər bazası (data/db.json) və yüklənmiş şəkillər (data/uploads).
 * Qovluğu BYCASE_DATA_DIR ilə dəyişmək olar. Server yenidən başlayanda məlumat itmir,
 * amma qovluq daimi (persistent) disk olmalıdır.
 */
export const DATA_DIR = process.env.BYCASE_DATA_DIR
  ? path.resolve(process.env.BYCASE_DATA_DIR)
  : path.join(process.cwd(), "data");
export const DB_FILE = path.join(DATA_DIR, "db.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

function seedDB(): DB {
  const now = new Date().toISOString().slice(0, 10);
  return {
    version: 1,
    settings: defaultSettings,
    categories,
    brands: phoneBrands,
    products: products.map((p) => ({ ...p, active: true, updatedAt: now })),
  };
}

async function writeAtomic(db: DB, flag?: "wx") {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const json = JSON.stringify(db, null, 2);
  if (flag === "wx") {
    try {
      await fs.writeFile(DB_FILE, json, { flag: "wx" });
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
    }
    return;
  }
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, json);
  await fs.rename(tmp, DB_FILE);
}

export async function getDB(): Promise<DB> {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, "utf8")) as DB;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    await writeAtomic(seedDB(), "wx");
    return JSON.parse(await fs.readFile(DB_FILE, "utf8")) as DB;
  }
}

// Yazmalar növbə ilə icra olunur (eyni anda iki dəyişiklik bir-birini ləğv etməsin)
const g = globalThis as unknown as { __bycaseQueue?: Promise<unknown> };

export function mutateDB<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = async () => {
    const db = await getDB();
    const result = await fn(db);
    await writeAtomic(db);
    return result;
  };
  const next = (g.__bycaseQueue ?? Promise.resolve()).then(run, run);
  g.__bycaseQueue = next.catch(() => undefined);
  return next;
}

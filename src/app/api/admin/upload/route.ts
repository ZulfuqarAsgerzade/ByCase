import { promises as fs } from "fs";
import { randomBytes } from "crypto";
import path from "path";
import { isAdmin } from "@/lib/auth";
import { UPLOAD_DIR } from "@/lib/store";

const MAX_BYTES = 8 * 1024 * 1024;

/** Faylın real tipini ilk baytlarından təyin edir (brauzerin dediyinə inanmırıq) */
function sniff(b: Buffer): "jpg" | "png" | "webp" | "gif" | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP") return "webp";
  if (b.subarray(0, 4).toString() === "GIF8") return "gif";
  return null;
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "İcazə yoxdur." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Fayl seçilməyib." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Şəkil 8 MB-dan böyük ola bilməz." }, { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniff(buf);
  if (!ext) return Response.json({ error: "Yalnız JPG, PNG, WebP və ya GIF şəkil yükləyin." }, { status: 415 });

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return Response.json({ url: `/uploads/${name}` });
}

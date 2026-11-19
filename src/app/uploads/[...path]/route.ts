import { promises as fs } from "fs";
import path from "path";
import { UPLOAD_DIR } from "@/lib/store";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  // Yalnız tək fayl adı və yalnız bizim yaratdığımız format qəbul olunur (qovluqdan çıxmağa icazə yoxdur)
  if (parts.length !== 1 || !/^[a-f0-9]{16,64}\.(jpg|png|webp|gif)$/.test(parts[0])) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, parts[0]));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPES[path.extname(parts[0])],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

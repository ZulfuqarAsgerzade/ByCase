import "server-only";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Sadə, tək idarəçili giriş. Parol və sessiya açarı mühit dəyişənlərindədir (.env.local):
 *   ADMIN_PASSWORD, ADMIN_SESSION_SECRET (ən azı 16 simvol)
 */
const COOKIE = "bc_admin";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function adminConfigured() {
  return !!process.env.ADMIN_PASSWORD && (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 16;
}

const sign = (v: string) => createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "").update(v).digest("base64url");

const digest = (v: string) => createHash("sha256").update(v).digest();

export function checkPassword(input: string) {
  if (!adminConfigured()) return false;
  return timingSafeEqual(digest(input), digest(process.env.ADMIN_PASSWORD!));
}

export async function createSession() {
  const expires = Date.now() + TTL_MS;
  const jar = await cookies();
  jar.set(COOKIE, `${expires}.${sign(String(expires))}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [expires, sig] = raw.split(".");
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  const expected = sign(expires);
  return sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

/* ---- Giriş cəhdlərinin məhdudlaşdırılması (brute-force qarşısı) ---- */
type Attempt = { count: number; first: number; lockedUntil: number };
const store = globalThis as unknown as { __bcAttempts?: Map<string, Attempt> };
const attempts = (store.__bcAttempts ??= new Map());
const MAX = 5;
const WINDOW = 10 * 60 * 1000;
const LOCK = 10 * 60 * 1000;
/**
 * Ümumi limit: IP-dən asılı olmayaraq bütün uğursuz cəhdlər sayılır.
 * `x-forwarded-for` başlığını müştəri saxtalaşdıra bilər (proksi arxasında olmayan serverdə),
 * ona görə yalnız IP-yə bağlı limit kifayət etmir.
 */
const GLOBAL_KEY = "*";
const GLOBAL_MAX = 40;
const MAX_TRACKED = 2000;

async function clientKey() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) || h.get("x-real-ip") || "local";
}

function minutesLeft(a?: Attempt) {
  return a && a.lockedUntil > Date.now() ? Math.ceil((a.lockedUntil - Date.now()) / 60000) : 0;
}

export async function loginLockedFor() {
  return Math.max(minutesLeft(attempts.get(await clientKey())), minutesLeft(attempts.get(GLOBAL_KEY)));
}

function fail(key: string, max: number, now: number) {
  const a = attempts.get(key);
  if (!a || now - a.first > WINDOW) return void attempts.set(key, { count: 1, first: now, lockedUntil: 0 });
  a.count += 1;
  if (a.count >= max) a.lockedUntil = now + LOCK;
}

export async function recordLogin(success: boolean) {
  const key = await clientKey();
  if (success) return void attempts.delete(key);
  const now = Date.now();
  // Yaddaş şişməsin: saxtalaşdırılmış çoxlu IP ilə cəhd edilsə köhnə qeydlər təmizlənir
  if (attempts.size > MAX_TRACKED) {
    for (const [k, v] of attempts) if (k !== GLOBAL_KEY && now - v.first > WINDOW && v.lockedUntil < now) attempts.delete(k);
    if (attempts.size > MAX_TRACKED) for (const k of attempts.keys()) if (k !== GLOBAL_KEY) attempts.delete(k);
  }
  fail(key, MAX, now);
  fail(GLOBAL_KEY, GLOBAL_MAX, now);
}

import { ApiError } from "@/lib/http";

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }
}

export function str(value: unknown, field: string, { min = 1, max = 5000 } = {}): string {
  if (typeof value !== "string" || value.trim().length < min) {
    throw new ApiError(400, `${field} is required`);
  }
  if (value.length > max) throw new ApiError(400, `${field} is too long`);
  return value.trim();
}

export function optionalStr(value: unknown, max = 5000): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string") throw new ApiError(400, "Invalid text value");
  return value.trim().slice(0, max);
}

export function num(value: unknown, field: string, { min = -Infinity, max = Infinity } = {}): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || Number.isNaN(n) || n < min || n > max) {
    throw new ApiError(400, `${field} must be a number between ${min} and ${max}`);
  }
  return n;
}

export function uuid(value: unknown, field: string): string {
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof value !== "string" || !re.test(value)) throw new ApiError(400, `${field} is invalid`);
  return value;
}

export function email(value: unknown): string {
  if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new ApiError(400, "A valid email is required");
  }
  return value.trim().toLowerCase();
}

export function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

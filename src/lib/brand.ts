// All media is bundled with the app under /public/assets — no external storage.
export const mediaUrl = (path: string) => `/assets/${path}`;

export const BRAND = {
  name: "HEMC",
  fullName: "Hashmi Eastern Medicine Clinic",
  logoUrl: "/assets/brand/logo.webp",
  markUrl: "/assets/brand/mark.webp", // square emblem for small nav/footer marks
  bannerUrl: "/assets/brand/banner.webp",
};

// Maps a product's stored image reference to its local, optimized WebP asset.
// Product images live at /assets/products/<name>.webp; any other URL is returned as-is.
export function productImage(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/\/products\/([^/?]+)\.\w+$/i);
  if (m) return `/assets/products/${m[1]}.webp`;
  return url;
}

// Uploads HEMC brand + product images to Supabase Storage and seeds the real
// catalog (categories + products). Idempotent: safe to re-run.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const ASSETS = "/home/awais/Desktop/MedicibesAssets";
const BUCKET = "media";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

const uploads = [
  { file: "WhatsApp Image 2026-05-01 at 9.54.14 PM.jpeg", path: "brand/logo.jpeg", type: "image/jpeg" },
  { file: "WhatsApp Image 2026-05-01 at 9.51.21 PM.jpeg", path: "brand/banner.jpeg", type: "image/jpeg" },
  { file: "BioKidney.png", path: "products/biokidney.png", type: "image/png" },
  { file: "BrainHerb.png", path: "products/brainherb.png", type: "image/png" },
  { file: "FemGlow.png", path: "products/femglow.png", type: "image/png" },
  { file: "Uriclear.png", path: "products/uriclear.png", type: "image/png" },
  { file: "Vitalarm.png", path: "products/vitalarm.png", type: "image/png" },
];

const categories = [
  { name: "Kidney & Urinary", slug: "kidney-urinary", description: "Herbal support for kidney function and the urinary tract." },
  { name: "Brain & Memory", slug: "brain-memory", description: "Formulas for focus, memory and mental clarity." },
  { name: "Women's Health", slug: "womens-health", description: "Wellness and beauty formulas for women." },
  { name: "Vitality & Wellness", slug: "vitality-wellness", description: "Everyday strength, energy and general wellbeing." },
];

// Prices in PKR are sensible placeholders — the owner edits them from /admin.
const products = [
  { name: "BioKidney", slug: "biokidney", category: "kidney-urinary", price: 1800, tag: "Bestseller", uom: "30 capsules", img: "products/biokidney.png",
    description: "A clinically formulated herbal blend that supports healthy kidney function and the body's natural detoxification, made with time-tested Unani ingredients." },
  { name: "UriClear", slug: "uriclear", category: "kidney-urinary", price: 1600, tag: "New", uom: "30 capsules", img: "products/uriclear.png",
    description: "Helps ease urinary discomfort and supports healthy uric-acid levels, soothing the joints and the urinary tract the natural way." },
  { name: "BrainHerb", slug: "brainherb", category: "brain-memory", price: 2000, tag: "Trending", uom: "30 capsules", img: "products/brainherb.png",
    description: "A herbal nootropic formula crafted to support memory, concentration and mental clarity for students and busy minds alike." },
  { name: "FemGlow+", slug: "femglow", category: "womens-health", price: 2200, tag: "Bestseller", uom: "30 capsules", img: "products/femglow.png",
    description: "A women's wellness and beauty formula offering holistic support for healthier skin, hormonal balance and everyday vitality." },
  { name: "Vitalarm", slug: "vitalarm", category: "vitality-wellness", price: 1500, tag: "New", uom: "30 capsules", img: "products/vitalarm.png",
    description: "A 100% natural daily tonic crafted to restore energy, stamina and overall vitality." },
];

const publicUrl = (path) => db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

async function ensureBucket() {
  const { data } = await db.storage.getBucket(BUCKET);
  if (!data) {
    const { error } = await db.storage.createBucket(BUCKET, { public: true });
    if (error) throw error;
    console.log(`bucket "${BUCKET}" created (public)`);
  } else {
    console.log(`bucket "${BUCKET}" exists`);
  }
}

async function uploadAll() {
  for (const u of uploads) {
    const bytes = readFileSync(`${ASSETS}/${u.file}`);
    const { error } = await db.storage.from(BUCKET).upload(u.path, bytes, { contentType: u.type, upsert: true });
    if (error) throw error;
    console.log(`uploaded ${u.path}`);
  }
}

async function reseed() {
  // Clear dependents that reference products, keep order history (product_id -> null).
  await db.from("cart_items").delete().neq("user_id", "00000000-0000-0000-0000-000000000000");
  await db.from("wishlist_items").delete().neq("user_id", "00000000-0000-0000-0000-000000000000");
  await db.from("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("order_items").update({ product_id: null }).not("product_id", "is", null);
  await db.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const { data: cats, error: cErr } = await db.from("categories").insert(categories).select("id, slug");
  if (cErr) throw cErr;
  const catId = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
  console.log(`inserted ${cats.length} categories`);

  const rows = products.map((p) => ({
    name: p.name, slug: p.slug, description: p.description, price: p.price,
    uom: p.uom, tag: p.tag, is_active: true, category_id: catId[p.category],
    image_url: publicUrl(p.img),
  }));
  const { data: prods, error: pErr } = await db.from("products").insert(rows).select("name, price");
  if (pErr) throw pErr;
  console.log(`inserted ${prods.length} products`);
}

await ensureBucket();
await uploadAll();
await reseed();
console.log("\nLogo URL:  ", publicUrl("brand/logo.jpeg"));
console.log("Banner URL:", publicUrl("brand/banner.jpeg"));
console.log("Done.");

// Uploads HEMC activity/event photos to Supabase Storage (media/activities).
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const ASSETS = "/home/awais/Desktop/MedicibesAssets";
const BUCKET = "media";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });

const items = [
  { file: "IMG-20161110-WA0032 (1).jpg.jpeg", path: "activities/seminar-bzu-multan.jpg" },
  { file: "IMG-20220123-WA0038.jpg.jpeg",     path: "activities/award-iub-2022.jpg" },
  { file: "FB_IMG_1426331406163.jpg.jpeg",    path: "activities/workshop-msds.jpg" },
  { file: "IMG20171011113411 (1).jpg.jpeg",   path: "activities/policy-consultation.jpg" },
  { file: "IMG20180717162912.jpg.jpeg",       path: "activities/faculty-iub.jpg" },
  { file: "IMG-20220621-WA0009.jpg.jpeg",     path: "activities/meeting-dignitaries.jpg" },
  { file: "FB_IMG_1553610872915.jpg.jpeg",    path: "activities/delegation-meeting.jpg" },
  { file: "IMG20250401140953.jpg.jpeg",       path: "activities/official-visit-2025.jpg" },
  { file: "3.jpg.jpeg",                       path: "activities/clinic-gathering.jpg" },
];

for (const it of items) {
  const bytes = readFileSync(`${ASSETS}/${it.file}`);
  const { error } = await db.storage.from(BUCKET).upload(it.path, bytes, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;
  console.log("uploaded", it.path);
}
console.log("Done:", items.length, "activity photos.");

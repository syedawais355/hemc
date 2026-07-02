import { handler, ok } from "@/lib/http";
import { listCategories } from "@/lib/repos/categories";

export const GET = handler(async () => ok(await listCategories()));

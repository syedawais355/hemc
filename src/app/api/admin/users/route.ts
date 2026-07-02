import { handler, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { listUsers } from "@/lib/repos/users";

export const GET = handler(async () => {
  await requireAdmin();
  return ok(await listUsers());
});

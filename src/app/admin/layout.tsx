import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { AdminNav } from "@/components/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAuth();
  if (!ctx) redirect("/login?next=/admin");
  if (ctx.profile.role !== "admin") redirect("/");

  return (
    <div className="admin">
      <AdminNav />
      <main className="admin__main">{children}</main>
    </div>
  );
}

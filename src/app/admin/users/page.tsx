"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client/api";
import { useStore } from "@/lib/client/store";
import { useToast } from "@/components/Toast";

interface AdminUser {
  id: string;
  email: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: "customer" | "admin";
  is_disabled: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const { user } = useStore();
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setUsers(await api.get<AdminUser[]>("/admin/users"));
    setLoading(false);
  };
  useEffect(() => { load().catch(() => setLoading(false)); }, []);

  const toggle = async (u: AdminUser) => {
    try { await api.patch(`/admin/users/${u.id}`, { is_disabled: !u.is_disabled }); toast(u.is_disabled ? "User enabled" : "User disabled"); await load(); }
    catch (err) { toast(err instanceof Error ? err.message : "Could not update"); }
  };

  const remove = async (u: AdminUser) => {
    if (!confirm(`Permanently delete ${u.email}? All their data is removed.`)) return;
    try { await api.del(`/admin/users/${u.id}`); toast("User deleted"); await load(); }
    catch (err) { toast(err instanceof Error ? err.message : "Could not delete"); }
  };

  return (
    <div>
      <div className="admin__head"><h1>Users</h1></div>
      {loading ? <p className="loading">Loading…</p> : (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => {
                const self = u.id === user?.id;
                return (
                  <tr key={u.id}>
                    <td>{u.first_name} {u.last_name}</td>
                    <td className="tag-dim">{u.email}</td>
                    <td className="tag-dim">{u.phone ?? "—"}</td>
                    <td>{u.role}</td>
                    <td>{u.is_disabled ? <span className="tag-dim">Disabled</span> : "Active"}</td>
                    <td className="tag-dim">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn--ghost btn--sm" disabled={self} onClick={() => toggle(u)}>
                          {u.is_disabled ? "Enable" : "Disable"}
                        </button>
                        <button className="btn btn--danger btn--sm" disabled={self} onClick={() => remove(u)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

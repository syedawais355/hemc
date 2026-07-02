"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/Modal";
import type { Category } from "@/lib/types";

type Draft = Partial<Category> & { id?: string };

export default function AdminCategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);

  const load = async () => {
    setLoading(true);
    setCategories(await api.get<Category[]>("/categories"));
    setLoading(false);
  };
  useEffect(() => { load().catch(() => setLoading(false)); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const body = { name: draft.name, description: draft.description };
    try {
      if (draft.id) await api.put(`/admin/categories/${draft.id}`, body);
      else await api.post("/admin/categories", body);
      toast(draft.id ? "Category updated" : "Category added");
      setDraft(null);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save");
    }
  };

  const remove = async (c: Category) => {
    if (!confirm(`Delete “${c.name}”? Products keep existing but become uncategorized.`)) return;
    try { await api.del(`/admin/categories/${c.id}`); toast("Category deleted"); await load(); }
    catch (err) { toast(err instanceof Error ? err.message : "Could not delete"); }
  };

  return (
    <div>
      <div className="admin__head">
        <h1>Categories</h1>
        <button className="btn btn--primary" onClick={() => setDraft({ name: "", description: "" })}>Add category</button>
      </div>

      {loading ? <p className="loading">Loading…</p> : (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Name</th><th>Slug</th><th>Description</th><th></th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td className="tag-dim">{c.slug}</td>
                  <td className="tag-dim">{c.description ?? "—"}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => setDraft({ ...c })}>Edit</button>
                      <button className="btn btn--danger btn--sm" onClick={() => remove(c)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {draft && (
        <Modal title={draft.id ? "Edit category" : "Add category"} onClose={() => setDraft(null)}>
          <form className="form" onSubmit={save}>
            <div className="field"><label>Name</label><input value={draft.name ?? ""} required onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div className="field"><label>Description</label><input value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setDraft(null)}>Cancel</button>
              <button className="btn btn--primary">{draft.id ? "Save changes" : "Add category"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/Modal";
import { money } from "@/lib/format";
import { productImage } from "@/lib/brand";
import type { Category, Product } from "@/lib/types";

type Draft = Partial<Product> & { id?: string };

const empty: Draft = { name: "", price: 0, uom: "", description: "", image_url: "", tag: "", category_id: "", is_active: true };

export default function AdminProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);

  const load = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([api.get<Product[]>("/admin/products"), api.get<Category[]>("/categories")]);
    setProducts(p); setCategories(c); setLoading(false);
  };
  useEffect(() => { load().catch(() => setLoading(false)); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const body = {
      name: draft.name, price: Number(draft.price), uom: draft.uom,
      description: draft.description, image_url: draft.image_url,
      tag: draft.tag, category_id: draft.category_id || null, is_active: draft.is_active,
    };
    try {
      if (draft.id) await api.put(`/admin/products/${draft.id}`, body);
      else await api.post("/admin/products", body);
      toast(draft.id ? "Product updated" : "Product added");
      setDraft(null);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save");
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    try { await api.del(`/admin/products/${p.id}`); toast("Product deleted"); await load(); }
    catch (err) { toast(err instanceof Error ? err.message : "Could not delete"); }
  };

  return (
    <div>
      <div className="admin__head">
        <h1>Products</h1>
        <button className="btn btn--primary" onClick={() => setDraft({ ...empty })}>Add product</button>
      </div>

      {loading ? <p className="loading">Loading…</p> : (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>UoM</th><th>Rating</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{productImage(p.image_url) ? <img className="thumb" src={productImage(p.image_url)!} alt="" /> : null}</td>
                  <td>{p.name}</td>
                  <td className="tag-dim">{p.category_name ?? "—"}</td>
                  <td>{money(p.price)}</td>
                  <td className="tag-dim">{p.uom}</td>
                  <td>{p.avg_rating} ({p.review_count})</td>
                  <td>{p.is_active ? "Active" : <span className="tag-dim">Hidden</span>}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => setDraft({ ...p })}>Edit</button>
                      <button className="btn btn--danger btn--sm" onClick={() => remove(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {draft && (
        <Modal title={draft.id ? "Edit product" : "Add product"} onClose={() => setDraft(null)}>
          <form className="form" onSubmit={save}>
            <div className="field"><label>Name</label><input value={draft.name ?? ""} required onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div className="field-row">
              <div className="field"><label>Price</label><input type="number" step="0.01" min="0" value={draft.price ?? 0} required onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} /></div>
              <div className="field"><label>Unit of measure</label><input value={draft.uom ?? ""} required placeholder="e.g. 90 capsules" onChange={(e) => setDraft({ ...draft, uom: e.target.value })} /></div>
            </div>
            <div className="field"><label>Description</label><textarea value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
            <div className="field"><label>Image URL</label><input value={draft.image_url ?? ""} placeholder="https://…" onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} /></div>
            <div className="field-row">
              <div className="field">
                <label>Category</label>
                <select value={draft.category_id ?? ""} onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}>
                  <option value="">Uncategorized</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field"><label>Tag</label><input value={draft.tag ?? ""} placeholder="Bestseller / New…" onChange={(e) => setDraft({ ...draft, tag: e.target.value })} /></div>
            </div>
            <div className="field">
              <label><input type="checkbox" checked={draft.is_active ?? true} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} /> Active (visible in store)</label>
            </div>
            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setDraft(null)}>Cancel</button>
              <button className="btn btn--primary">{draft.id ? "Save changes" : "Add product"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

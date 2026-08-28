import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Flower2, ChevronDown, Image as ImageIcon, AlertTriangle, Tag, Upload, Loader2, LogOut } from "lucide-react";

const SUPABASE_URL = "https://dfcdifrnymtnjazbexep.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY2RpZnJueW10bmphemJleGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2ODg0MTEsImV4cCI6MjEwMzI2NDQxMX0.Ci9a9q_BvEnjL-vnQ3yQ2IjS6rsQJQXCTNISCkDBQ30";
const REST = `${SUPABASE_URL}/rest/v1`;
const AUTH = `${SUPABASE_URL}/auth/v1`;
const STORAGE = `${SUPABASE_URL}/storage/v1`;

const CATEGORIES = ["Keychains", "Stuffed Toys", "Bags", "Hats", "Flowers", "Amigurumi", "Wearables", "Crochet Goodies"];
const ICONS = { Keychains: "🔑", "Stuffed Toys": "🧸", Bags: "👜", Hats: "🧢", Flowers: "🌸", Amigurumi: "🐰", Wearables: "🧣", "Crochet Goodies": "🎀" };
const SALE_OPTIONS = [
  { value: "", label: "No sale tag" },
  { value: "10", label: "10% OFF" },
  { value: "20", label: "20% OFF" },
  { value: "30", label: "30% OFF" },
  { value: "40", label: "40% OFF" },
  { value: "50", label: "50% OFF" },
  { value: "b1t1", label: "Buy 1 Take 1" },
];
const SALE_LABEL = Object.fromEntries(SALE_OPTIONS.map((o) => [o.value, o.label]));

function authHeaders(token) {
  return { apikey: ANON_KEY, Authorization: `Bearer ${token}` };
}

// Wraps fetch with real error surfacing so failed saves are never silent,
// and auto-logs-out on an expired/invalid session so the admin knows to log in again.
async function authedFetch(url, options, onAuthExpired) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    onAuthExpired?.();
    throw new Error("Your session expired. Please log in again.");
  }
  if (!res.ok) {
    let msg = `Save failed (error ${res.status}).`;
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch (_) {}
    throw new Error(msg);
  }
  return res;
}

function productImagePath(publicUrl) {
  return publicUrl.split("/object/public/product-images/")[1]?.split("?")[0];
}

// ---------- LOGIN SCREEN ----------
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`${AUTH}/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error_description || data.msg || "Invalid email or password.");
      onLogin(data.access_token);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#FFF9FB" }}>
      <div className="w-full max-w-xs rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #F4C0D1" }}>
        <div className="flex flex-col items-center mb-5">
          <img src="/logo.jpg" alt="Blueming Crochet" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }} className="mb-2" />
          <span className="font-medium text-sm" style={{ color: "#4B1528" }}>Blueming Crochet — Admin</span>
        </div>
        <label className="text-[11px] block mb-1" style={{ color: "#72243E" }}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs outline-none mb-3" style={{ border: "1px solid #F4C0D1" }} />
        <label className="text-[11px] block mb-1" style={{ color: "#72243E" }}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs outline-none mb-3" style={{ border: "1px solid #F4C0D1" }} />
        {error && <p className="text-[11px] mb-3" style={{ color: "#C0392B" }}>{error}</p>}
        <button onClick={submit} disabled={busy} className="w-full py-2.5 rounded-full font-medium text-xs flex items-center justify-center gap-2" style={{ background: "#D4537E", color: "#fff" }}>
          {busy && <Loader2 size={13} className="animate-spin" />} Log in
        </button>
      </div>
    </div>
  );
}

function Badge({ label }) {
  const colors = { Active: { bg: "#E6F3D8", text: "#3B6D11" }, Draft: { bg: "#FBEFD6", text: "#946A0C" } };
  const c = colors[label] || { bg: "#eee", text: "#555" };
  return <span className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ background: c.bg, color: c.text }}>{label}</span>;
}

function SaleBadge({ tag }) {
  if (!tag) return <span className="text-[11px]" style={{ color: "#C7A9B5" }}>—</span>;
  return (
    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 w-fit" style={{ background: "#FBEAF0", color: "#D4537E" }}>
      <Tag size={10} /> {SALE_LABEL[tag]}
    </span>
  );
}

function Thumb({ url }) {
  return url ? (
    <img src={url} alt="" style={{ width: 34, height: 34, borderRadius: 8, objectFit: "cover" }} />
  ) : (
    <div style={{ width: 34, height: 34, borderRadius: 8, background: "#F4C0D1" }} />
  );
}

export default function BluemingAdmin() {
  const [token, setToken] = useState(null);

  const [tab, setTab] = useState("products");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [content, setContent] = useState({});
  const [categoryImages, setCategoryImages] = useState({});
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showAdd, setShowAdd] = useState(false);
  const [addFiles, setAddFiles] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [editNewFiles, setEditNewFiles] = useState([]);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [editSection, setEditSection] = useState(null);
  const [form, setForm] = useState({ name: "", category: CATEGORIES[0], price: "", size: "", color: "", saleTag: "", description: "", note: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }

  const notify = (type, message) => {
    setToast({ type, message });
    window.clearTimeout(notify._t);
    notify._t = window.setTimeout(() => setToast(null), 3000);
  };

  const loadAll = async () => {
    setLoading(true);
    const headers = { apikey: ANON_KEY };
    const [prods, contentRows, catImgRows] = await Promise.all([
      fetch(`${REST}/products?select=*,product_images(id,image_url,sort_order)&order=created_at.desc`, { headers }).then((r) => r.json()),
      fetch(`${REST}/site_content?select=*`, { headers }).then((r) => r.json()),
      fetch(`${REST}/category_images?select=*`, { headers }).then((r) => r.json()),
    ]);
    (prods || []).forEach((p) => p.product_images?.sort((a, b) => a.sort_order - b.sort_order));
    setProducts(prods || []);
    const contentMap = {};
    (contentRows || []).forEach((row) => (contentMap[row.key] = row));
    setContent(contentMap);
    const catImgMap = {};
    (catImgRows || []).forEach((row) => (catImgMap[row.category] = row.image_url));
    setCategoryImages(catImgMap);
    setLoading(false);
  };

  useEffect(() => {
    if (token) loadAll();
  }, [token]);

  if (!token) return <LoginScreen onLogin={setToken} />;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FFF9FB" }}>
        <Loader2 size={22} className="animate-spin" color="#D4537E" />
      </div>
    );
  }

  const filteredProducts = products.filter((p) => categoryFilter === "All" || p.category === categoryFilter);
  const resetForm = () => { setForm({ name: "", category: CATEGORIES[0], price: "", size: "", color: "", saleTag: "", description: "", note: "" }); setAddFiles([]); };

  const uploadImagesFor = async (productId, files, startOrder) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `${productId}/${Date.now()}_${i}_${file.name}`;
      await fetch(`${STORAGE}/object/product-images/${path}`, {
        method: "POST",
        headers: { ...authHeaders(token), "Content-Type": file.type },
        body: file,
      });
      const publicUrl = `${STORAGE}/object/public/product-images/${path}`;
      await fetch(`${REST}/product_images`, {
        method: "POST",
        headers: { ...authHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, image_url: publicUrl, sort_order: startOrder + i }),
      });
    }
  };

  // ---------- PRODUCT CRUD ----------
  const saveNewProduct = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const res = await authedFetch(`${REST}/products`, {
        method: "POST",
        headers: { ...authHeaders(token), "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify({ name: form.name, category: form.category, price: Number(form.price), size: form.size, color: form.color, sale_tag: form.saleTag, description: form.description, note: form.note, status: "Active" }),
      }, () => setToken(null));
      const [created] = await res.json();
      await uploadImagesFor(created.id, addFiles, 0);
      setShowAdd(false);
      resetForm();
      await loadAll();
      notify("success", "Product added successfully!");
    } catch (e) {
      notify("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await authedFetch(`${REST}/products?id=eq.${editProduct.id}`, {
        method: "PATCH",
        headers: { ...authHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify({ name: editProduct.name, category: editProduct.category, price: Number(editProduct.price), status: editProduct.status, sale_tag: editProduct.sale_tag, description: editProduct.description, size: editProduct.size, color: editProduct.color, note: editProduct.note }),
      }, () => setToken(null));
      const startOrder = (editProduct.product_images?.length || 0);
      await uploadImagesFor(editProduct.id, editNewFiles, startOrder);
      setEditProduct(null);
      setEditNewFiles([]);
      await loadAll();
      notify("success", "Product updated successfully!");
    } catch (e) {
      notify("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteExistingImage = async (img) => {
    try {
      const path = productImagePath(img.image_url);
      if (path) await authedFetch(`${STORAGE}/object/product-images/${path}`, { method: "DELETE", headers: authHeaders(token) }, () => setToken(null));
      await authedFetch(`${REST}/product_images?id=eq.${img.id}`, { method: "DELETE", headers: authHeaders(token) }, () => setToken(null));
      setEditProduct((prev) => ({ ...prev, product_images: prev.product_images.filter((pi) => pi.id !== img.id) }));
      notify("success", "Photo removed.");
    } catch (e) {
      notify("error", e.message);
    }
  };

  const confirmDelete = async () => {
    setSaving(true);
    try {
      await authedFetch(`${REST}/products?id=eq.${deleteProduct.id}`, { method: "DELETE", headers: authHeaders(token) }, () => setToken(null));
      setDeleteProduct(null);
      await loadAll();
      notify("success", "Product deleted.");
    } catch (e) {
      notify("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------- CONTENT / BANNERS ----------
  const openEditSection = (type, key) => {
    if (type === "category") {
      const row = content[`category_${key}`];
      setEditSection({ type, key, dbKey: `category_${key}`, title: key, desc: row?.description || "", imageUrl: row?.image_url || null });
    } else {
      const row = content[type];
      setEditSection({ type, key: type, dbKey: type, title: row?.title || "", desc: row?.description || "", imageUrl: row?.image_url || null });
    }
  };

  const uploadBannerImage = async (file) => {
    if (!file || !editSection) return;
    try {
      const path = `${editSection.dbKey.replace(/\s+/g, "-")}.jpg`;
      await authedFetch(`${STORAGE}/object/banner-images/${path}`, {
        method: "POST",
        headers: { ...authHeaders(token), "Content-Type": file.type, "x-upsert": "true" },
        body: file,
      }, () => setToken(null));
      const publicUrl = `${STORAGE}/object/public/banner-images/${path}?t=${Date.now()}`;
      setEditSection((prev) => ({ ...prev, imageUrl: publicUrl }));
      notify("success", "Banner image uploaded! Click Save Changes to apply it.");
    } catch (e) {
      notify("error", e.message);
    }
  };

  const saveSection = async () => {
    setSaving(true);
    try {
      await authedFetch(`${REST}/site_content?key=eq.${encodeURIComponent(editSection.dbKey)}`, {
        method: "PATCH",
        headers: { ...authHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify({ title: editSection.title, description: editSection.desc, image_url: editSection.imageUrl }),
      }, () => setToken(null));
      setEditSection(null);
      await loadAll();
      notify("success", "Banner updated successfully!");
    } catch (e) {
      notify("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------- CATEGORY TILE IMAGE ----------
  const handleCategoryImageUpload = async (category, file) => {
    if (!file) return;
    try {
      const path = `${category.replace(/\s+/g, "-")}.jpg`;
      await authedFetch(`${STORAGE}/object/category-images/${path}`, {
        method: "POST",
        headers: { ...authHeaders(token), "Content-Type": file.type, "x-upsert": "true" },
        body: file,
      }, () => setToken(null));
      const publicUrl = `${STORAGE}/object/public/category-images/${path}?t=${Date.now()}`;
      await authedFetch(`${REST}/category_images?on_conflict=category`, {
        method: "POST",
        headers: { ...authHeaders(token), "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ category, image_url: publicUrl }),
      }, () => setToken(null));
      setCategoryImages((prev) => ({ ...prev, [category]: publicUrl }));
      notify("success", `${category} tile image updated!`);
    } catch (e) {
      notify("error", e.message);
    }
  };

  return (
    <div style={{ background: "#FFF9FB", minHeight: "100vh" }}>
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-full text-xs font-medium shadow-lg" style={{ background: toast.type === "success" ? "#3B6D11" : "#C0392B", color: "#fff", maxWidth: "90vw" }}>
          {toast.message}
        </div>
      )}
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-[60px] py-4" style={{ borderBottom: "1px solid #F4C0D1", background: "#fff" }}>
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Blueming Crochet" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
          <span className="font-medium text-sm" style={{ color: "#4B1528" }}>Blueming Crochet — Admin</span>
        </div>
        <button onClick={() => setToken(null)} className="flex items-center gap-1 text-xs" style={{ color: "#993556" }}>
          <LogOut size={13} /> Log out
        </button>
      </div>

      <div className="flex gap-2 px-4 sm:px-6 md:px-[60px] pt-4">
        {[{ id: "products", label: "Products" }, { id: "content", label: "Banners & Text" }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="px-4 py-2 rounded-full text-xs font-medium" style={{ background: tab === t.id ? "#D4537E" : "#FBEAF0", color: tab === t.id ? "#fff" : "#993556" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <div className="px-4 sm:px-6 md:px-[60px] py-4 max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <div className="relative">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="appearance-none text-xs rounded-lg pl-3 pr-7 py-2" style={{ border: "1px solid #F4C0D1", background: "#fff", color: "#4B1528" }}>
                <option>All</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-2.5 pointer-events-none" color="#993556" />
            </div>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg" style={{ background: "#D4537E", color: "#fff" }}>
              <Plus size={14} /> Add product
            </button>
          </div>

          <div className="rounded-xl overflow-x-auto" style={{ border: "1px solid #F4C0D1", background: "#fff" }}>
            <table className="w-full text-xs" style={{ minWidth: 560 }}>
              <thead>
                <tr style={{ background: "#FBEAF0", color: "#72243E" }}>
                  <th className="text-left font-medium py-2 px-3">Img</th>
                  <th className="text-left font-medium py-2 px-3">Name</th>
                  <th className="text-left font-medium py-2 px-3">Category</th>
                  <th className="text-left font-medium py-2 px-3">Price</th>
                  <th className="text-left font-medium py-2 px-3">Sale tag</th>
                  <th className="text-left font-medium py-2 px-3">Status</th>
                  <th className="text-left font-medium py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid #FBEAF0" }}>
                    <td className="py-2 px-3"><Thumb url={p.product_images?.[0]?.image_url} /></td>
                    <td className="py-2 px-3" style={{ color: "#4B1528" }}>{p.name}</td>
                    <td className="py-2 px-3" style={{ color: "#72243E" }}>{p.category}</td>
                    <td className="py-2 px-3" style={{ color: "#D4537E" }}>₱{p.price}</td>
                    <td className="py-2 px-3"><SaleBadge tag={p.sale_tag} /></td>
                    <td className="py-2 px-3"><Badge label={p.status} /></td>
                    <td className="py-2 px-3">
                      <button onClick={() => { setEditProduct({ ...p }); setEditNewFiles([]); }} className="mr-2"><Pencil size={14} color="#185FA5" /></button>
                      <button onClick={() => setDeleteProduct(p)}><Trash2 size={14} color="#C0392B" /></button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-6 text-xs" style={{ color: "#72243E" }}>No products in this category yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] mt-3" style={{ color: "#993556" }}>Tip: setting a sale tag automatically shows a tag on that product's card on the Customer Interface.</p>
        </div>
      )}

      {tab === "content" && (
        <div className="px-4 sm:px-6 md:px-[60px] py-4 max-w-3xl mx-auto">
          <p className="text-xs mb-4" style={{ color: "#72243E" }}>Edit the banner images and welcome text shown on the Customer Interface.</p>

          <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid #F4C0D1", background: "#fff" }}>
            <SectionRow label="Home welcome banner" preview={content.home?.description} onEdit={() => openEditSection("home")} />
            <SectionRow label="Shop page banner" preview={content.shop?.description} onEdit={() => openEditSection("shop")} />
            <SectionRow label="About page" preview={content.about?.description} onEdit={() => openEditSection("about")} />
            <SectionRow label="Contact page banner" preview={content.contact?.description} onEdit={() => openEditSection("contact")} />
          </div>

          <div className="text-xs font-medium mb-2" style={{ color: "#4B1528" }}>Category banners</div>
          <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid #F4C0D1", background: "#fff" }}>
            {CATEGORIES.map((c) => (
              <SectionRow key={c} label={c} preview={content[`category_${c}`]?.description} onEdit={() => openEditSection("category", c)} />
            ))}
          </div>

          <div className="text-xs font-medium mb-1" style={{ color: "#4B1528" }}>Category tile images (Home page)</div>
          <p className="text-[11px] mb-3" style={{ color: "#993556" }}>Upload a sample product photo for each category — replaces the icon on the Home page.</p>
          <div className="grid grid-cols-4 gap-3 rounded-xl p-3" style={{ border: "1px solid #F4C0D1", background: "#fff" }}>
            {CATEGORIES.map((c) => (
              <div key={c} className="flex flex-col items-center gap-1.5">
                <label className="relative flex items-center justify-center rounded-2xl cursor-pointer overflow-hidden" style={{ width: "100%", aspectRatio: "1", background: "#E6F1FB" }}>
                  {categoryImages[c] ? (
                    <img src={categoryImages[c]} alt={c} className="w-full h-full object-cover" />
                  ) : (
                    <span style={{ fontSize: 20 }}>{ICONS[c]}</span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100" style={{ background: "rgba(75,21,40,0.45)", transition: "opacity 0.15s" }}>
                    <Upload size={14} color="#fff" />
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCategoryImageUpload(c, e.target.files[0])} />
                </label>
                <span className="text-[10px] text-center" style={{ color: "#185FA5" }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAdd && (
        <Modal onClose={() => { setShowAdd(false); resetForm(); }}>
          <h3 className="font-medium text-sm mb-3" style={{ color: "#4B1528" }}>Add product</h3>

          {addFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {addFiles.map((f, idx) => (
                <div key={idx} className="relative" style={{ width: 56, height: 56 }}>
                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button onClick={() => setAddFiles(addFiles.filter((_, i) => i !== idx))} className="absolute -top-1.5 -right-1.5 rounded-full flex items-center justify-center" style={{ width: 16, height: 16, background: "#C0392B" }}>
                    <X size={10} color="#fff" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="rounded-xl flex flex-col items-center justify-center py-4 mb-3 text-xs cursor-pointer" style={{ border: "1.5px dashed #ED93B1", color: "#993556" }}>
            <ImageIcon size={20} className="mb-1" />
            {addFiles.length > 0 ? "Upload more photos" : "Upload images"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setAddFiles([...addFiles, ...Array.from(e.target.files)])} />
          </label>

          <Input label="Product name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <div className="mb-2.5">
            <label className="text-[11px] block mb-1" style={{ color: "#72243E" }}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none" style={{ border: "1px solid #F4C0D1" }} />
          </div>
          <SelectField label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
          <div className="grid grid-cols-2 gap-2">
            <Input label="Price" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
            <Input label="Size" value={form.size} onChange={(v) => setForm({ ...form, size: v })} />
          </div>
          <Input label="Color/variation" value={form.color} onChange={(v) => setForm({ ...form, color: v })} />
          <div className="mb-2.5">
            <label className="text-[11px] block mb-1" style={{ color: "#72243E" }}>Note (optional — e.g. "We accept customization for size and color")</label>
            <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none" style={{ border: "1px solid #F4C0D1" }} />
          </div>
          <SelectField label="Sale tag" value={form.saleTag} onChange={(v) => setForm({ ...form, saleTag: v })} options={SALE_OPTIONS} />
          <button onClick={saveNewProduct} disabled={saving} className="w-full py-2.5 rounded-full font-medium text-xs mt-2 flex items-center justify-center gap-2" style={{ background: "#D4537E", color: "#fff" }}>
            {saving && <Loader2 size={13} className="animate-spin" />} Save product
          </button>
        </Modal>
      )}

      {editProduct && (
        <Modal onClose={() => { setEditProduct(null); setEditNewFiles([]); }}>
          <h3 className="font-medium text-sm mb-3" style={{ color: "#4B1528" }}>Edit product</h3>

          {editProduct.product_images?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {editProduct.product_images.map((img) => (
                <div key={img.id} className="relative" style={{ width: 56, height: 56 }}>
                  <img src={img.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button onClick={() => deleteExistingImage(img)} className="absolute -top-1.5 -right-1.5 rounded-full flex items-center justify-center" style={{ width: 16, height: 16, background: "#C0392B" }}>
                    <X size={10} color="#fff" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {editNewFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {editNewFiles.map((f, idx) => (
                <div key={idx} className="relative" style={{ width: 56, height: 56 }}>
                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button onClick={() => setEditNewFiles(editNewFiles.filter((_, i) => i !== idx))} className="absolute -top-1.5 -right-1.5 rounded-full flex items-center justify-center" style={{ width: 16, height: 16, background: "#C0392B" }}>
                    <X size={10} color="#fff" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="rounded-xl flex flex-col items-center justify-center py-4 mb-3 text-xs cursor-pointer" style={{ border: "1.5px dashed #ED93B1", color: "#993556" }}>
            <ImageIcon size={20} className="mb-1" />
            Upload more photos
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setEditNewFiles([...editNewFiles, ...Array.from(e.target.files)])} />
          </label>

          <Input label="Product name" value={editProduct.name} onChange={(v) => setEditProduct({ ...editProduct, name: v })} />
          <div className="mb-2.5">
            <label className="text-[11px] block mb-1" style={{ color: "#72243E" }}>Description</label>
            <textarea value={editProduct.description || ""} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none" style={{ border: "1px solid #F4C0D1" }} />
          </div>
          <SelectField label="Category" value={editProduct.category} onChange={(v) => setEditProduct({ ...editProduct, category: v })} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
          <div className="grid grid-cols-2 gap-2">
            <Input label="Price" value={editProduct.price} onChange={(v) => setEditProduct({ ...editProduct, price: v })} />
            <SelectField label="Status" value={editProduct.status} onChange={(v) => setEditProduct({ ...editProduct, status: v })} options={[{ value: "Active", label: "Active" }, { value: "Draft", label: "Draft" }]} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Size" value={editProduct.size || ""} onChange={(v) => setEditProduct({ ...editProduct, size: v })} />
            <Input label="Color/variation" value={editProduct.color || ""} onChange={(v) => setEditProduct({ ...editProduct, color: v })} />
          </div>
          <div className="mb-2.5">
            <label className="text-[11px] block mb-1" style={{ color: "#72243E" }}>Note (optional — e.g. "We accept customization for size and color")</label>
            <textarea value={editProduct.note || ""} onChange={(e) => setEditProduct({ ...editProduct, note: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none" style={{ border: "1px solid #F4C0D1" }} />
          </div>
          <SelectField label="Sale tag" value={editProduct.sale_tag} onChange={(v) => setEditProduct({ ...editProduct, sale_tag: v })} options={SALE_OPTIONS} />
          <button onClick={saveEdit} disabled={saving} className="w-full py-2.5 rounded-full font-medium text-xs mt-2 flex items-center justify-center gap-2" style={{ background: "#D4537E", color: "#fff" }}>
            {saving && <Loader2 size={13} className="animate-spin" />} Save changes
          </button>
        </Modal>
      )}

      {deleteProduct && (
        <Modal onClose={() => setDeleteProduct(null)}>
          <div className="text-center">
            <AlertTriangle size={26} color="#C0392B" className="mx-auto mb-2" />
            <p className="text-sm mb-4" style={{ color: "#4B1528" }}>Are you sure you want to delete <b>{deleteProduct.name}</b>?</p>
            <button onClick={confirmDelete} disabled={saving} className="w-full py-2.5 rounded-full font-medium text-xs mb-2" style={{ background: "#C0392B", color: "#fff" }}>Delete</button>
            <button onClick={() => setDeleteProduct(null)} className="w-full py-2.5 rounded-full text-xs" style={{ border: "1px solid #ED93B1", color: "#993556" }}>Cancel</button>
          </div>
        </Modal>
      )}

      {editSection && (
        <Modal onClose={() => setEditSection(null)}>
          <h3 className="font-medium text-sm mb-3" style={{ color: "#4B1528" }}>
            Edit {editSection.type === "category" ? `${editSection.key} banner` : `${editSection.type} banner`}
          </h3>

          <label className="relative rounded-xl flex flex-col items-center justify-center py-4 mb-3 text-xs cursor-pointer overflow-hidden" style={{ border: "1.5px dashed #ED93B1", color: "#993556", minHeight: 90 }}>
            {editSection.imageUrl ? (
              <img src={editSection.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <ImageIcon size={20} className="mb-1" />
                Upload banner image
              </>
            )}
            {editSection.imageUrl && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(75,21,40,0.45)" }}>
                <span className="text-[11px] text-white flex items-center gap-1"><Upload size={12} /> Replace image</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadBannerImage(e.target.files[0])} />
          </label>

          {editSection.type !== "category" && (
            <Input label="Title" value={editSection.title} onChange={(v) => setEditSection({ ...editSection, title: v })} />
          )}
          <div className="mb-3">
            <label className="text-[11px] block mb-1" style={{ color: "#72243E" }}>Description</label>
            <textarea value={editSection.desc} onChange={(e) => setEditSection({ ...editSection, desc: e.target.value })} rows={4} className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none" style={{ border: "1px solid #F4C0D1" }} />
          </div>
          <button onClick={saveSection} disabled={saving} className="w-full py-2.5 rounded-full font-medium text-xs flex items-center justify-center gap-2" style={{ background: "#D4537E", color: "#fff" }}>
            {saving && <Loader2 size={13} className="animate-spin" />} Save changes
          </button>
        </Modal>
      )}
    </div>
  );
}

function SectionRow({ label, preview, onEdit }) {
  return (
    <div className="flex items-center justify-between px-3 py-3" style={{ borderTop: "1px solid #FBEAF0" }}>
      <div className="pr-3">
        <div className="text-xs font-medium" style={{ color: "#4B1528" }}>{label}</div>
        <div className="text-[11px] truncate" style={{ color: "#993556", maxWidth: 260 }}>{preview}</div>
      </div>
      <button onClick={onEdit} className="shrink-0"><Pencil size={14} color="#185FA5" /></button>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div className="mb-2.5">
      <label className="text-[11px] block mb-1" style={{ color: "#72243E" }}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ border: "1px solid #F4C0D1" }} />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="mb-2.5">
      <label className="text-[11px] block mb-1" style={{ color: "#72243E" }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ border: "1px solid #F4C0D1", background: "#fff" }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center px-6 z-50" style={{ background: "rgba(75,21,40,0.45)" }}>
      <div className="w-full max-w-xs rounded-2xl p-5 relative max-h-[85vh] overflow-y-auto" style={{ background: "#fff" }}>
        <button onClick={onClose} className="absolute top-3 right-3"><X size={16} color="#993556" /></button>
        {children}
      </div>
    </div>
  );
}

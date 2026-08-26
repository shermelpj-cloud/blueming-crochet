import React, { useState, useEffect } from "react";
import { Heart, ChevronRight, ChevronLeft, X, Instagram, Facebook, Flower2, Star, Loader2 } from "lucide-react";

const SUPABASE_URL = "https://dfcdifrnymtnjazbexep.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY2RpZnJueW10bmphemJleGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2ODg0MTEsImV4cCI6MjEwMzI2NDQxMX0.Ci9a9q_BvEnjL-vnQ3yQ2IjS6rsQJQXCTNISCkDBQ30";

const REST = `${SUPABASE_URL}/rest/v1`;
const HEADERS = { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` };

const CATEGORIES = ["Keychains", "Stuffed Toys", "Bags", "Hats", "Flowers", "Amigurumi", "Wearables", "Crochet Goodies"];
const ICONS = { Keychains: "🔑", "Stuffed Toys": "🧸", Bags: "👜", Hats: "🧢", Flowers: "🌸", Amigurumi: "🐰", Wearables: "🧣", "Crochet Goodies": "🎀" };
const SALE_LABELS = { "10": "10% OFF", "20": "20% OFF", "30": "30% OFF", "40": "40% OFF", "50": "50% OFF", b1t1: "Buy 1 Take 1" };

const REVIEWS_SHOP = [
  { name: "Anna R.", lang: "EN", text: "Super cute and well made! The stitching is so neat. Will definitely order again." },
  { name: "Mika D.", lang: "TL", text: "Ang ganda ng gawa, sulit na sulit! Mabilis din sumagot pag nagmessage ako sa Instagram." },
  { name: "Joyce T.", lang: "EN", text: "Ordered a keychain as a gift and my friend loved it. So soft and cute in person!" },
];
const REVIEWS_PRODUCT = [
  { name: "Bea M.", lang: "EN", text: "Exactly as pictured, even cuter in person. Packed very securely too!" },
  { name: "Rhea S.", lang: "TL", text: "Grabe ang lambot at gandang gawa, sulit sa price. Order ulit ako next month!" },
  { name: "Cathy L.", lang: "EN", text: "Fast response on Instagram and the item arrived well-packed. Thank you!" },
];

async function fetchJSON(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function SaleBadge({ tag }) {
  if (!tag) return null;
  return (
    <span className="absolute top-2 left-2 text-[10px] font-medium px-2 py-1 rounded-full z-10" style={{ background: "#D4537E", color: "#fff" }}>
      {SALE_LABELS[tag]}
    </span>
  );
}

function ProductThumb({ product, size = "100%" }) {
  const img = product?.product_images?.[0]?.image_url;
  return (
    <div className="relative" style={{ width: size, aspectRatio: "1" }}>
      {img ? (
        <img src={img} alt={product.name} className="w-full h-full object-cover" style={{ borderRadius: 16 }} />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "#F4C0D1", borderRadius: 16 }} className="flex items-center justify-center">
          <Heart size={28} color="#993556" fill="#993556" opacity={0.25} />
        </div>
      )}
      <SaleBadge tag={product?.sale_tag} />
    </div>
  );
}

function ReviewCarousel({ reviews }) {
  const [i, setI] = useState(0);
  const r = reviews[i];
  return (
    <div className="rounded-2xl p-4 text-center" style={{ background: "#FBEAF0" }}>
      <div className="flex justify-center gap-0.5 mb-2">
        {Array.from({ length: 5 }).map((_, s) => <Star key={s} size={12} color="#D4537E" fill="#D4537E" />)}
      </div>
      <p className="text-xs italic mb-2" style={{ color: "#4B1528", minHeight: 40 }}>"{r.text}"</p>
      <div className="text-[11px] font-medium" style={{ color: "#993556" }}>
        {r.name} <span style={{ color: "#185FA5" }}>· {r.lang === "TL" ? "🇵🇭 Tagalog" : "🇬🇧 English"}</span>
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {reviews.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)} style={{ width: 6, height: 6, borderRadius: 999, background: idx === i ? "#D4537E" : "#ED93B1" }} />
        ))}
      </div>
    </div>
  );
}

function PageShell({ children, onBack, title }) {
  return (
    <div className="min-h-screen" style={{ background: "#FFF9FB" }}>
      {onBack && (
        <div className="sticky top-0 z-20 flex items-center gap-2 px-4 md:px-8 py-3" style={{ background: "#FFF9FB", borderBottom: "1px solid #F4C0D1" }}>
          <div className="max-w-6xl mx-auto w-full flex items-center gap-2">
            <button onClick={onBack} className="flex items-center justify-center rounded-full shrink-0" style={{ width: 32, height: 32, background: "#FBEAF0" }}>
              <ChevronLeft size={18} color="#993556" />
            </button>
            <span className="font-medium text-sm" style={{ color: "#4B1528" }}>{title}</span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2" style={{ background: "#FFF9FB" }}>
      <Loader2 size={22} className="animate-spin" color="#D4537E" />
      <span className="text-xs" style={{ color: "#993556" }}>Loading Blueming Crochet…</span>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 px-6 text-center" style={{ background: "#FFF9FB" }}>
      <span className="text-sm font-medium" style={{ color: "#4B1528" }}>Couldn't load the shop.</span>
      <span className="text-xs" style={{ color: "#993556" }}>{message}</span>
    </div>
  );
}

export default function BluemingCrochet() {
  const [page, setPage] = useState("home");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [orderModal, setOrderModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [content, setContent] = useState({});
  const [categoryImages, setCategoryImages] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const [prods, contentRows, catImgRows] = await Promise.all([
          fetchJSON(`${REST}/products?select=*,product_images(image_url,sort_order)&status=eq.Active&order=created_at.desc`),
          fetchJSON(`${REST}/site_content?select=*`),
          fetchJSON(`${REST}/category_images?select=*`),
        ]);
        prods.forEach((p) => p.product_images?.sort((a, b) => a.sort_order - b.sort_order));
        setProducts(prods);
        const contentMap = {};
        contentRows.forEach((row) => (contentMap[row.key] = row));
        setContent(contentMap);
        const catImgMap = {};
        catImgRows.forEach((row) => (catImgMap[row.category] = row.image_url));
        setCategoryImages(catImgMap);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  const goProduct = (p) => {
    setActiveProduct(p);
    setImgIdx(0);
    setPage("product");
  };

  const home = content.home || { title: "Welcome to Blueming Crochet!", description: "" };
  const shop = content.shop || { title: "All Collections", description: "" };
  const catContent = (cat) => content[`category_${cat}`]?.description || "";

  // ---------- HOME ----------
  if (page === "home") {
    return (
      <div style={{ background: "#FFF9FB", minHeight: "100vh" }}>
        <div className="text-center px-6 pt-14 pb-10 md:pt-20 md:pb-16" style={{ background: "linear-gradient(180deg,#F4C0D1 0%,#FBEAF0 100%)" }}>
          <div className="mx-auto flex items-center justify-center rounded-full mb-3 md:mb-4" style={{ width: 72, height: 72, background: "#fff" }}>
            <Flower2 size={34} color="#D4537E" />
          </div>
          <h1 className="font-medium" style={{ fontSize: 28, color: "#4B1528", letterSpacing: 0.5 }}>Blueming Crochet</h1>
        </div>

        <div className="max-w-xl mx-auto px-6 py-8 md:py-12 text-center">
          <h2 className="font-medium mb-3" style={{ fontSize: 20, color: "#4B1528" }}>{home.title}</h2>
          <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: "#72243E" }}>{home.description}</p>
          <button onClick={() => setPage("shop")} className="w-full sm:w-auto sm:px-16 py-3 rounded-full font-medium text-sm" style={{ background: "#D4537E", color: "#fff" }}>
            Shop now
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-6 pb-14">
          <p className="text-xs md:text-sm font-medium mb-3 md:text-center" style={{ color: "#72243E" }}>Browse by category</p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-5">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => { setActiveCategory(c); setPage("category"); }} className="flex flex-col items-center gap-1.5">
                <div className="flex items-center justify-center rounded-2xl overflow-hidden" style={{ width: "100%", aspectRatio: "1", background: "#E6F1FB" }}>
                  {categoryImages[c] ? (
                    <img src={categoryImages[c]} alt={c} className="w-full h-full object-cover" />
                  ) : (
                    <span style={{ fontSize: 20 }}>{ICONS[c]}</span>
                  )}
                </div>
                <span className="text-[10px] md:text-xs text-center" style={{ color: "#185FA5" }}>{c}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- SHOP ----------
  if (page === "shop") {
    return (
      <PageShell onBack={() => setPage("home")} title="Shop">
        <div className="max-w-6xl mx-auto">
          <div className="mx-4 md:mx-8 md:max-w-2xl md:mx-auto mt-4 rounded-2xl p-5 md:p-8 text-center" style={{ background: "#FBEAF0" }}>
            <div style={{ fontSize: 26 }}>🧶</div>
            <h2 className="font-medium mt-1 mb-2" style={{ color: "#4B1528" }}>{shop.title}</h2>
            <p className="text-xs md:text-sm leading-relaxed" style={{ color: "#72243E" }}>{shop.description}</p>
          </div>

          <div className="px-4 md:px-8 py-4 md:py-8">
            {CATEGORIES.map((cat) => {
              const catProducts = products.filter((p) => p.category === cat);
              if (catProducts.length === 0) return null;
              return (
                <div key={cat} className="mb-7 md:mb-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm md:text-base" style={{ color: "#4B1528" }}>{ICONS[cat]} {cat}</h3>
                    <button onClick={() => { setActiveCategory(cat); setPage("category"); }} className="flex items-center gap-1 text-xs" style={{ color: "#D4537E" }}>
                      View more <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
                    {catProducts.slice(0, 5).map((p) => (
                      <button key={p.id} onClick={() => goProduct(p)} className="text-left rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #F4C0D1" }}>
                        <ProductThumb product={p} />
                        <div className="p-2">
                          <div className="text-xs font-medium truncate" style={{ color: "#4B1528" }}>{p.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: "#D4537E" }}>₱{p.price}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {products.length === 0 && (
              <p className="text-center text-xs py-8" style={{ color: "#993556" }}>No products yet — add some from the Admin Panel!</p>
            )}
          </div>

          <div className="px-4 md:px-8 pb-10 max-w-md mx-auto">
            <h3 className="font-medium text-sm mb-3 text-center" style={{ color: "#4B1528" }}>What our customers say</h3>
            <ReviewCarousel reviews={REVIEWS_SHOP} />
          </div>
        </div>
      </PageShell>
    );
  }

  // ---------- CATEGORY ----------
  if (page === "category") {
    const catProducts = products.filter((p) => p.category === activeCategory);
    return (
      <PageShell onBack={() => setPage("shop")} title={activeCategory}>
        <div className="max-w-6xl mx-auto">
          <div className="mx-4 md:mx-auto md:max-w-2xl mt-4 rounded-2xl p-5 md:p-8 text-center" style={{ background: "#FBEAF0" }}>
            <div style={{ fontSize: 28 }}>{ICONS[activeCategory]}</div>
            <h2 className="font-medium mt-1 mb-2" style={{ color: "#4B1528" }}>{activeCategory}</h2>
            <p className="text-xs md:text-sm leading-relaxed" style={{ color: "#72243E" }}>{catContent(activeCategory)}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 px-4 md:px-8 py-5 md:py-8">
            {catProducts.map((p) => (
              <button key={p.id} onClick={() => goProduct(p)} className="text-left rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #F4C0D1" }}>
                <ProductThumb product={p} />
                <div className="p-2.5">
                  <div className="text-xs font-medium" style={{ color: "#4B1528" }}>{p.name}</div>
                  <div className="text-xs mt-1" style={{ color: "#D4537E" }}>₱{p.price}</div>
                </div>
              </button>
            ))}
            {catProducts.length === 0 && (
              <p className="col-span-2 md:col-span-4 text-center text-xs py-8" style={{ color: "#993556" }}>No products in this category yet.</p>
            )}
          </div>
        </div>
      </PageShell>
    );
  }

  // ---------- PRODUCT DETAIL ----------
  if (page === "product" && activeProduct) {
    const p = activeProduct;
    const images = p.product_images?.length ? p.product_images : [{ image_url: null }];
    return (
      <PageShell onBack={() => setPage("category")} title={p.category}>
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-8">
          <div className="md:flex md:gap-10">
            <div className="relative rounded-2xl overflow-hidden mb-4 md:mb-0 md:w-1/2 md:shrink-0" style={{ border: "1px solid #F4C0D1" }}>
              {images[imgIdx]?.image_url ? (
                <img src={images[imgIdx].image_url} alt={p.name} className="w-full" style={{ aspectRatio: "1", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", aspectRatio: "1", background: "#F4C0D1" }} className="flex items-center justify-center">
                  <Heart size={28} color="#993556" fill="#993556" opacity={0.25} />
                </div>
              )}
              <SaleBadge tag={p.sale_tag} />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx((imgIdx - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-1" style={{ background: "#fff" }}>
                    <ChevronLeft size={16} color="#993556" />
                  </button>
                  <button onClick={() => setImgIdx((imgIdx + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1" style={{ background: "#fff" }}>
                    <ChevronRight size={16} color="#993556" />
                  </button>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {images.map((_, i) => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: 999, background: i === imgIdx ? "#D4537E" : "#fff" }} />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="md:w-1/2 md:flex md:flex-col">
              <h2 className="font-medium mb-1" style={{ fontSize: 19, color: "#4B1528" }}>{p.name}</h2>
              <p className="text-sm mb-2" style={{ color: "#72243E" }}>{p.description}</p>
              <div className="font-medium mb-4" style={{ fontSize: 20, color: "#D4537E" }}>₱{p.price}</div>
              <button onClick={() => setOrderModal(true)} className="w-full md:w-auto md:px-12 py-3 rounded-full font-medium text-sm mb-6" style={{ background: "#D4537E", color: "#fff" }}>
                Order now
              </button>

              <h3 className="font-medium text-sm mb-3" style={{ color: "#4B1528" }}>Customer reviews</h3>
              <ReviewCarousel reviews={REVIEWS_PRODUCT} />
            </div>
          </div>
        </div>

        {orderModal && (
          <Modal onClose={() => setOrderModal(false)}>
            <div className="text-center">
              <p className="text-sm mb-4" style={{ color: "#72243E" }}>
                To order, please message us directly on our Instagram or Facebook Page so we can confirm your order, preferred design, colors, size, and other details.
              </p>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-full py-2.5 rounded-full font-medium text-sm mb-2 flex items-center justify-center gap-2" style={{ background: "#D4537E", color: "#fff" }}>
                <Instagram size={16} /> Message us on Instagram
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-full py-2.5 rounded-full font-medium text-sm flex items-center justify-center gap-2" style={{ border: "1px solid #ED93B1", color: "#185FA5" }}>
                <Facebook size={16} /> Message us on Facebook
              </a>
            </div>
          </Modal>
        )}
      </PageShell>
    );
  }

  return null;
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center px-6 z-50" style={{ background: "rgba(75,21,40,0.45)" }}>
      <div className="w-full max-w-xs rounded-2xl p-5 relative" style={{ background: "#fff" }}>
        <button onClick={onClose} className="absolute top-3 right-3">
          <X size={16} color="#993556" />
        </button>
        {children}
      </div>
    </div>
  );
}

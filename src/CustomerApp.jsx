import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { Heart, ChevronRight, ChevronLeft, X, Instagram, Facebook, Star, Loader2, Menu, Mail } from "lucide-react";

const SUPABASE_URL = "https://dfcdifrnymtnjazbexep.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY2RpZnJueW10bmphemJleGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2ODg0MTEsImV4cCI6MjEwMzI2NDQxMX0.Ci9a9q_BvEnjL-vnQ3yQ2IjS6rsQJQXCTNISCkDBQ30";
const REST = `${SUPABASE_URL}/rest/v1`;
const HEADERS = { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` };

const FACEBOOK_URL = "https://www.facebook.com/hndmdbyshem.ph";
const INSTAGRAM_URL = "https://www.instagram.com/bluemingcrochet";

const EMAILJS_SERVICE_ID = "service_6a0524d";
const EMAILJS_TEMPLATE_ID = "template_vonkxmh";
const EMAILJS_PUBLIC_KEY = "kJ6-f5MeUK8ouDHzx";

const CATEGORIES = ["Keychains", "Stuffed Toys", "Bags", "Hats", "Flowers", "Amigurumi", "Wearables", "Crochet Goodies"];
const ICONS = { Keychains: "🔑", "Stuffed Toys": "🧸", Bags: "👜", Hats: "🧢", Flowers: "🌸", Amigurumi: "🐰", Wearables: "🧣", "Crochet Goodies": "🎀" };
const SALE_LABELS = { "10": "10% OFF", "20": "20% OFF", "30": "30% OFF", "40": "40% OFF", "50": "50% OFF", b1t1: "Buy 1 Take 1" };

const WRAP = "w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-[60px]";
const HEADER_H = 64;
const LOGO = "/logo.jpg";

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

const ABOUT_HIGHLIGHTS = [
  { icon: "🧶", label: "100% Handmade" },
  { icon: "👩🏻‍🎨", label: "Solo-made, by one maker" },
  { icon: "📅", label: "Crafting since 2020" },
  { icon: "✨", label: "Custom orders welcome" },
];

const DEFAULT_ABOUT_TEXT =
  "Blueming Crochet started in 2020 as a one-woman labor of love. Every piece you see here — from tiny keychains to made-to-order amigurumi — is designed, crocheted, and packed by hand, by me, one stitch at a time. What began as a hobby slowly grew into a small business built on care, patience, and a lot of yarn. I take pride in being a solo maker: every order gets my full attention, and every customized piece is made exactly the way you imagined it. Thank you for supporting a small, handmade business — it means the world to me.";

async function fetchJSON(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

const DataContext = createContext(null);
const useData = () => useContext(DataContext);

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

function StarRating({ size = 11 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} color="#FFA41C" fill="#FFA41C" />
      ))}
    </div>
  );
}

function ReviewCard({ r }) {
  return (
    <div className="rounded-2xl p-6 md:p-8 text-center h-full flex flex-col justify-center" style={{ background: "#FBEAF0" }}>
      <div className="flex justify-center gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, s) => <Star key={s} size={14} color="#D4537E" fill="#D4537E" />)}
      </div>
      <p className="text-sm md:text-base italic mb-3" style={{ color: "#4B1528" }}>"{r.text}"</p>
      <div className="text-xs md:text-sm font-medium" style={{ color: "#993556" }}>
        {r.name} <span style={{ color: "#185FA5" }}>· {r.lang === "TL" ? "🇵🇭 Tagalog" : "🇬🇧 English"}</span>
      </div>
    </div>
  );
}

// Auto-advancing carousel for small/medium screens; all-in-one-row grid for desktop
function ReviewsSection({ reviews }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setI((prev) => (prev + 1) % reviews.length), 4500);
    return () => clearInterval(timer);
  }, [reviews.length]);

  return (
    <>
      <div className="md:hidden max-w-2xl mx-auto">
        <ReviewCard r={reviews[i]} />
        <div className="flex justify-center gap-1.5 mt-4">
          {reviews.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} style={{ width: 6, height: 6, borderRadius: 999, background: idx === i ? "#D4537E" : "#ED93B1" }} />
          ))}
        </div>
      </div>
      <div className="hidden md:grid md:grid-cols-3 gap-5">
        {reviews.map((r, idx) => <ReviewCard key={idx} r={r} />)}
      </div>
    </>
  );
}

// Reviews layout for the narrow product modal column: carousel on mobile/tablet,
// stacked rows (not side-by-side columns) on desktop since the modal column is narrow
function ModalReviews({ reviews }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setI((prev) => (prev + 1) % reviews.length), 4500);
    return () => clearInterval(timer);
  }, [reviews.length]);

  return (
    <>
      <div className="md:hidden">
        <ReviewCard r={reviews[i]} />
        <div className="flex justify-center gap-1.5 mt-4">
          {reviews.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} style={{ width: 6, height: 6, borderRadius: 999, background: idx === i ? "#D4537E" : "#ED93B1" }} />
          ))}
        </div>
      </div>
      <div className="hidden md:flex md:flex-col gap-3">
        {reviews.map((r, idx) => <ReviewCard key={idx} r={r} />)}
      </div>
    </>
  );
}

function PageBanner({ imageUrl, emoji, title, desc, showTitle = true }) {
  return (
    <div className="w-full mb-2">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="w-full block" style={{ maxHeight: 400, objectFit: "contain", margin: "0 auto" }} />
      ) : (
        <div className="w-full text-center py-8 md:py-10" style={{ background: "#FBEAF0" }}>
          <div style={{ fontSize: 30 }}>{emoji}</div>
        </div>
      )}
      <div className={`${WRAP} pt-6 pb-3 text-center`}>
        <div className="max-w-3xl mx-auto">
          {showTitle && <h2 className="font-medium mb-3" style={{ fontSize: 20, color: "#4B1528" }}>{title}</h2>}
          <p className="text-sm md:text-base leading-relaxed" style={{ color: "#72243E" }}>{desc}</p>
        </div>
      </div>
    </div>
  );
}

// ---------- HEADER / NAV ----------
function Header() {
  const [open, setOpen] = useState(false);
  const linkStyle = ({ isActive }) => ({ color: isActive ? "#D4537E" : "#4B1528", fontWeight: 500 });
  return (
    <header className="sticky top-0 z-30" style={{ background: "#FFF9FB", borderBottom: "1px solid #F4C0D1", height: HEADER_H }}>
      <div className={`${WRAP} flex items-center justify-between h-full`}>
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <img src={LOGO} alt="Blueming Crochet" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
          <span className="font-medium text-sm" style={{ color: "#4B1528" }}>Blueming Crochet</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <NavLink to="/" end style={linkStyle}>Home</NavLink>
          <NavLink to="/about" style={linkStyle}>About</NavLink>
          <NavLink to="/products" style={linkStyle}>Products</NavLink>
          <NavLink to="/contact" style={linkStyle}>Contact Us</NavLink>
        </nav>
        <button className="md:hidden flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: "#FBEAF0" }} onClick={() => setOpen(!open)}>
          <Menu size={16} color="#993556" />
        </button>
      </div>
      {open && (
        <div className="md:hidden flex flex-col gap-3 px-4 pb-4 text-sm" style={{ background: "#FFF9FB", borderBottom: "1px solid #F4C0D1" }}>
          <NavLink to="/" end style={linkStyle} onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/about" style={linkStyle} onClick={() => setOpen(false)}>About</NavLink>
          <NavLink to="/products" style={linkStyle} onClick={() => setOpen(false)}>Products</NavLink>
          <NavLink to="/contact" style={linkStyle} onClick={() => setOpen(false)}>Contact Us</NavLink>
        </div>
      )}
    </header>
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

// ---------- HOME ----------
function HomePage() {
  const { content, categoryImages } = useData();
  const navigate = useNavigate();
  const home = content.home || { title: "Welcome to Blueming Crochet!", description: "" };

  return (
    <div>
      <section>
        {home.image_url ? (
          <img src={home.image_url} alt="Blueming Crochet" className="w-full block" style={{ maxHeight: 420, objectFit: "contain", margin: "0 auto" }} />
        ) : (
          <div className="text-center px-6 pt-10 pb-8 md:pt-14 md:pb-10" style={{ background: "linear-gradient(180deg,#F4C0D1 0%,#FBEAF0 100%)" }}>
            <img src={LOGO} alt="Blueming Crochet" className="mx-auto mb-3" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "3px solid #fff" }} />
            <h1 className="font-medium" style={{ fontSize: 26, color: "#4B1528", letterSpacing: 0.5 }}>Blueming Crochet</h1>
          </div>
        )}

        <div className={`${WRAP} py-7 md:py-10 text-center`}>
          <div className="max-w-3xl mx-auto">
            <h2 className="font-medium mb-4" style={{ fontSize: 22, color: "#4B1528" }}>{home.title}</h2>
            <p className="text-base md:text-lg leading-relaxed mb-7" style={{ color: "#72243E" }}>{home.description}</p>
            <button onClick={() => navigate("/products")} className="w-full sm:w-auto sm:px-16 py-3.5 rounded-full font-medium text-sm" style={{ background: "#D4537E", color: "#fff" }}>
              Shop now
            </button>
          </div>
        </div>
      </section>

      <section className={`${WRAP} py-10 md:py-14`} style={{ borderTop: "1px solid #F4C0D1" }}>
        <p className="text-sm md:text-base font-medium mb-5 md:text-center" style={{ color: "#72243E" }}>Browse by category</p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-5">
          {CATEGORIES.map((c) => (
            <Link key={c} to={`/products/${encodeURIComponent(c)}`} className="flex flex-col items-center gap-1.5">
              <div className="flex items-center justify-center rounded-2xl overflow-hidden" style={{ width: "100%", aspectRatio: "1", background: "#E6F1FB" }}>
                {categoryImages[c] ? (
                  <img src={categoryImages[c]} alt={c} className="w-full h-full object-cover" />
                ) : (
                  <span style={{ fontSize: 20 }}>{ICONS[c]}</span>
                )}
              </div>
              <span className="text-[10px] md:text-xs text-center" style={{ color: "#185FA5" }}>{c}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// ---------- PRODUCTS (ALL) ----------
function ProductsPage() {
  const { content, products, openProduct } = useData();
  const shop = content.shop || { title: "All Collections", description: "" };

  return (
    <div style={{ minHeight: "100vh", background: "#FFF9FB" }}>
      <PageBanner imageUrl={shop.image_url} emoji="🧶" title={shop.title} desc={shop.description} />

      <div className={`${WRAP} py-4 md:py-8`}>
        {CATEGORIES.map((cat) => {
          const catProducts = products.filter((p) => p.category === cat);
          if (catProducts.length === 0) return null;
          return (
            <div key={cat} className="mb-7 md:mb-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm md:text-base" style={{ color: "#4B1528" }}>{ICONS[cat]} {cat}</h3>
                <Link to={`/products/${encodeURIComponent(cat)}`} className="flex items-center gap-1 text-xs" style={{ color: "#D4537E" }}>
                  View more <ChevronRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
                {catProducts.slice(0, 5).map((p) => (
                  <button key={p.id} onClick={() => openProduct(p.id)} className="text-left rounded-2xl overflow-hidden w-full" style={{ background: "#fff", border: "1px solid #F4C0D1" }}>
                    <ProductThumb product={p} />
                    <div className="p-2">
                      <div className="text-xs font-medium truncate" style={{ color: "#4B1528" }}>{p.name}</div>
                      <StarRating size={10} />
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

      <div className={`${WRAP} pb-14`}>
        <h3 className="font-medium text-sm mb-5 text-center" style={{ color: "#4B1528" }}>What our customers say</h3>
        <ReviewsSection reviews={REVIEWS_SHOP} />
      </div>
    </div>
  );
}

// ---------- CATEGORY ----------
function CategoryPage() {
  const { category } = useParams();
  const { content, products, openProduct } = useData();
  const catProducts = products.filter((p) => p.category === category);
  const row = content[`category_${category}`] || {};

  return (
    <div style={{ minHeight: "100vh", background: "#FFF9FB" }}>
      <PageBanner imageUrl={row.image_url} emoji={ICONS[category] || "🧶"} title={category} desc={row.description} />
      <div className={`${WRAP} py-5 md:py-8`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {catProducts.map((p) => (
            <button key={p.id} onClick={() => openProduct(p.id)} className="text-left rounded-2xl overflow-hidden w-full" style={{ background: "#fff", border: "1px solid #F4C0D1" }}>
              <ProductThumb product={p} />
              <div className="p-2.5">
                <div className="text-xs font-medium" style={{ color: "#4B1528" }}>{p.name}</div>
                <StarRating size={10} />
                <div className="text-xs mt-1" style={{ color: "#D4537E" }}>₱{p.price}</div>
              </div>
            </button>
          ))}
          {catProducts.length === 0 && (
            <p className="col-span-2 md:col-span-4 text-center text-xs py-8" style={{ color: "#993556" }}>No products in this category yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- PRODUCT DETAILS MODAL ----------
function ProductModal({ id, onClose }) {
  const { products } = useData();
  const [imgIdx, setImgIdx] = useState(0);
  const [orderModal, setOrderModal] = useState(false);

  useEffect(() => {
    setImgIdx(0);
    setOrderModal(false);
  }, [id]);

  const imagesLen = products.find((pr) => String(pr.id) === String(id))?.product_images?.length || 0;
  useEffect(() => {
    if (imagesLen <= 1) return;
    const timer = setInterval(() => setImgIdx((i) => (i + 1) % imagesLen), 4000);
    return () => clearInterval(timer);
  }, [imagesLen, id]);

  if (!id) return null;
  const p = products.find((pr) => String(pr.id) === String(id));
  if (!p) return null;
  const images = p.product_images?.length ? p.product_images : [{ image_url: null }];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6" style={{ background: "rgba(75,21,40,0.55)" }} onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl relative overflow-y-auto" style={{ background: "#fff", maxHeight: "92vh" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: "#FBEAF0" }}>
          <X size={16} color="#993556" />
        </button>

        <div className="p-5 md:p-8 md:flex md:gap-8 md:items-start">
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
                <button onClick={() => setImgIdx((imgIdx - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center" style={{ background: "#fff", width: 32, height: 32, boxShadow: "0 2px 8px rgba(75,21,40,0.25)" }}>
                  <ChevronLeft size={18} color="#993556" />
                </button>
                <button onClick={() => setImgIdx((imgIdx + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center" style={{ background: "#fff", width: 32, height: 32, boxShadow: "0 2px 8px rgba(75,21,40,0.25)" }}>
                  <ChevronRight size={18} color="#993556" />
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
            <h2 className="font-medium mb-1 pr-8" style={{ fontSize: 19, color: "#4B1528" }}>{p.name}</h2>
            <StarRating size={13} />
            <p className="text-sm mb-2 mt-1.5" style={{ color: "#72243E" }}>{p.description}</p>
            <div className="font-medium mb-4" style={{ fontSize: 20, color: "#D4537E" }}>₱{p.price}</div>
            <button onClick={() => setOrderModal(true)} className="w-full md:w-auto md:px-12 py-3 rounded-full font-medium text-sm mb-6" style={{ background: "#D4537E", color: "#fff" }}>
              Order now
            </button>

            <h3 className="font-medium text-sm mb-3" style={{ color: "#4B1528" }}>Customer reviews</h3>
            <ModalReviews reviews={REVIEWS_PRODUCT} />
          </div>
        </div>
      </div>

      {orderModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6" style={{ background: "rgba(75,21,40,0.55)" }} onClick={() => setOrderModal(false)}>
          <div className="w-full max-w-xs rounded-2xl p-5 relative" style={{ background: "#fff" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOrderModal(false)} className="absolute top-3 right-3">
              <X size={16} color="#993556" />
            </button>
            <div className="text-center">
              <p className="text-sm mb-4" style={{ color: "#72243E" }}>
                To order, please message us directly on our Instagram or Facebook Page so we can confirm your order, preferred design, colors, size, and other details.
              </p>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="w-full py-2.5 rounded-full font-medium text-sm mb-2 flex items-center justify-center gap-2" style={{ background: "#D4537E", color: "#fff" }}>
                <Instagram size={16} /> Message us on Instagram
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="w-full py-2.5 rounded-full font-medium text-sm flex items-center justify-center gap-2" style={{ border: "1px solid #ED93B1", color: "#185FA5" }}>
                <Facebook size={16} /> Message us on Facebook
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- ABOUT ----------
function AboutPage() {
  const { content } = useData();
  const about = content.about || {};

  return (
    <div style={{ minHeight: "100vh", background: "#FFF9FB" }}>
      <PageBanner imageUrl={about.image_url} emoji="🌷" title={about.title || "About Blueming Crochet"} desc={about.description || DEFAULT_ABOUT_TEXT} />
      <div className={`${WRAP} pb-16`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {ABOUT_HIGHLIGHTS.map((h) => (
            <div key={h.label} className="rounded-2xl p-5 md:p-6 text-center" style={{ background: "#FBEAF0" }}>
              <div style={{ fontSize: 26 }}>{h.icon}</div>
              <div className="text-xs md:text-sm font-medium mt-2" style={{ color: "#4B1528" }}>{h.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- CONTACT ----------
function FieldInput({ label, ...props }) {
  return (
    <div className="mb-4">
      <label className="text-xs font-medium block mb-1.5" style={{ color: "#4B1528" }}>{label}</label>
      <input {...props} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid #F4C0D1" }} />
    </div>
  );
}

function ContactPage() {
  const [form, setForm] = useState({ full_name: "", address: "", phone: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.message) return;
    setStatus("sending");
    try {
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: { ...form, subject: "New Customer Inquiry — Blueming Crochet" },
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setStatus("sent");
      setForm({ full_name: "", address: "", phone: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FFF9FB" }}>
      <div className={`${WRAP} py-10 md:py-16`}>
        <div className="max-w-xl mx-auto rounded-2xl p-6 md:p-10" style={{ background: "#fff", border: "1px solid #F4C0D1" }}>
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center rounded-full mb-3" style={{ width: 52, height: 52, background: "#FBEAF0" }}>
              <Mail size={22} color="#D4537E" />
            </div>
            <h2 className="font-medium mb-2" style={{ fontSize: 19, color: "#4B1528" }}>Contact Us</h2>
            <p className="text-xs md:text-sm" style={{ color: "#72243E" }}>Have a question or want a custom piece? Send us a message and we'll get back to you soon.</p>
          </div>
          <form onSubmit={submit}>
            <FieldInput label="Full Name" value={form.full_name} onChange={update("full_name")} required />
            <FieldInput label="Address" value={form.address} onChange={update("address")} />
            <FieldInput label="Phone Number" value={form.phone} onChange={update("phone")} />
            <FieldInput label="Email" type="email" value={form.email} onChange={update("email")} required />
            <div className="mb-4">
              <label className="text-xs font-medium block mb-1.5" style={{ color: "#4B1528" }}>Message</label>
              <textarea value={form.message} onChange={update("message")} required rows={4} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ border: "1px solid #F4C0D1" }} />
            </div>
            <button type="submit" disabled={status === "sending"} className="w-full py-3 rounded-full font-medium text-sm flex items-center justify-center gap-2" style={{ background: "#D4537E", color: "#fff" }}>
              {status === "sending" && <Loader2 size={14} className="animate-spin" />} Send Message
            </button>
            {status === "sent" && <p className="text-xs text-center mt-3" style={{ color: "#3B6D11" }}>Thank you! We'll get back to you soon.</p>}
            {status === "error" && <p className="text-xs text-center mt-3" style={{ color: "#C0392B" }}>Something went wrong. Please try again or message us on Instagram/Facebook.</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

// ---------- ROOT ----------
export default function BluemingCrochet() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [content, setContent] = useState({});
  const [categoryImages, setCategoryImages] = useState({});
  const [activeProductId, setActiveProductId] = useState(null);

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

  return (
    <DataContext.Provider value={{ products, content, categoryImages, openProduct: setActiveProductId }}>
      <BrowserRouter>
        <div style={{ background: "#FFF9FB" }}>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:category" element={<CategoryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
          <ProductModal id={activeProductId} onClose={() => setActiveProductId(null)} />
        </div>
      </BrowserRouter>
    </DataContext.Provider>
  );
}

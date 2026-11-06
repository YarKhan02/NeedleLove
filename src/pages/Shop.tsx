import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Minus, Plus, Check } from "lucide-react";
import { Filters, ProductGrid } from "../components/Products";
import { useStore } from "../hooks/useStore";
import { money } from "../types";
export function Shop() {
  const { store } = useStore(),
    [params, setParams] = useSearchParams(),
    category = params.get("category") || "",
    [count, setCount] = useState(12);
  useEffect(() => setCount(12), [category]);
  if (!store) return null;
  const selected = store.categories.find((c) => c.slug === category),
    products = store.products.filter(
      (p) => !category || p.category_id === selected?.id,
    );
  return (
    <main className="section catalog">
      <p className="eyebrow">SOMETHING LOVELY STARTS HERE</p>
      <h1>
        The <em>collection.</em>
      </h1>
      <p>Handmade happiness, for you and your favorite people.</p>
      <Filters
        value={category}
        onChange={(c) => setParams(c ? { category: c } : {})}
      />
      <div className="catalog-meta">
        <span>{products.length} little joys</span>
        <span>Demo collection · {store.config.currency}</span>
      </div>
      <ProductGrid products={products.slice(0, count)} />
      {products.length > count && (
        <div className="center-action">
          <button className="button" onClick={() => setCount((n) => n + 12)}>
            Discover more
          </button>
        </div>
      )}
    </main>
  );
}
export function ProductDetail() {
  const { slug } = useParams(),
    { store, add } = useStore(),
    [quantity, setQuantity] = useState(1);
  useEffect(() => setQuantity(1), [slug]);
  const p = store?.products.find((p) => p.slug === slug);
  useEffect(() => {
    if (p) document.title = `${p.name} — NeedleLove`;
    return () => {
      document.title = "NeedleLove — Where Every Stitch Blooms";
    };
  }, [p]);
  if (!p)
    return (
      <main className="section empty-state">
        <h1>This bloom isn’t here.</h1>
        <Link to="/shop">Return to collection</Link>
      </main>
    );
  return (
    <main className="section">
      <div className="breadcrumb">
        <Link to="/shop">The collection</Link> / {p.name}
      </div>
      <div className="product-detail">
        <div className="detail-image">
          <img src={p.primary_image} alt={p.name} />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">
            {store?.categories.find((c) => c.id === p.category_id)?.name}
          </p>
          <h1>{p.name}</h1>
          <p className="detail-price">
            {money(p.price)} <small>{p.currency}</small>
          </p>
          <p>{p.description}</p>
          <p className="stock">
            <Check size={15} />
            {p.stock_quantity
              ? `${p.stock_quantity} available in demo inventory`
              : "Currently out of stock"}
          </p>
          <div className="purchase-row">
            <div className="quantity">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span>{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(p.stock_quantity, q + 1))
                }
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              className="button"
              disabled={!p.stock_quantity}
              onClick={() => add(p, quantity)}
            >
              Add to bag <ArrowUpRight size={18} />
            </button>
          </div>
          <dl>
            {Object.entries(JSON.parse(p.specifications || "{}")).map(
              ([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{String(v)}</dd>
                </div>
              ),
            )}
          </dl>
          <p className="demo-note">
            Original AI-generated demonstration imagery. Actual product
            specifications to be supplied by the merchant.
          </p>
        </div>
      </div>
    </main>
  );
}

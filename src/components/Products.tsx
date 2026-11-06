import { Petal } from "./Flower";
import { Link } from "react-router-dom";
import { Plus, ArrowUpRight } from "lucide-react";
import { type Product, money } from "../types";
import { useStore } from "../hooks/useStore";
export function ProductCard({
  product: p,
  bloom = false,
}: {
  product: Product;
  bloom?: boolean;
}) {
  const { add, store } = useStore();
  return (
    <article className="product-card">
      <div
        className="product-image"
        data-bloom-target={bloom ? "true" : undefined}
      >
        <Link to={`/product/${p.slug}`} aria-label={`View ${p.name}`}>
          <img
            src={p.primary_image}
            alt={p.name}
            loading="lazy"
            width="600"
            height="650"
            onError={(e) => {
              e.currentTarget.src = "/assets/bouquet.png";
            }}
          />
        </Link>
        {bloom && (
          <div className="arrival-bloom" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div className={`petal petal-${i}`} key={i}>
                <Petal index={i} />
              </div>
            ))}
            <span />
          </div>
        )}
        <span className="product-badge">
          {!p.stock_quantity
            ? "Sold out"
            : p.is_best_seller
              ? "Much loved"
              : "Made with love"}
        </span>
        <button
          className="quick-add"
          aria-label={`Add ${p.name} to bag`}
          disabled={!p.stock_quantity}
          onClick={() => add(p)}
        >
          <Plus size={19} />
        </button>
      </div>
      <div className="product-meta">
        <span>
          {store?.categories.find((c) => c.id === p.category_id)?.name}
        </span>
        <Link to={`/product/${p.slug}`}>
          <h3>{p.name}</h3>
        </Link>
        <p>{money(p.price)}</p>
      </div>
    </article>
  );
}
export function ProductGrid({
  products,
  bloom = false,
}: {
  products: Product[];
  bloom?: boolean;
}) {
  return products.length ? (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} bloom={bloom} />
      ))}
    </div>
  ) : (
    <div className="empty-state">
      <h3>A little something is on its way.</h3>
      <p>No products in this collection yet. Explore another category.</p>
    </div>
  );
}
export function Filters({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) {
  const { store } = useStore();
  return (
    <div className="filters" aria-label="Filter by category">
      <button
        className={!value ? "active" : ""}
        onClick={() => onChange("")}
        aria-pressed={!value}
      >
        All
      </button>
      {store?.categories.map((c) => (
        <button
          key={c.id}
          className={value === c.slug ? "active" : ""}
          onClick={() => onChange(c.slug)}
          aria-pressed={value === c.slug}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
export function TextLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link className="text-link" to={to}>
      {children}
      <ArrowUpRight size={17} />
    </Link>
  );
}

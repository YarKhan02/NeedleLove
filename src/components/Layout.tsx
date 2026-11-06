import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Menu,
  X,
  ArrowUpRight,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { useStore } from "../hooks/useStore";
import { money } from "../types";
export function Header() {
  const { cart, setDrawer } = useStore(),
    [menu, setMenu] = useState(false),
    location = useLocation();
  useEffect(() => {
    setMenu(false);
  }, [location]);
  return (
    <header className="site-header">
      <Link className="wordmark" to="/">
        needle<span>love</span>
        <i>✳</i>
      </Link>
      <nav className={menu ? "open" : ""} aria-label="Main navigation">
        <Link to="/shop">The collection</Link>
        <Link to="/#bestsellers">Best sellers</Link>
        <Link to="/#reviews">Kind words</Link>
      </nav>
      <div className="header-actions">
        <span className="handmade-note">A little handmade happiness</span>
        <button
          className="bag-button"
          onClick={() => setDrawer(true)}
          aria-label={`Open bag, ${cart.reduce((n, c) => n + c.quantity, 0)} items`}
        >
          <ShoppingBag size={21} />
          <span>{cart.reduce((n, c) => n + c.quantity, 0)}</span>
        </button>
        <button
          className="mobile-toggle"
          onClick={() => setMenu(!menu)}
          aria-label="Toggle navigation"
          aria-expanded={menu}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <Link className="wordmark" to="/">
            needle<span>love</span>
            <i>✳</i>
          </Link>
          <p>
            Little things. Lovingly made.
            <br />A whole lot of heart.
          </p>
        </div>
        <div>
          <h3>Find your little joy</h3>
          <Link to="/shop">
            Shop the collection <ArrowUpRight size={14} />
          </Link>
          <Link to="/#bestsellers">Best sellers</Link>
          <Link to="/cart">Your shopping bag</Link>
        </div>
        <div>
          <h3>Here to help</h3>
          <Link to="/info/shipping">Shipping & delivery</Link>
          <Link to="/info/returns">Returns & care</Link>
          <Link to="/info/contact">Contact & social</Link>
        </div>
        <div className="footer-signature">
          Made slowly.
          <br />
          <em>Loved forever.</em>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} NeedleLove · Demo boutique</span>
        <div>
          <Link to="/info/privacy">Privacy policy</Link>
          <Link to="/admin">Studio admin</Link>
        </div>
        <span>Made with a little love ♡</span>
      </div>
    </footer>
  );
}
export function CartLines() {
  const { cart, store, update } = useStore();
  return (
    <div className="cart-lines">
      {cart.map((line) => {
        const p = store?.products.find((p) => p.id === line.product_id);
        if (!p)
          return (
            <div key={line.product_id}>
              This item is no longer available.
              <button onClick={() => update(line.product_id, 0)}>Remove</button>
            </div>
          );
        return (
          <div className="cart-line" key={p.id}>
            <img src={p.primary_image} alt={p.name} />
            <div>
              <Link to={`/product/${p.slug}`}>{p.name}</Link>
              <p>{money(p.price)}</p>
              <div className="quantity">
                <button
                  aria-label={`Decrease ${p.name}`}
                  onClick={() => update(p.id, line.quantity - 1)}
                >
                  <Minus size={13} />
                </button>
                <span>{line.quantity}</span>
                <button
                  aria-label={`Increase ${p.name}`}
                  onClick={() => update(p.id, line.quantity + 1)}
                >
                  <Plus size={13} />
                </button>
              </div>
              {line.quantity > p.stock_quantity && (
                <p className="error">Only {p.stock_quantity} available.</p>
              )}
            </div>
            <button
              aria-label={`Remove ${p.name}`}
              onClick={() => update(p.id, 0)}
            >
              <Trash2 size={17} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
export function CartDrawer() {
  const { drawer, setDrawer, cart, store } = useStore(),
    ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (drawer) {
      d?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      d?.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);
  const total = cart.reduce(
    (n, c) =>
      n +
      (store?.products.find((p) => p.id === c.product_id)?.price || 0) *
        c.quantity,
    0,
  );
  return (
    <dialog
      ref={ref}
      className="cart-drawer"
      onCancel={() => setDrawer(false)}
      onClick={(e) => {
        if (e.target === ref.current) setDrawer(false);
      }}
    >
      <div className="drawer-inner">
        <div className="drawer-heading">
          <h2>Your little joys</h2>
          <button onClick={() => setDrawer(false)} aria-label="Close bag">
            <X />
          </button>
        </div>
        {cart.length ? (
          <>
            <CartLines />
            <div className="cart-total">
              <span>Subtotal</span>
              <strong>{money(total)}</strong>
            </div>
            <p className="muted">Shipping calculated at checkout.</p>
            <Link
              className="button"
              to="/checkout"
              onClick={() => setDrawer(false)}
            >
              Continue to checkout <ArrowUpRight size={18} />
            </Link>
            <Link
              className="text-link"
              to="/cart"
              onClick={() => setDrawer(false)}
            >
              View shopping bag
            </Link>
          </>
        ) : (
          <div className="empty-state">
            <ShoppingBag size={38} />
            <h3>A little room for something lovely.</h3>
            <Link
              className="button"
              to="/shop"
              onClick={() => setDrawer(false)}
            >
              Explore collection
            </Link>
          </div>
        )}
      </div>
    </dialog>
  );
}
export function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(
        () =>
          document
            .getElementById(hash.slice(1))
            ?.scrollIntoView({ behavior: "smooth" }),
        120,
      );
    } else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowUpRight, Check, ShoppingBag } from "lucide-react";
import { CartLines } from "../components/Layout";
import { useStore } from "../hooks/useStore";
import { api, money } from "../types";
export function Cart() {
  const { cart, store } = useStore();
  const subtotal = cart.reduce(
    (n, c) =>
      n +
      (store?.products.find((p) => p.id === c.product_id)?.price || 0) *
        c.quantity,
    0,
  );
  return (
    <main className="section cart-page">
      <p className="eyebrow">YOUR HANDPICKED HAPPINESS</p>
      <h1>
        Your shopping <em>bag.</em>
      </h1>
      {cart.length ? (
        <div className="checkout-layout">
          <CartLines />
          <aside className="summary">
            <h2>A little summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <p>Shipping calculated at checkout.</p>
            <Link to="/checkout" className="button">
              Continue to checkout <ArrowUpRight size={17} />
            </Link>
            <Link to="/shop" className="text-link">
              Keep exploring
            </Link>
          </aside>
        </div>
      ) : (
        <div className="empty-state">
          <ShoppingBag />
          <h2>Your next little joy is waiting.</h2>
          <Link to="/shop" className="button">
            Explore the collection
          </Link>
        </div>
      )}
    </main>
  );
}
export function Checkout() {
  const { cart, store, setCart, refresh } = useStore(),
    navigate = useNavigate(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  if (!store) return null;
  const subtotal = cart.reduce(
    (n, c) =>
      n +
      (store.products.find((p) => p.id === c.product_id)?.price || 0) *
        c.quantity,
    0,
  );
  if (!cart.length)
    return (
      <main className="section empty-state">
        <h1>Your bag is empty.</h1>
        <Link className="button" to="/shop">
          Find something lovely
        </Link>
      </main>
    );
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const customer = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const order = await api("/orders", {
        customer,
        items: cart,
        payment_method: "cod",
      });
      setCart([]);
      refresh();
      navigate("/order-confirmation", { state: order });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="section">
      <p className="eyebrow">ONE LAST LITTLE STEP</p>
      <h1>
        Yours, <em>with love.</em>
      </h1>
      {store.config.demo && (
        <p className="notice">
          Demo checkout: this records a test order. No payment is taken and
          nothing will be shipped.
        </p>
      )}
      <form onSubmit={submit} className="checkout-layout">
        <div className="checkout-form">
          <h2>Delivery details</h2>
          {[
            ["name", "Full name", "name"],
            ["email", "Email address", "email"],
            ["phone", "Phone number", "tel"],
            ["address", "Delivery address", "street-address"],
            ["city", "City / region", "address-level2"],
            ["postal", "Postal code (optional)", "postal-code"],
          ].map(([name, label, auto]) => (
            <label key={name}>
              {label}
              <input
                name={name}
                autoComplete={auto}
                type={
                  name === "email" ? "email" : name === "phone" ? "tel" : "text"
                }
                required={name !== "postal"}
                minLength={name !== "postal" ? 2 : undefined}
                maxLength={500}
              />
            </label>
          ))}
          <h2>Payment</h2>
          {store.config.codEnabled ? (
            <label className="payment-option">
              <input type="radio" checked readOnly /> Cash on delivery{" "}
              <small>Pay when your parcel arrives. No online charge.</small>
            </label>
          ) : (
            <p>No payment method is configured. Please return later.</p>
          )}
        </div>
        <aside className="summary">
          <h2>Your little joys</h2>
          {cart.map((c) => {
            const p = store.products.find((p) => p.id === c.product_id);
            return (
              <div className="summary-row" key={c.product_id}>
                <span>
                  {p?.name || "Unavailable item"} × {c.quantity}
                </span>
                <strong>{money((p?.price || 0) * c.quantity)}</strong>
              </div>
            );
          })}
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <strong>{money(store.config.shipping)}</strong>
          </div>
          <div className="summary-row total">
            <span>Total · {store.config.currency}</span>
            <strong>{money(subtotal + store.config.shipping)}</strong>
          </div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button
            disabled={busy || !store.config.codEnabled}
            className="button"
          >
            {busy
              ? "Recording your order…"
              : store.config.demo
                ? "Place demo order"
                : "Place order"}
            <ArrowUpRight size={17} />
          </button>
          <p className="muted">
            Inventory and totals are checked securely before your order is
            recorded.
          </p>
        </aside>
      </form>
    </main>
  );
}
export function OrderConfirmation() {
  const { state } = useLocation();
  return (
    <main className="section confirmation">
      <Check size={40} />
      <p className="eyebrow">
        {state?.is_demo ? "DEMO ORDER RECORDED" : "ORDER UPDATE"}
      </p>
      <h1>{state ? "A little joy, on the list." : "Your order details."}</h1>
      {state ? (
        <>
          <p>Reference: {state.id}</p>
          <p>
            Total: {money(state.total)} · Payment: unpaid (cash on delivery)
          </p>
          {state.is_demo && (
            <p>
              This is a test order. No payment or fulfillment will take place.
            </p>
          )}
        </>
      ) : (
        <p>
          For your privacy, order information is only shown immediately after
          checkout.
        </p>
      )}
      <Link to="/shop" className="button">
        Back to the collection
      </Link>
    </main>
  );
}

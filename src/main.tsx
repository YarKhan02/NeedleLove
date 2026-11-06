import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useLocation,
} from "react-router-dom";
import { StoreProvider, useStore } from "./hooks/useStore";
import { Header, Footer, CartDrawer, ScrollManager } from "./components/Layout";
import { Home } from "./pages/Home";
import { Shop, ProductDetail } from "./pages/Shop";
import { Cart, Checkout, OrderConfirmation } from "./pages/Checkout";
import { Admin } from "./pages/Admin";
import { initSmoothScroll } from "./smooth";
import "lenis/dist/lenis.css";
import "./styles/globals.css";
function Info() {
  const { page } = useParams();
  const copy: Record<string, [string, string]> = {
    shipping: [
      "Shipping & delivery",
      "This is a demonstration store. Checkout shows a sample PKR 250 delivery charge. No demonstration orders are shipped. The merchant must configure delivery areas, charges and timelines before accepting live orders.",
    ],
    returns: [
      "Returns & care",
      "Return eligibility and care instructions will be published by the merchant before launch. Demo products are not available for purchase or return.",
    ],
    privacy: [
      "Your privacy",
      "This local demo stores your bag in this browser and order details in a private server-side SQLite database. Only an authenticated administrator can read order details. Do not enter sensitive personal information in a demo order. No payment card data is collected.",
    ],
    contact: [
      "Let’s stay in touch",
      "The studio’s email address and social profiles have not been configured yet. This demo intentionally does not publish invented contact details.",
    ],
  };
  const content = copy[page || ""] || [
    "Page not found",
    "Let’s find you something lovely instead.",
  ];
  return (
    <main className="section info">
      <p className="eyebrow">THE LITTLE DETAILS</p>
      <h1>{content[0]}</h1>
      <p>{content[1]}</p>
      <Link className="button" to="/shop">
        Explore collection
      </Link>
    </main>
  );
}
function Seo() {
  const loc = useLocation();
  useEffect(() => {
    const names: Record<string, string> = {
      "/": "Where Every Stitch Blooms",
      "/shop": "The Collection",
      "/cart": "Your Shopping Bag",
      "/checkout": "Checkout",
      "/admin": "Studio Admin",
    };
    if (!loc.pathname.startsWith("/product/"))
      document.title = `${names[loc.pathname] || "Handmade Happiness"} — NeedleLove`;
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = window.location.origin + loc.pathname + loc.search;
  }, [loc]);
  return null;
}
function App() {
  const { store, error, toast, refresh } = useStore();
  useEffect(initSmoothScroll, []);
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Seo />
      <ScrollManager />
      <Header />
      <div id="main-content">
        {error ? (
          <main className="section empty-state">
            <h1>The studio is taking a moment.</h1>
            <p>{error}</p>
            <button onClick={refresh} className="button">
              Try again
            </button>
          </main>
        ) : !store ? (
          <div className="initial-loading">
            needle<span>love</span>
            <p>Gathering little joys…</p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/info/:page" element={<Info />} />
            <Route path="*" element={<Info />} />
          </Routes>
        )}
      </div>
      <Footer />
      <CartDrawer />
      <div
        role="status"
        aria-live="polite"
        className={`toast ${toast ? "visible" : ""}`}
      >
        {toast}
      </div>
    </>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StoreProvider>
      <App />
    </StoreProvider>
  </BrowserRouter>,
);

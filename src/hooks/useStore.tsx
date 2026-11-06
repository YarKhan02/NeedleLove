import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, configureCurrency, type Store, type Product } from "../types";
type Line = { product_id: number; quantity: number };
const Context = createContext<ReturnType<typeof useStateValue> | null>(null);
function useStateValue() {
  const [store, setStore] = useState<Store | null>(null),
    [error, setError] = useState(""),
    [drawer, setDrawer] = useState(false),
    [toast, setToast] = useState("");
  const [cart, setCart] = useState<Line[]>(() => {
    try {
      const v = JSON.parse(localStorage.getItem("needlelove-cart") || "[]");
      return Array.isArray(v)
        ? v.filter(
            (x) =>
              Number.isInteger(x.product_id) &&
              Number.isInteger(x.quantity) &&
              x.quantity > 0,
          )
        : [];
    } catch {
      return [];
    }
  });
  const refresh = () =>
    api("/store")
      .then((data: Store) => {
        configureCurrency(data.config.currency);
        setStore(data);
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    refresh();
  }, []);
  useEffect(() => {
    localStorage.setItem("needlelove-cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const add = (p: Product, quantity = 1) => {
    const old = cart.find((x) => x.product_id === p.id)?.quantity || 0;
    if (old + quantity > p.stock_quantity) {
      setToast("You’ve reached the available stock.");
      return;
    }
    setCart((c) => [
      ...c.filter((x) => x.product_id !== p.id),
      { product_id: p.id, quantity: old + quantity },
    ]);
    setToast(`${p.name} added to your bag`);
  };
  const update = (id: number, q: number) => {
    const p = store?.products.find((p) => p.id === id);
    if (q > 0 && p && q > p.stock_quantity) {
      setToast("This quantity exceeds available stock.");
      return;
    }
    setCart((c) =>
      q <= 0
        ? c.filter((x) => x.product_id !== id)
        : c.map((x) => (x.product_id === id ? { ...x, quantity: q } : x)),
    );
  };
  return {
    store,
    error,
    refresh,
    cart,
    setCart,
    add,
    update,
    drawer,
    setDrawer,
    toast,
    setToast,
  };
}
export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <Context.Provider value={useStateValue()}>{children}</Context.Provider>
  );
}
export function useStore() {
  return useContext(Context)!;
}

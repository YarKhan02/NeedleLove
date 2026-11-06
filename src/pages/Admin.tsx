import { useEffect, useState } from "react";
import { api, type Product, type Category, type Review, money } from "../types";
import { useStore } from "../hooks/useStore";
type AdminData = {
  products: Product[];
  categories: Category[];
  reviews: Review[];
  orders: {
    id: string;
    customer_details: string;
    delivery_address: string;
    total: number;
    payment_status: string;
    is_demo: number;
  }[];
};
export function Admin() {
  const { refresh } = useStore(),
    [data, setData] = useState<AdminData | null>(null),
    [message, setMessage] = useState(""),
    [tab, setTab] = useState("Products"),
    [editing, setEditing] = useState<Partial<Product> | null>(null),
    [category, setCategory] = useState<Partial<Category> | null>(null),
    [best, setBest] = useState<number[]>([]);
  const load = () =>
    api("/admin/data").then((d) => {
      setData(d);
      setBest(
        d.products
          .filter((p: Product) => p.is_best_seller)
          .sort(
            (a: Product, b: Product) => a.bestseller_order - b.bestseller_order,
          )
          .map((p: Product) => p.id),
      );
    });
  useEffect(() => {
    load().catch(() => {});
  }, []);
  async function save(path: string, body: unknown) {
    try {
      await api(path, body);
      await load();
      refresh();
      setMessage("Saved successfully.");
      setEditing(null);
      setCategory(null);
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  if (!data)
    return (
      <main className="section admin-login">
        <p className="eyebrow">BEHIND THE STITCHES</p>
        <h1>The studio.</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api("/admin/login", {
                password: new FormData(e.currentTarget).get("password"),
              });
              await load();
              setMessage("");
            } catch (e) {
              setMessage((e as Error).message);
            }
          }}
        >
          <label>
            Admin password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </label>
          <button className="button">Enter studio</button>
          <p role="status">{message}</p>
          <p className="muted">
            Set ADMIN_PASSWORD in the server environment to enable access. No
            public default credentials.
          </p>
        </form>
      </main>
    );
  return (
    <main className="section admin">
      <div className="section-heading">
        <div>
          <p className="eyebrow">NEEDLELOVE ADMINISTRATION</p>
          <h1>The studio.</h1>
        </div>
        <button
          className="button button-outline"
          onClick={async () => {
            await api("/admin/logout", {});
            setData(null);
          }}
        >
          Sign out
        </button>
      </div>
      <div className="filters">
        {["Products", "Categories", "Best sellers", "Reviews", "Orders"].map(
          (t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={tab === t ? "active" : ""}
            >
              {t}
            </button>
          ),
        )}
      </div>
      <p role="status">{message}</p>
      {tab === "Products" && (
        <>
          <button
            className="button"
            onClick={() =>
              setEditing({
                name: "",
                slug: "",
                description: "",
                price: 0,
                stock_quantity: 0,
                category_id: data.categories[0]?.id,
                primary_image: "/assets/bouquet.png",
                is_active: 1,
              })
            }
          >
            Add product
          </button>
          {editing && (
            <form
              className="editor"
              onSubmit={(e) => {
                e.preventDefault();
                save("/admin/products", editing);
              }}
            >
              <h2>{editing.id ? "Edit product" : "New product"}</h2>
              {(
                [
                  "name",
                  "slug",
                  "description",
                  "price",
                  "stock_quantity",
                  "primary_image",
                ] as const
              ).map((k) => (
                <label key={k}>
                  {k.replaceAll("_", " ")}
                  <input
                    required
                    value={editing[k] ?? ""}
                    type={
                      ["price", "stock_quantity"].includes(k)
                        ? "number"
                        : "text"
                    }
                    min="0"
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        [k]: ["price", "stock_quantity"].includes(k)
                          ? Number(e.target.value)
                          : e.target.value,
                      })
                    }
                  />
                </label>
              ))}
              <label>
                Category
                <select
                  value={editing.category_id}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      category_id: Number(e.target.value),
                    })
                  }
                >
                  {data.categories.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Upload image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      const form = new FormData();
                      form.append("image", f);
                      const r = await fetch("/api/admin/upload", {
                        method: "POST",
                        body: form,
                      });
                      const v = await r.json();
                      if (!r.ok) throw Error(v.error);
                      setEditing({ ...editing, primary_image: v.url });
                    } catch (e) {
                      setMessage((e as Error).message);
                    }
                  }}
                />
              </label>
              <label className="inline-check">
                <input
                  type="checkbox"
                  checked={Boolean(editing.is_active)}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      is_active: Number(e.target.checked),
                    })
                  }
                />
                Active in store
              </label>
              <button className="button">Save product</button>
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </form>
          )}
          <div className="admin-list">
            {data.products.map((p) => (
              <div key={p.id}>
                <img src={p.primary_image} alt="" />
                <span>
                  {p.name}
                  <small>
                    {money(p.price)} · {p.stock_quantity} in stock ·{" "}
                    {p.is_active ? "Active" : "Archived"}
                  </small>
                </span>
                <button onClick={() => setEditing(p)}>Edit</button>
                <button
                  onClick={() =>
                    save("/admin/products", { ...p, is_active: 0 })
                  }
                >
                  Archive
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      {tab === "Categories" && (
        <>
          <button
            className="button"
            onClick={() => setCategory({ name: "", slug: "", is_active: 1 })}
          >
            Add category
          </button>
          {category && (
            <form
              className="editor"
              onSubmit={(e) => {
                e.preventDefault();
                save("/admin/categories", category);
              }}
            >
              <label>
                Name
                <input
                  required
                  value={category.name}
                  onChange={(e) =>
                    setCategory({ ...category, name: e.target.value })
                  }
                />
              </label>
              <label>
                Slug
                <input
                  required
                  value={category.slug}
                  onChange={(e) =>
                    setCategory({ ...category, slug: e.target.value })
                  }
                />
              </label>
              <label className="inline-check">
                <input
                  type="checkbox"
                  checked={Boolean(category.is_active)}
                  onChange={(e) =>
                    setCategory({
                      ...category,
                      is_active: Number(e.target.checked),
                    })
                  }
                />
                Show category
              </label>
              <button className="button">Save category</button>
            </form>
          )}
          <div className="admin-list">
            {data.categories.map((c) => (
              <div key={c.id}>
                <span>
                  {c.name} · {c.is_active ? "Visible" : "Hidden"}
                </span>
                <button onClick={() => setCategory(c)}>Edit</button>
              </div>
            ))}
          </div>
        </>
      )}
      {tab === "Best sellers" && (
        <div className="editor">
          <h2>Choose four blooms</h2>
          <p>Selection order controls the card and petal order.</p>
          {data.products
            .filter((p) => p.is_active)
            .map((p) => (
              <label className="inline-check" key={p.id}>
                <input
                  type="checkbox"
                  checked={best.includes(p.id)}
                  onChange={(e) =>
                    setBest(
                      e.target.checked
                        ? [...best, p.id]
                        : best.filter((id) => id !== p.id),
                    )
                  }
                />
                {best.includes(p.id) ? `${best.indexOf(p.id) + 1}. ` : ""}
                {p.name}
              </label>
            ))}
          <button
            className="button"
            disabled={best.length !== 4}
            onClick={() => save("/admin/bestsellers", { ids: best })}
          >
            Save four best sellers
          </button>
        </div>
      )}
      {tab === "Reviews" && (
        <div className="admin-list">
          {data.reviews.map((r) => (
            <div key={r.id}>
              <span>
                {r.customer_name}
                <small>{r.review_text}</small>
              </span>
              <button
                onClick={() =>
                  save(`/admin/reviews/${r.id}`, {
                    is_approved: !r.is_approved,
                  })
                }
              >
                {r.is_approved ? "Hide" : "Approve"}
              </button>
            </div>
          ))}
        </div>
      )}
      {tab === "Orders" && (
        <div className="admin-list">
          {data.orders.length ? (
            data.orders.map((o) => (
              <div key={o.id}>
                <span>
                  {JSON.parse(o.customer_details).name}
                  <small>
                    {o.id} · {o.is_demo ? "Demo" : "Live"} · {o.payment_status}
                    <br />
                    {JSON.parse(o.delivery_address).address},{" "}
                    {JSON.parse(o.delivery_address).city}
                    <br />
                    {JSON.parse(o.customer_details).email}
                  </small>
                </span>
                <strong>{money(o.total)}</strong>
              </div>
            ))
          ) : (
            <p>No orders yet.</p>
          )}
        </div>
      )}
    </main>
  );
}

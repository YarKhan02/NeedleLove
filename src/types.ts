export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  primary_image: string;
  category_id: number;
  is_best_seller: number;
  bestseller_order: number;
  is_active: number;
  stock_quantity: number;
  specifications: string;
}
export interface Category {
  id: number;
  name: string;
  slug: string;
  is_active: number;
}
export interface Review {
  id: number;
  customer_name: string;
  rating: number;
  review_text: string;
  is_approved: number;
  is_demo: number;
  is_verified_purchase: number;
}
export interface Store {
  products: Product[];
  categories: Category[];
  reviews: Review[];
  config: {
    currency: string;
    shipping: number;
    demo: boolean;
    codEnabled: boolean;
  };
}
let currency = "PKR";
export const configureCurrency = (value: string) => {
  currency = value;
};
export const money = (n: number) =>
  currency === "PKR"
    ? `Rs. ${n.toLocaleString("en-PK")}`
    : new Intl.NumberFormat("en", { style: "currency", currency }).format(n);
export async function api(path: string, body?: unknown) {
  const r = await fetch(
    `/api${path}`,
    body === undefined
      ? {}
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
  const data = await r.json();
  if (!r.ok)
    throw Error(data.error || "Something went wrong. Please try again.");
  return data;
}

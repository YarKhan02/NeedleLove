import { randomUUID } from "node:crypto";
export function createOrder(
  db,
  body,
  { shipping = 250, codEnabled = true, demo = true, currency = "PKR" } = {},
) {
  if (!codEnabled || body.payment_method !== "cod")
    throw new Error("This payment method is unavailable.");
  const c = body.customer || {};
  for (const key of ["name", "email", "phone", "address", "city"])
    if (
      typeof c[key] !== "string" ||
      c[key].trim().length < 2 ||
      c[key].length > 500
    )
      throw new Error(`Please enter a valid ${key}.`);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))
    throw new Error("Please enter a valid email.");
  if (
    !Array.isArray(body.items) ||
    !body.items.length ||
    body.items.length > 100
  )
    throw new Error("Your cart is empty or invalid.");
  const combined = new Map();
  for (const item of body.items) {
    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99 ||
      !Number.isInteger(item.product_id)
    )
      throw new Error("Invalid cart quantity.");
    combined.set(
      item.product_id,
      (combined.get(item.product_id) || 0) + item.quantity,
    );
  }
  db.exec("BEGIN IMMEDIATE");
  try {
    const lines = [...combined].map(([id, quantity]) => {
      const p = db
        .prepare("SELECT * FROM products WHERE id=? AND is_active=1")
        .get(id);
      if (!p || quantity > p.stock_quantity)
        throw new Error("An item is unavailable or exceeds remaining stock.");
      if (p.currency !== currency)
        throw new Error(
          "This item needs a price update for the store currency.",
        );
      return { p, quantity };
    });
    const subtotal = lines.reduce(
        (sum, { p, quantity }) => sum + p.price * quantity,
        0,
      ),
      id = randomUUID();
    db.prepare(
      "INSERT INTO orders(id,customer_details,delivery_address,subtotal,shipping_cost,total,currency,payment_method,payment_status,order_status,is_demo) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    ).run(
      id,
      JSON.stringify({ name: c.name, email: c.email, phone: c.phone }),
      JSON.stringify({
        address: c.address,
        city: c.city,
        postal: c.postal || "",
      }),
      subtotal,
      shipping,
      subtotal + shipping,
      currency,
      "cod",
      "unpaid",
      "pending",
      demo ? 1 : 0,
    );
    for (const { p, quantity } of lines) {
      db.prepare(
        "INSERT INTO order_items(order_id,product_id,quantity,unit_price,line_total) VALUES (?,?,?,?,?)",
      ).run(id, p.id, quantity, p.price, p.price * quantity);
      db.prepare(
        "UPDATE products SET stock_quantity=stock_quantity-? WHERE id=?",
      ).run(quantity, p.id);
    }
    db.exec("COMMIT");
    return {
      id,
      total: subtotal + shipping,
      payment_status: "unpaid",
      is_demo: demo,
    };
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
// Future gateways must create provider sessions server-side and verify signed webhooks.
export const paymentProviders = {
  cod: { label: "Cash on delivery", online: false },
};

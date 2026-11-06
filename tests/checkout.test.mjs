import test from "node:test";
import assert from "node:assert/strict";
import { openDatabase } from "../server/db.mjs";
import { createOrder } from "../server/checkout.mjs";
const body = {
  customer: {
    name: "Demo Tester",
    email: "test@example.com",
    phone: "03001234567",
    address: "Demo street 1",
    city: "Lahore",
  },
  items: [{ product_id: 1, quantity: 2 }],
  payment_method: "cod",
};
test("seed supplies sixteen products and exactly four ordered best sellers", () => {
  const db = openDatabase(":memory:");
  assert.equal(db.prepare("SELECT count(*) n FROM products").get().n, 16);
  assert.equal(
    db.prepare("SELECT count(*) n FROM products WHERE is_best_seller=1").get()
      .n,
    4,
  );
  db.close();
});
test("checkout ignores client totals and atomically records unpaid order", () => {
  const db = openDatabase(":memory:");
  const order = createOrder(db, { ...body, total: 1, price: 1 });
  assert.equal(order.total, 5950);
  assert.equal(order.payment_status, "unpaid");
  assert.equal(
    db.prepare("SELECT stock_quantity n FROM products WHERE id=1").get().n,
    10,
  );
  assert.equal(db.prepare("SELECT count(*) n FROM order_items").get().n, 1);
  db.close();
});
test("duplicate cart lines cannot bypass stock checks and failure rolls back", () => {
  const db = openDatabase(":memory:");
  assert.throws(
    () =>
      createOrder(db, {
        ...body,
        items: [
          { product_id: 1, quantity: 7 },
          { product_id: 1, quantity: 7 },
        ],
      }),
    /stock/,
  );
  assert.equal(db.prepare("SELECT count(*) n FROM orders").get().n, 0);
  assert.equal(
    db.prepare("SELECT stock_quantity n FROM products WHERE id=1").get().n,
    12,
  );
  db.close();
});
test("rejects missing products, sold out items, fractional and negative quantities", () => {
  const db = openDatabase(":memory:");
  for (const [id, q] of [
    [999, 1],
    [16, 1],
    [1, -1],
    [1, 1.5],
  ])
    assert.throws(() =>
      createOrder(db, { ...body, items: [{ product_id: id, quantity: q }] }),
    );
  db.close();
});
test("rejects unconfigured online payments and disabled COD", () => {
  const db = openDatabase(":memory:");
  assert.throws(
    () => createOrder(db, { ...body, payment_method: "card" }),
    /unavailable/,
  );
  assert.throws(
    () => createOrder(db, body, { codEnabled: false }),
    /unavailable/,
  );
  db.close();
});
test("validates customer details before writing", () => {
  const db = openDatabase(":memory:");
  assert.throws(
    () =>
      createOrder(db, {
        ...body,
        customer: { ...body.customer, email: "invalid" },
      }),
    /email/,
  );
  assert.equal(db.prepare("SELECT count(*) n FROM orders").get().n, 0);
  db.close();
});

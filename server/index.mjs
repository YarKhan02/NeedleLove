import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import multer from "multer";
import { randomBytes, timingSafeEqual, createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { openDatabase } from "./db.mjs";
import { createOrder } from "./checkout.mjs";
const app = express(),
  db = openDatabase(),
  sessions = new Map(),
  port = Number(process.env.PORT || 3001);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "100kb" }));
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  if (
    !["GET", "HEAD"].includes(req.method) &&
    req.headers.origin &&
    new URL(req.headers.origin).host !== req.headers.host &&
    !(
      process.env.ALLOWED_ORIGINS ||
      (process.env.NODE_ENV === "production"
        ? ""
        : "http://127.0.0.1:5173,http://localhost:5173")
    )
      .split(",")
      .includes(req.headers.origin)
  )
    return res.status(403).json({ error: "Origin not allowed." });
  next();
});
const currency = process.env.STORE_CURRENCY || "PKR";
const shipping = Number(process.env.SHIPPING_COST || 250),
  demo = process.env.STORE_MODE !== "live",
  codEnabled = process.env.COD_ENABLED !== "false";
app.get("/api/store", (req, res) =>
  res.json({
    products: db.prepare("SELECT * FROM products WHERE is_active=1").all(),
    categories: db
      .prepare(
        "SELECT * FROM categories WHERE is_active=1 ORDER BY display_order",
      )
      .all(),
    reviews: db.prepare("SELECT * FROM reviews WHERE is_approved=1").all(),
    config: { currency, shipping, demo, codEnabled },
  }),
);
app.post(
  "/api/orders",
  rateLimit({ windowMs: 60000, limit: 10 }),
  (req, res) => {
    try {
      res
        .status(201)
        .json(
          createOrder(db, req.body, { shipping, demo, codEnabled, currency }),
        );
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },
);
app.post(
  "/api/admin/login",
  rateLimit({ windowMs: 900000, limit: 10 }),
  (req, res) => {
    if (!process.env.ADMIN_PASSWORD)
      return res.status(503).json({
        error:
          "Admin is disabled. Set ADMIN_PASSWORD in the server environment.",
      });
    const hash = (x) => createHash("sha256").update(String(x)).digest();
    if (
      !timingSafeEqual(
        hash(req.body.password),
        hash(process.env.ADMIN_PASSWORD),
      )
    )
      return res.status(401).json({ error: "Incorrect password." });
    const token = randomBytes(32).toString("hex");
    sessions.set(token, Date.now() + 8 * 3600000);
    res.cookie("nl_session", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 3600000,
      path: "/api/admin",
    });
    res.json({ ok: true });
  },
);
app.use("/api/admin", (req, res, next) => {
  const token = req.headers.cookie?.match(/(?:^|; )nl_session=([^;]+)/)?.[1];
  if (!token || !(sessions.get(token) > Date.now()))
    return res.status(401).json({ error: "Please sign in." });
  next();
});
app.post("/api/admin/logout", (req, res) => {
  const token = req.headers.cookie?.match(/nl_session=([^;]+)/)?.[1];
  sessions.delete(token);
  res.clearCookie("nl_session", { path: "/api/admin" }).json({ ok: true });
});
app.get("/api/admin/data", (req, res) =>
  res.json({
    products: db.prepare("SELECT * FROM products").all(),
    categories: db.prepare("SELECT * FROM categories").all(),
    reviews: db.prepare("SELECT * FROM reviews").all(),
    orders: db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all(),
  }),
);
app.post("/api/admin/products", (req, res) => {
  try {
    const p = req.body;
    if (
      !p.name?.trim() ||
      !p.slug?.match(/^[a-z0-9-]+$/) ||
      !Number.isInteger(p.price) ||
      p.price < 0 ||
      !Number.isInteger(p.stock_quantity) ||
      p.stock_quantity < 0
    )
      throw Error(
        "A name, valid slug, whole-number price and stock are required.",
      );
    if (!/^\/(assets|uploads)\/[a-zA-Z0-9._-]+$/.test(p.primary_image || ""))
      throw Error("Choose an uploaded or bundled image.");
    if (
      p.id &&
      !p.is_active &&
      db.prepare("SELECT is_best_seller FROM products WHERE id=?").get(p.id)
        ?.is_best_seller
    )
      throw Error(
        "Select a replacement in Best sellers before archiving this product.",
      );
    const values = [
      p.name,
      p.slug,
      p.description || "",
      p.price,
      p.primary_image,
      p.category_id,
      Number(Boolean(p.is_active)),
      p.stock_quantity,
    ];
    if (p.id)
      db.prepare(
        "UPDATE products SET name=?,slug=?,description=?,price=?,primary_image=?,category_id=?,is_active=?,stock_quantity=? WHERE id=?",
      ).run(...values, p.id);
    else
      db.prepare(
        "INSERT INTO products(name,slug,description,price,primary_image,category_id,is_active,stock_quantity,currency,created_at) VALUES (?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)",
      ).run(...values, currency);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
app.post("/api/admin/bestsellers", (req, res) => {
  const ids = req.body.ids;
  if (
    !Array.isArray(ids) ||
    new Set(ids).size !== 4 ||
    ids.some(
      (id) =>
        !db
          .prepare("SELECT id FROM products WHERE id=? AND is_active=1")
          .get(id),
    )
  )
    return res
      .status(400)
      .json({ error: "Choose exactly four distinct active products." });
  db.exec("BEGIN");
  try {
    db.exec("UPDATE products SET is_best_seller=0,bestseller_order=0");
    ids.forEach((id, i) =>
      db
        .prepare(
          "UPDATE products SET is_best_seller=1,bestseller_order=? WHERE id=?",
        )
        .run(i + 1, id),
    );
    db.exec("COMMIT");
    res.json({ ok: true });
  } catch {
    db.exec("ROLLBACK");
    res.status(400).json({ error: "Could not save selection." });
  }
});
app.post("/api/admin/categories", (req, res) => {
  try {
    const c = req.body;
    if (!c.name?.trim() || !c.slug?.match(/^[a-z0-9-]+$/))
      throw Error("Valid category name and slug required.");
    if (c.id)
      db.prepare(
        "UPDATE categories SET name=?,slug=?,is_active=? WHERE id=?",
      ).run(c.name, c.slug, Number(Boolean(c.is_active)), c.id);
    else
      db.prepare("INSERT INTO categories(name,slug) VALUES (?,?)").run(
        c.name,
        c.slug,
      );
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
app.post("/api/admin/reviews/:id", (req, res) => {
  db.prepare("UPDATE reviews SET is_approved=? WHERE id=?").run(
    req.body.is_approved ? 1 : 0,
    Number(req.params.id),
  );
  res.json({ ok: true });
});
mkdirSync(".data/uploads", { recursive: true, mode: 0o700 });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
app.post("/api/admin/upload", upload.single("image"), (req, res) => {
  const b = req.file?.buffer;
  let ext;
  if (b?.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    ext = "png";
  else if (b?.[0] === 255 && b?.[1] === 216 && b?.[2] === 255) ext = "jpg";
  else if (
    b?.toString("ascii", 0, 4) === "RIFF" &&
    b?.toString("ascii", 8, 12) === "WEBP"
  )
    ext = "webp";
  if (!ext)
    return res.status(400).json({ error: "Upload a PNG, JPEG or WebP image." });
  const file = `${randomBytes(16).toString("hex")}.${ext}`;
  writeFileSync(`.data/uploads/${file}`, b, { mode: 0o600 });
  res.json({ url: `/uploads/${file}` });
});
app.use(
  "/uploads",
  express.static(path.resolve(".data/uploads"), { dotfiles: "deny" }),
);
if (process.env.NODE_ENV === "production") {
  app.use(express.static("dist"));
  app.get("/{*path}", (req, res) =>
    res.sendFile(path.resolve("dist/index.html")),
  );
}
app.use((err, req, res, next) =>
  res.status(400).json({ error: "The request could not be processed." }),
);
app.listen(port, "127.0.0.1", () =>
  console.log(
    `NeedleLove API ready at http://127.0.0.1:${port} (${demo ? "demo" : "live"} mode)`,
  ),
);

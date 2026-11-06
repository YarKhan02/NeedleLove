import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { categories, products, reviews } from "./seed.mjs";
export function openDatabase(path = ".data/store.sqlite") {
  if (path !== ":memory:") mkdirSync(".data", { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path);
  db.exec("PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;");
  db.exec(`CREATE TABLE IF NOT EXISTS categories(id INTEGER PRIMARY KEY,name TEXT NOT NULL,slug TEXT UNIQUE NOT NULL,display_order INTEGER DEFAULT 0,is_active INTEGER DEFAULT 1);
 CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY,name TEXT NOT NULL,slug TEXT UNIQUE NOT NULL,description TEXT,price INTEGER NOT NULL CHECK(price>=0),currency TEXT DEFAULT 'PKR',primary_image TEXT,category_id INTEGER REFERENCES categories(id),is_best_seller INTEGER DEFAULT 0,bestseller_order INTEGER DEFAULT 0,is_active INTEGER DEFAULT 1,stock_quantity INTEGER NOT NULL CHECK(stock_quantity>=0),created_at TEXT,specifications TEXT DEFAULT '{}');
 CREATE TABLE IF NOT EXISTS product_images(id INTEGER PRIMARY KEY,product_id INTEGER REFERENCES products(id),image_url TEXT,alt_text TEXT,sort_order INTEGER DEFAULT 0);
 CREATE TABLE IF NOT EXISTS product_variants(id INTEGER PRIMARY KEY,product_id INTEGER REFERENCES products(id),variant_name TEXT,variant_value TEXT,price_adjustment INTEGER DEFAULT 0,stock_quantity INTEGER DEFAULT 0);
 CREATE TABLE IF NOT EXISTS reviews(id INTEGER PRIMARY KEY,customer_name TEXT,rating INTEGER,review_text TEXT,is_approved INTEGER DEFAULT 1,is_verified_purchase INTEGER DEFAULT 0,is_demo INTEGER DEFAULT 1,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
 CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,customer_details TEXT,delivery_address TEXT,subtotal INTEGER,shipping_cost INTEGER,total INTEGER,currency TEXT,payment_method TEXT,payment_status TEXT,order_status TEXT,is_demo INTEGER,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
 CREATE TABLE IF NOT EXISTS order_items(id INTEGER PRIMARY KEY,order_id TEXT REFERENCES orders(id),product_id INTEGER REFERENCES products(id),variant_id INTEGER REFERENCES product_variants(id),quantity INTEGER,unit_price INTEGER,line_total INTEGER);`);
  if (!db.prepare("SELECT id FROM categories LIMIT 1").get()) {
    for (const c of categories)
      db.prepare("INSERT INTO categories VALUES (?,?,?,?,?)").run(
        ...Object.values(c),
      );
    for (const p of products)
      db.prepare(
        `INSERT INTO products (${Object.keys(p).join(",")}) VALUES (${Object.keys(
          p,
        )
          .map(() => "?")
          .join(",")})`,
      ).run(...Object.values(p));
    for (const r of reviews)
      db.prepare(
        "INSERT INTO reviews(customer_name,rating,review_text) VALUES (?,?,?)",
      ).run(r.customer_name, r.rating, r.review_text);
  }
  return db;
}

export const categories = [
  "Crochet Flowers",
  "Crochet Bouquets",
  "Yarn & Threads",
  "Hooks & Tools",
  "Needlework Kits",
  "Handmade Gifts",
].map((name, i) => ({
  id: i + 1,
  name,
  slug: name.toLowerCase().replace(/ & /g, "-").replaceAll(" ", "-"),
  display_order: i,
  is_active: 1,
}));
const names = [
  "Blush Tulip Bouquet",
  "Little Daisy Posy",
  "Cotton Cloud Yarn",
  "The Everyday Crochet Kit",
  "Rosebud Stem",
  "Sunshine Sunflower",
  "Wildflower Bouquet",
  "Forever Spring Bouquet",
  "Rosewater Cotton Yarn",
  "Sage Cotton Yarn",
  "Essential Crochet Hooks",
  "Rose Gold Scissors",
  "First Bloom Kit",
  "Daisy Embroidery Kit",
  "Strawberry Bag Charm",
  "Handmade Heart Coasters",
];
const cats = [2, 1, 3, 5, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6];
const prices = [
  2850, 1650, 650, 3200, 550, 750, 3450, 3900, 650, 650, 1200, 950, 2400, 1850,
  850, 1100,
];
export const products = names.map((name, i) => ({
  id: i + 1,
  name,
  slug: name.toLowerCase().replaceAll(" ", "-"),
  description: `A little joy, made stitch by stitch. ${name} brings a thoughtful touch to your everyday rituals. This is a demonstration listing; materials, dimensions and availability must be confirmed by the merchant before launch.`,
  price: prices[i],
  currency: process.env.STORE_CURRENCY || "PKR",
  primary_image: {
    1: "/assets/daisy.png",
    2: "/assets/bouquet.png",
    3: "/assets/yarn.png",
    4: "/assets/kit.png",
    5: "/assets/kit.png",
    6: "/assets/daisy.png",
  }[cats[i]],
  category_id: cats[i],
  is_best_seller: i < 4 ? 1 : 0,
  bestseller_order: i < 4 ? i + 1 : 0,
  is_active: 1,
  stock_quantity: i === 15 ? 0 : 12,
  created_at: new Date().toISOString(),
  specifications: JSON.stringify({
    Collection: "NeedleLove demonstration collection",
    Care: "Confirm care instructions with the merchant",
  }),
}));
export const reviews = [
  {
    customer_name: "Ayesha M.",
    rating: 5,
    review_text:
      "The sweetest little bouquet. Every stitch feels so thoughtful — it makes my desk a happier place.",
  },
  {
    customer_name: "Sara K.",
    rating: 5,
    review_text:
      "Beautiful colors, lovely little details. Such a special way to give flowers that last.",
  },
  {
    customer_name: "Mahnoor A.",
    rating: 5,
    review_text:
      "A quiet afternoon, a cup of tea, and my first crochet kit. I loved making something of my own.",
  },
];

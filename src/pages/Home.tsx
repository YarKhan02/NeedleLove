import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDown, Star } from "lucide-react";
import { FlowerScene } from "../components/Flower";
import { Filters, ProductGrid, TextLink } from "../components/Products";
import { useStore } from "../hooks/useStore";
export function Home() {
  const { store } = useStore(),
    [category, setCategory] = useState("");
  if (!store) return null;
  const best = store.products
      .filter((p) => p.is_best_seller)
      .sort((a, b) => a.bestseller_order - b.bestseller_order)
      .slice(0, 4),
    selected = store.categories.find((c) => c.slug === category),
    filtered = store.products
      .filter((p) => !selected || p.category_id === selected.id)
      .slice(0, 4);
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">THOUGHTFULLY CRAFTED. JOYFULLY YOURS.</p>
          <h1>
            Where every
            <br />
            stitch <em>blooms.</em>
          </h1>
          <p className="hero-description">
            Beautifully handmade creations & thoughtful
            <br className="desktop-break" /> essentials for your creative
            journey.
          </p>
          <Link to="/shop" className="button">
            Explore collection <ArrowUpRight size={18} />
          </Link>
        </div>
        <FlowerScene />
        <div className="hero-side hero-note">
          <span className="tiny-star">✳</span>
          <p>
            A little yarn.
            <br />A little patience.
            <br />
            <em>A whole lot of love.</em>
          </p>
          <svg viewBox="0 0 100 60" aria-hidden="true">
            <path
              d="M90 8Q85 60 15 38M15 38L30 34M15 38L25 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </div>
        <div className="hero-side flower-label">
          <span className="fine-line" />
          <span>Handmade, petal by petal.</span>
        </div>
        <div className="hero-bottom">
          <span>Small details. Lasting happiness.</span>
          <a href="#bestsellers">
            SCROLL TO BLOOM <ArrowDown size={15} />
          </a>
          <span>Crafted with care, kept with love.</span>
        </div>
      </section>
      <section id="bestsellers" className="section bestsellers">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE ONES YOU’LL FALL FOR</p>
            <h2>
              Little things, <em>big love.</em>
            </h2>
          </div>
          <TextLink to="/shop">Shop best-loved pieces</TextLink>
        </div>
        <ProductGrid products={best} bloom />
        <p className="demo-note">
          A glimpse of what’s possible · Demonstration products & sample prices
        </p>
      </section>
      <section className="section collection">
        <div className="center-heading">
          <p className="eyebrow">FIND YOUR NEXT LITTLE JOY</p>
          <h2>
            Explore our <em>collection.</em>
          </h2>
          <p>For the makers, the gifters, and the just-because moments.</p>
        </div>
        <Filters value={category} onChange={setCategory} />
        <div className="filter-result" key={category}>
          <ProductGrid products={filtered} />
        </div>
        <div className="center-action">
          <Link
            className="button button-outline"
            to={category ? `/shop?category=${category}` : "/shop"}
          >
            View all {selected ? selected.name.toLowerCase() : "products"}{" "}
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section id="reviews" className="section reviews">
        <div className="center-heading">
          <p className="eyebrow">LOVE, IN THEIR WORDS</p>
          <h2>
            A few happy <em>hearts.</em>
          </h2>
          <p className="demo-note">
            Demonstration reviews — a preview of our future community
          </p>
        </div>
        <div className="review-grid">
          {store.reviews.map((r) => (
            <article key={r.id}>
              <div className="stars" aria-label={`${r.rating} out of 5 stars`}>
                {Array.from({ length: r.rating }, (_, i) => (
                  <Star key={i} size={13} fill="currentColor" />
                ))}
              </div>
              <blockquote>“{r.review_text}”</blockquote>
              <div className="review-person">
                <span>{r.customer_name[0]}</span>
                <div>
                  <strong>{r.customer_name}</strong>
                  <small>
                    {r.is_demo
                      ? "Demo review"
                      : r.is_verified_purchase
                        ? "Verified purchase"
                        : "Customer review"}
                  </small>
                </div>
                <span className="review-heart">♡</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

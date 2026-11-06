import { useId, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export function Petal({ index }: { index: number }) {
  const id = useId().replaceAll(":", "");
  return (
    <svg viewBox="0 0 240 270" aria-hidden="true">
      <defs>
        <pattern
          id={`${id}yarn`}
          width="22"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          {[
            [5, 5],
            [16, 5],
            [0, 15],
            [11, 15],
            [22, 15],
          ].map(([x, y], n) => (
            <g key={n} transform={`translate(${x} ${y})`}>
              <path
                d="M-4 -4Q-7 1 0 7Q7 0 4 -4"
                fill="none"
                stroke="#9c3f69"
                strokeWidth="4"
                opacity=".44"
              />
              <path
                d="M-4 -5Q-6 0 0 5Q6 0 4 -5"
                fill="none"
                stroke={index % 2 ? "#f5a5c0" : "#ffb0ca"}
                strokeWidth="3.2"
              />
              <path
                d="M-3 -4L0 3L3 -4"
                fill="none"
                stroke="#ffe0e9"
                strokeWidth=".6"
                opacity=".65"
              />
            </g>
          ))}
        </pattern>
        <radialGradient id={id}>
          <stop stopColor="#ffb2cc" />
          <stop offset=".65" stopColor="#ec79a2" />
          <stop offset="1" stopColor="#b84673" />
        </radialGradient>
        <clipPath id={`${id}c`}>
          <path d="M120 258C84 225 19 171 20 97C20 15 107 -3 120 35C148 -12 227 26 224 98C219 171 159 235 120 258Z" />
        </clipPath>
        <filter id={`${id}s`}>
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="3"
            floodColor="#813451"
            floodOpacity=".28"
          />
        </filter>
      </defs>
      <g filter={`url(#${id}s)`}>
        <path
          d="M120 258C84 225 19 171 20 97C20 15 107 -3 120 35C148 -12 227 26 224 98C219 171 159 235 120 258Z"
          fill={`url(#${id})`}
          stroke="#d97599"
          strokeWidth="5"
        />
        <g clipPath={`url(#${id}c)`}>
          <rect width="240" height="270" fill={`url(#${id}yarn)`} />
        </g>
      </g>
    </svg>
  );
}
export function FlowerScene() {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!root.current) return;
    const el = root.current,
      petals = Array.from(el.querySelectorAll<HTMLElement>(".petal-flight")),
      core = el.querySelector(".flower-core"),
      hero = document.querySelector<HTMLElement>(".hero")!,
      targets = Array.from(
        document.querySelectorAll<HTMLElement>("[data-bloom-target]"),
      );
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer: ReturnType<typeof setTimeout>;
    const ctx = gsap.context(() => {
      if (reduced) {
        el.classList.add("ready");
        return;
      }
      const seen = sessionStorage.getItem("needlelove-intro");
      el.classList.add("ready");
      if (!seen) {
        sessionStorage.setItem("needlelove-intro", "1");
        gsap.fromTo(
          el,
          {
            y:
              innerHeight / 2 -
              el.getBoundingClientRect().top -
              el.offsetHeight / 2,
            scale: 0.66,
          },
          { y: 0, scale: 1, duration: 1.45, delay: 0.65, ease: "power2.inOut" },
        );
        gsap.to(".loader-veil", { opacity: 0, duration: 0.7, delay: 1 });
        gsap.from(".hero-copy,.hero-side,.site-header", {
          opacity: 0,
          duration: 0.8,
          delay: 1.15,
        });
      }
      if (seen) gsap.set(".loader-veil", { opacity: 0 });
      timer = setTimeout(
        () => gsap.set(".loader-veil", { visibility: "hidden" }),
        1800,
      );
      if (targets.length !== 4) return;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: () =>
            `+=${Math.max(650, targets[3].getBoundingClientRect().top + scrollY - innerHeight * 0.5)}`,
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
      });
      const destination = (i: number, axis: "x" | "y") => {
        const a = el.getBoundingClientRect(),
          b = targets[i].getBoundingClientRect();
        return axis === "x"
          ? b.left + b.width / 2 - (a.left + a.width / 2)
          : b.top + b.height / 2 - (a.top + a.height / 2);
      };
      tl.to(".hero-copy", { opacity: 0.18, y: -25, duration: 0.5 }, 0).to(
        core,
        { opacity: 0, scale: 0.5, y: 120, duration: 0.35 },
        0.08,
      );
      petals.forEach((p, i) => {
        const start = 0.09 + i * 0.025;
        tl.to(
          p,
          {
            x: () => destination(i, "x") * 0.3,
            y: () => destination(i, "y") * 0.35,
            rotation: (i - 1.5) * 12,
            scale: 0.85,
            duration: 0.27,
          },
          start,
        )
          .to(
            p,
            {
              x: () => destination(i, "x"),
              y: () => destination(i, "y"),
              rotation: (i % 2 ? 1 : -1) * 30,
              scale: 0.3,
              duration: 0.4,
              ease: "power1.inOut",
            },
            start + 0.27,
          )
          .to(p, { scale: 0.52, opacity: 0, duration: 0.18 }, start + 0.67)
          .fromTo(
            targets[i].querySelector(".arrival-bloom"),
            { opacity: 0, scale: 0.2 },
            { opacity: 1, scale: 1, duration: 0.12 },
            start + 0.63,
          )
          .to(
            targets[i].querySelector(".arrival-bloom"),
            { opacity: 0, scale: 1.25, duration: 0.17 },
            start + 0.75,
          )
          .fromTo(
            targets[i].closest(".product-card"),
            { opacity: 0.15, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.2 },
            start + 0.65,
          );
      });
    }, el.parentElement!);
    const refresh = () => ScrollTrigger.refresh();
    const observer = new ResizeObserver(refresh);
    observer.observe(hero);
    targets.forEach((t) => observer.observe(t));
    document.fonts.ready.then(refresh);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      ctx.revert();
    };
  }, []);
  return (
    <>
      <div className="loader-veil" aria-hidden="true" />
      <div
        ref={root}
        className="flower-scene"
        aria-label="Pink crochet flower with four textured petals"
        role="img"
      >
        <div className="flower-idle">
          {[0, 1, 2, 3].map((i) => (
            <div className="petal-flight" key={i}>
              <div className={`petal petal-${i}`}>
                <Petal index={i} />
              </div>
            </div>
          ))}
          <div className="flower-core">
            <svg viewBox="0 0 120 120">
              <defs>
                <radialGradient id="core">
                  <stop stopColor="#f8db9f" />
                  <stop offset="1" stopColor="#c59a52" />
                </radialGradient>
              </defs>
              <circle cx="60" cy="60" r="48" fill="url(#core)" />
              {Array.from({ length: 100 }, (_, i) => {
                const a = i * 2.4,
                  r = 4.3 * Math.sqrt(i);
                return (
                  <path
                    key={i}
                    d="M-3 -3Q-7 2 0 6Q7 2 3 -3"
                    transform={`translate(${60 + Math.cos(a) * r} ${60 + Math.sin(a) * r}) rotate(${i * 37})`}
                    fill="none"
                    stroke={i % 2 ? "#ffe9b8" : "#b98d4c"}
                    strokeWidth="3.5"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}

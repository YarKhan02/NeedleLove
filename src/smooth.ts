import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

// Singleton Lenis instance. Lives for the app's lifetime, so it is never torn
// down. null when reduced-motion is preferred — callers fall back to native.
export let lenis: Lenis | null = null;

export function initSmoothScroll() {
  if (lenis || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  lenis = new Lenis();
  // Keep GSAP ScrollTrigger (the Flower bloom scrub) in sync with Lenis.
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

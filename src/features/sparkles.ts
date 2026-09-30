import { el, pick, prefersReducedMotion, random } from "../lib/dom";

export const SPARKLES = ["✨", "⭐", "💖", "✦", "★", "💫"];

function spawn(x: number, y: number, glyph: string, dx: number, dy: number): void {
  const sparkle = el("span", { className: "sparkle", textContent: glyph });
  sparkle.style.left = `${x}px`;
  sparkle.style.top = `${y}px`;
  sparkle.style.setProperty("--dx", `${dx}px`);
  sparkle.style.setProperty("--dy", `${dy}px`);
  document.body.append(sparkle);
  sparkle.addEventListener("animationend", () => sparkle.remove(), { once: true });
}

/** A ring of glyphs flying out from a point. */
export function burst(x: number, y: number, glyphs: readonly string[] = SPARKLES, count = 10): void {
  if (prefersReducedMotion()) return;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + random(-0.3, 0.3);
    const distance = random(40, 90);
    spawn(x, y, pick(glyphs), Math.cos(angle) * distance, Math.sin(angle) * distance);
  }
}

export function initSparkleTrail(): void {
  if (prefersReducedMotion()) return;

  let last = 0;
  const trail = (x: number, y: number) => {
    const now = performance.now();
    if (now - last < 40) return;
    last = now;
    spawn(x, y, pick(SPARKLES), random(-20, 20), 40);
  };

  document.addEventListener("mousemove", (event) => trail(event.clientX, event.clientY));
  document.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];
      if (touch) trail(touch.clientX, touch.clientY);
    },
    { passive: true },
  );
  document.addEventListener("click", (event) => burst(event.clientX, event.clientY, SPARKLES, 8));
}

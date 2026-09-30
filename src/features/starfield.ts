import { $, pick, prefersReducedMotion, random } from "../lib/dom";

interface Star {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const COLORS = ["#ffffff", "#ffffff", "#ffff99", "#99ffff", "#ffccff"];

/** Twinkling pixel stars with the occasional shooting star, drawn on a canvas behind the page. */
export function initStarfield(): void {
  const canvas = $<HTMLCanvasElement>("#starfield");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const still = prefersReducedMotion();
  let width = 0;
  let height = 0;
  let stars: Star[] = [];
  const shooters: ShootingStar[] = [];
  let nextShooterAt = performance.now() + random(2000, 5000);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    stars = Array.from({ length: Math.round((width * height) / 2200) }, () => ({
      x: Math.round(random(0, width)),
      y: Math.round(random(0, height)),
      size: Math.random() < 0.12 ? 2 : 1,
      phase: random(0, Math.PI * 2),
      speed: random(0.5, 2.5),
      color: pick(COLORS),
    }));
    if (still) draw(0);
  }

  function draw(time: number) {
    ctx!.clearRect(0, 0, width, height);

    for (const star of stars) {
      // quantize brightness so the twinkle looks like a 4-frame gif
      const brightness = Math.round(Math.abs(Math.sin(star.phase + (time / 1000) * star.speed)) * 4) / 4;
      ctx!.globalAlpha = 0.25 + brightness * 0.75;
      ctx!.fillStyle = star.color;
      ctx!.fillRect(star.x, star.y, star.size, star.size);

      // big stars flare into a little cross at full brightness
      if (star.size === 2 && brightness === 1) {
        ctx!.fillRect(star.x - 3, star.y, 8, 2);
        ctx!.fillRect(star.x, star.y - 3, 2, 8);
      }
    }
    ctx!.globalAlpha = 1;

    for (const s of shooters) {
      const tail = ctx!.createLinearGradient(s.x, s.y, s.x - s.vx * 12, s.y - s.vy * 12);
      tail.addColorStop(0, `rgba(255, 255, 255, ${s.life})`);
      tail.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx!.strokeStyle = tail;
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(s.x, s.y);
      ctx!.lineTo(s.x - s.vx * 12, s.y - s.vy * 12);
      ctx!.stroke();
    }
  }

  function step(time: number) {
    if (time > nextShooterAt) {
      const speed = random(8, 14);
      shooters.push({ x: random(width * 0.1, width), y: random(0, height * 0.4), vx: -speed, vy: speed * 0.45, life: 1 });
      nextShooterAt = time + random(3000, 8000);
    }
    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.015;
      if (s.life <= 0) shooters.splice(i, 1);
    }

    draw(time);
    requestAnimationFrame(step);
  }

  window.addEventListener("resize", resize);
  resize();
  if (!still) requestAnimationFrame(step);
}

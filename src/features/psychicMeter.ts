import { $, prefersReducedMotion } from "../lib/dom";
import { showToast } from "./toast";

// Every click charges the meter a little; it slowly drains. Click fast enough to hit 100% and... ???%

const CHARGE_PER_CLICK = 4;
const DRAIN_PER_TICK = 1;
const OVERLOAD_MS = 3000;

export function initPsychicMeter(): void {
  const fill = $("#psychic-fill");
  const label = $("#psychic-label");
  let level = 0;
  let overloaded = false;

  const render = () => {
    fill.style.width = `${level}%`;
    fill.style.background = level < 50 ? "#00ff00" : level < 80 ? "#ffff00" : "#ff0000";
    label.textContent = `${Math.round(level)}%`;
  };

  const overload = () => {
    overloaded = true;
    label.textContent = "???%";
    showToast("⚡ ???% ⚡", OVERLOAD_MS);
    if (!prefersReducedMotion()) document.body.classList.add("overload");

    setTimeout(() => {
      document.body.classList.remove("overload");
      overloaded = false;
      level = 0;
      render();
    }, OVERLOAD_MS);
  };

  document.addEventListener("click", () => {
    if (overloaded) return;
    level = Math.min(100, level + CHARGE_PER_CLICK);
    render();
    if (level >= 100) overload();
  });

  setInterval(() => {
    if (overloaded || level === 0) return;
    level = Math.max(0, level - DRAIN_PER_TICK);
    render();
  }, 250);

  render();
}

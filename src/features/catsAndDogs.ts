import { el, pick, prefersReducedMotion, random } from "../lib/dom";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

let raining = false;

export function initKonamiCode(): void {
  let position = 0;
  document.addEventListener("keydown", (event) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === KONAMI[position]) {
      position++;
    } else {
      position = key === KONAMI[0] ? 1 : 0;
    }
    if (position === KONAMI.length) {
      position = 0;
      rainCatsAndDogs();
    }
  });
}

export function rainCatsAndDogs(): void {
  if (raining) return;
  raining = true;

  const toast = el("div", { className: "toast blink", textContent: "☔ IT'S RAINING CATS AND DOGS ☔ (they're siblings)" });
  toast.setAttribute("role", "status");
  document.body.append(toast);

  const count = prefersReducedMotion() ? 0 : 70;
  const drops: Promise<unknown>[] = [];

  for (let i = 0; i < count; i++) {
    const pet = el("span", { className: "falling-pet", textContent: pick(["🐱", "🐶"]) });
    pet.style.left = `${random(-2, 98)}vw`;
    pet.style.fontSize = `${random(24, 56)}px`;
    document.body.append(pet);

    const spin = random(-540, 540);
    drops.push(
      pet
        .animate(
          [
            { transform: "translateY(-80px) rotate(0deg)" },
            { transform: `translateY(calc(100vh + 80px)) rotate(${spin}deg)` },
          ],
          { duration: random(2200, 4500), delay: random(0, 3500), easing: "linear", fill: "backwards" },
        )
        .finished.then(() => pet.remove()),
    );
  }

  const minimumToastTime = new Promise((resolve) => setTimeout(resolve, 4000));
  void Promise.all([...drops, minimumToastTime]).then(() => {
    toast.remove();
    raining = false;
  });
}

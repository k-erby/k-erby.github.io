import { $, $$, el, pick, prefersReducedMotion } from "../lib/dom";
import { readNumber, writeNumber } from "../lib/storage";
import { burst } from "./sparkles";

const PETS_KEY = "pets-given";

export function initPets(): void {
  const counter = $("#pet-count");
  let petsGiven = readNumber(PETS_KEY);
  counter.textContent = String(petsGiven);

  for (const pet of $$<HTMLButtonElement>(".pet")) {
    const sounds = (pet.dataset.sounds ?? "").split("|");

    pet.addEventListener("click", (event) => {
      event.stopPropagation(); // hearts instead of the usual click sparkles

      petsGiven++;
      writeNumber(PETS_KEY, petsGiven);
      counter.textContent = String(petsGiven);

      pet.querySelector(".speech")?.remove();
      const speech = el("span", { className: "speech", textContent: pick(sounds) });
      speech.addEventListener("animationend", () => speech.remove(), { once: true });
      pet.append(speech);

      const rect = pet.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + rect.height / 2, ["💖", "💕", "💗"], 7);

      if (!prefersReducedMotion()) {
        pet.animate(
          [{ rotate: "0deg" }, { rotate: "-15deg" }, { rotate: "15deg" }, { rotate: "0deg" }],
          { duration: 300, easing: "steps(4)" },
        );
      }
    });
  }
}

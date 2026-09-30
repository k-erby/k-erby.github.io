import { $, $$, el, prefersReducedMotion } from "../lib/dom";
import { readNumber, writeNumber } from "../lib/storage";
import { showDialog } from "./dialog";

/** Fake hit counter: starts at a very believable number and rolls up on load. */
export function initHitCounter(): void {
  const odometer = $("#odometer");
  const visits = readNumber("visits") + 1;
  writeNumber("visits", visits);
  const target = 1337 + visits;

  const render = (value: number) => {
    odometer.replaceChildren(...String(value).padStart(6, "0").split("").map((d) => el("span", { textContent: d })));
    odometer.ariaLabel = `visitor count: ${value}`;
  };

  if (prefersReducedMotion()) {
    render(target);
    return;
  }

  const duration = 1800;
  const start = performance.now();
  const roll = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - t) ** 3;
    render(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(roll);
  };
  requestAnimationFrame(roll);
}

/** Scrolling browser-tab title, as was the style at the time. */
export function initTitleScroller(): void {
  let message = " ~*~ Welcome 2 Kaitlin's Kool HomePage ~*~ ";
  setInterval(() => {
    message = message.slice(1) + message[0];
    document.title = message;
  }, 250);
}

export function initFavorites(): void {
  $("#favorites").addEventListener("click", (event) => {
    event.preventDefault();
    void showDialog({
      title: "Add to Favorites",
      icon: "⭐",
      message: "Press Ctrl+D (or ⌘+D) 2 add this site 2 ur Favorites!!! :-)",
    });
  });
}

/** Splits [data-wavy] text into per-letter spans so CSS can wave them. */
export function initWavyText(): void {
  for (const node of $$("[data-wavy]")) {
    const text = node.textContent ?? "";
    node.ariaLabel = text;
    node.classList.add("wavy");
    node.replaceChildren(
      ...[...text].map((char, i) => {
        const letter = el("span", { textContent: char === " " ? " " : char, ariaHidden: "true" });
        letter.style.setProperty("--i", String(i));
        return letter;
      }),
    );
  }
}

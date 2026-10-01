import { $, el, pick, prefersReducedMotion, random } from "../lib/dom";
import { readNumber, writeNumber } from "../lib/storage";
import { showDialog } from "./dialog";
import { showToast } from "./toast";

// Evil spirits (they're bugs) drift around the page. Click one, or hit SALT SPLASH, to exorcise it.

interface Ghost {
  node: HTMLButtonElement;
  body: HTMLSpanElement; // the emoji, flipped separately so speech bubbles don't mirror
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const EXORCISED_KEY = "spirits-exorcised";
const TAUNTS = [
  "boooo",
  "undefined is not a function",
  "i am a race condition",
  "works on ur machine tho",
  "i live in prod now",
  "who wrote this?? (u did)",
  "NaN NaN NaN NaN",
  "i'm not a bug i'm a feature",
];
const GHOST_SIZE = 48;
const TICK_MS = 120; // choppy on purpose, like a 10fps gif

const ghosts = new Set<Ghost>();
let exorcised = 0;
let counter: HTMLElement;

export function initSpirits(): void {
  counter = $("#exorcised");
  exorcised = readNumber(EXORCISED_KEY);
  counter.textContent = String(exorcised);

  $("#salt-splash").addEventListener("click", (event) => {
    event.stopPropagation();
    saltSplash();
  });
  $("#book-consultation").addEventListener("click", () => void bookConsultation());

  setTimeout(spawnGhost, 4000);
  if (!prefersReducedMotion()) setInterval(tick, TICK_MS);
  setInterval(taunt, 7000);
}

/** Throws salt across the whole screen and exorcises every spirit on it. */
export function saltSplash(): void {
  showToast("🧂 SALT SPLASH!!! 🧂", 1800);
  const fromX = window.innerWidth / 2;
  const fromY = window.innerHeight - 60;
  throwSalt(fromX, fromY, 90, -Math.PI / 2, Math.PI * 0.9, [500, 1000]);

  if (ghosts.size === 0) {
    setTimeout(() => showToast("No spirits detected... this time 👀", 2500), 1900);
    return;
  }
  setTimeout(() => ghosts.forEach(exorcise), 350);
}

function spawnGhost(): void {
  const body = el("span", { className: "ghost-body", textContent: "👻" });
  const node = el("button", { type: "button", className: "ghost", ariaLabel: "Evil spirit! Click to exorcise it" }, body);
  const fromLeft = Math.random() < 0.5;
  const ghost: Ghost = {
    node,
    body,
    x: fromLeft ? 0 : window.innerWidth - GHOST_SIZE,
    y: random(60, window.innerHeight * 0.6),
    vx: (fromLeft ? 1 : -1) * random(20, 40),
    vy: random(-15, 15),
  };
  if (prefersReducedMotion()) {
    ghost.x = window.innerWidth - GHOST_SIZE - 16;
    ghost.y = 80;
  }
  place(ghost);
  node.addEventListener("click", (event) => {
    event.stopPropagation();
    const rect = node.getBoundingClientRect();
    throwSalt(rect.left + rect.width / 2, rect.top + rect.height / 2, 28, 0, Math.PI * 2, [60, 160]);
    exorcise(ghost);
  });
  ghosts.add(ghost);
  document.body.append(node);
}

function tick(): void {
  const maxX = window.innerWidth - GHOST_SIZE;
  const maxY = window.innerHeight - GHOST_SIZE - 50; // stay above the taskbar
  const dt = TICK_MS / 1000;

  for (const ghost of ghosts) {
    ghost.vx += random(-6, 6);
    ghost.vy += random(-6, 6);
    ghost.vx = Math.max(-60, Math.min(60, ghost.vx));
    ghost.vy = Math.max(-40, Math.min(40, ghost.vy));
    ghost.x += ghost.vx * dt * 3;
    ghost.y += ghost.vy * dt * 3;

    if (ghost.x < 0 || ghost.x > maxX) ghost.vx *= -1;
    if (ghost.y < 0 || ghost.y > maxY) ghost.vy *= -1;
    ghost.x = Math.max(0, Math.min(maxX, ghost.x));
    ghost.y = Math.max(0, Math.min(maxY, ghost.y));
    place(ghost);
  }
}

function place(ghost: Ghost): void {
  ghost.node.style.transform = `translate(${Math.round(ghost.x)}px, ${Math.round(ghost.y)}px)`;
  ghost.body.style.transform = `scaleX(${ghost.vx < 0 ? -1 : 1})`;
}

function taunt(): void {
  for (const ghost of ghosts) {
    ghost.node.querySelector(".speech")?.remove();
    const speech = el("span", { className: "speech", textContent: pick(TAUNTS) });
    speech.addEventListener("animationend", () => speech.remove(), { once: true });
    ghost.node.append(speech);
  }
}

function exorcise(ghost: Ghost): void {
  if (!ghosts.delete(ghost)) return;
  exorcised++;
  writeNumber(EXORCISED_KEY, exorcised);
  counter.textContent = String(exorcised);

  ghost.node.disabled = true;
  ghost.node.replaceChildren("💨");
  ghost.node.classList.add("poof");
  setTimeout(() => ghost.node.remove(), 700);
  showToast(pick(["✨ EXORCISED!! ✨", "✨ BEGONE, BUG!! ✨", "✨ 100% CLEANSED ✨", "✨ CASE CLOSED ✨"]), 1800);

  setTimeout(spawnGhost, random(6000, 14000));
}

/** Salt crystals flung out in a cone, falling under "gravity". */
function throwSalt(x: number, y: number, count: number, angle: number, spread: number, [minPower, maxPower]: [number, number]): void {
  if (prefersReducedMotion()) return;
  for (let i = 0; i < count; i++) {
    const direction = angle + random(-spread / 2, spread / 2);
    const power = random(minPower, maxPower);
    const dx = Math.cos(direction) * power;
    const dy = Math.sin(direction) * power;
    const size = Math.round(random(3, 7));

    const grain = el("span", { className: "salt" });
    grain.style.left = `${x}px`;
    grain.style.top = `${y}px`;
    grain.style.width = grain.style.height = `${size}px`;
    document.body.append(grain);

    grain
      .animate(
        [
          { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
          { transform: `translate(${dx * 0.7}px, ${dy * 0.7}px) rotate(180deg)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${dx}px, ${dy + 260}px) rotate(360deg)`, opacity: 0 },
        ],
        { duration: random(900, 1400), easing: "steps(12)" },
      )
      .finished.then(() => grain.remove());
  }
}

async function bookConsultation(): Promise<void> {
  const answer = await showDialog({
    title: "Consultation Booked!!",
    icon: "📅",
    message:
      "Thank u 4 choosing Bugs & Such!!\nA PROFESSIONAL will be with u shortly.\n\nEstimated wait: 3–5 business years\nTotal: ¥∞ (plus tax)",
    buttons: ["Pay in exposure", "Run away"],
  });
  if (answer === "Pay in exposure") {
    await showDialog({ title: "Payment Accepted", icon: "💸", message: "Ur bugs are now someone else's problem. ✨\nPleasure doing business!!" });
  } else if (answer === "Run away") {
    await showDialog({ title: "Hmm.", icon: "👻", message: "U can run, but the bugs will follow u." });
  }
}

import { $, el } from "../lib/dom";
import { showDialog } from "./dialog";
import { rainCatsAndDogs } from "./catsAndDogs";
import { saltSplash } from "./spirits";
import { listWindows, openWindow } from "./windows";

const GUESTBOOK_URL = "https://github.com/k-erby/k-erby.github.io/issues/new?title=Guestbook+entry&body=Kool+site!!!";

export function initTaskbar(): void {
  initClock();
  initStartMenu();
}

function initClock(): void {
  const clock = $("#clock");
  const tick = () => {
    clock.textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };
  tick();
  setInterval(tick, 10_000);
}

function initStartMenu(): void {
  const button = $<HTMLButtonElement>("#start-button");
  const menu = $("#start-menu");
  const items = $("#start-items");

  const setOpen = (open: boolean) => {
    menu.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
    if (open) items.querySelector<HTMLElement>(".menu-item")?.focus();
  };

  const action = (icon: string, label: string, run: () => void) => {
    const item = el("button", { type: "button", className: "menu-item" }, el("span", { textContent: icon }), el("span", { textContent: label }));
    item.addEventListener("click", () => {
      setOpen(false);
      run();
    });
    return el("li", {}, item);
  };

  items.append(el("li", { className: "submenu-label", textContent: "Programs" }));
  for (const win of listWindows()) {
    items.append(action(win.icon, win.title, () => void openWindow(win.id)));
  }
  items.append(
    el("li", { className: "separator" }),
    action("🌧️", "Make It Rain", rainCatsAndDogs),
    action("🧂", "Salt Splash!!", saltSplash),
    el(
      "li",
      {},
      el("a", { className: "menu-item", href: GUESTBOOK_URL }, el("span", { textContent: "📖" }), el("span", { textContent: "Sign Guestbook" })),
    ),
    el("li", { className: "separator" }),
    action("🔌", "Shut Down...", () => void shutDown()),
  );

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(!!menu.hidden);
  });
  document.addEventListener("click", (event) => {
    if (!menu.hidden && !menu.contains(event.target as Node)) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      setOpen(false);
      button.focus();
    }
  });
}

async function shutDown(): Promise<void> {
  const answer = await showDialog({
    title: "Shut Down Windows",
    icon: "🖥️",
    message: "Are you sure you want to close the office for the day?",
    buttons: ["Yes", "No"],
  });
  if (answer !== "Yes") return;

  const screen = el("div", { className: "shutdown", textContent: "Shutting down..." });
  document.body.append(screen);

  setTimeout(() => {
    screen.replaceChildren(
      "It's now safe to turn off your computer.",
      el("small", { textContent: "(click anywhere 2 reboot)" }),
    );
    screen.addEventListener(
      "click",
      () => {
        screen.replaceChildren("Starting Kaitlin 95...");
        setTimeout(() => screen.remove(), 1200);
      },
      { once: true },
    );
  }, 1500);
}

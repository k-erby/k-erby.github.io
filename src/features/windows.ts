import { $, $$, el, prefersReducedMotion } from "../lib/dom";
import { showDialog } from "./dialog";

export interface Win {
  id: string;
  title: string;
  icon: string;
  root: HTMLElement;
  taskButton: HTMLButtonElement | null;
}

const windows = new Map<string, Win>();
let taskList: HTMLElement;

export function listWindows(): Win[] {
  return [...windows.values()];
}

export function initWindows(): void {
  taskList = $("#task-list");

  for (const root of $$(".window[data-window]")) {
    const win: Win = {
      id: root.id,
      title: root.dataset.window ?? root.id,
      icon: root.dataset.icon ?? "📁",
      root,
      taskButton: null,
    };
    windows.set(win.id, win);

    root.addEventListener("click", (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>("[data-action]");
      switch (button?.dataset.action) {
        case "minimize":
          void minimize(win);
          break;
        case "maximize":
          toggleMaximize(win);
          break;
        case "close":
          void close(win);
          break;
      }
    });
    // double-clicking the title bar maximizes, just like the real thing
    $(".titlebar", root).addEventListener("dblclick", () => toggleMaximize(win));
  }

  // nav links to a window should bring it back even if it was minimized or closed
  for (const link of $$<HTMLAnchorElement>('a[href^="#"]')) {
    const win = windows.get(link.hash.slice(1));
    if (!win) continue;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      void openWindow(win.id);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    for (const win of windows.values()) {
      if (win.root.classList.contains("maximized")) toggleMaximize(win);
    }
  });
}

export async function openWindow(id: string): Promise<void> {
  const win = windows.get(id);
  if (!win) return;
  const { classList } = win.root;
  const wasHidden = classList.contains("minimized") || classList.contains("closed");

  classList.remove("minimized", "closed");
  win.taskButton?.remove();
  win.taskButton = null;

  if (!classList.contains("maximized")) {
    win.root.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }
  if (wasHidden) await animate(win.root, "in");
  flash(win.root);
}

async function minimize(win: Win): Promise<void> {
  setMaximized(win, false);
  await animate(win.root, "out");
  win.root.classList.add("minimized");

  win.taskButton = el("button", { type: "button", className: "task-button", textContent: `${win.icon} ${win.title}` });
  win.taskButton.addEventListener("click", () => void openWindow(win.id));
  taskList.append(win.taskButton);
}

async function close(win: Win): Promise<void> {
  const answer = await showDialog({
    title: win.title,
    icon: "⚠️",
    message: `Are you sure you want to close ${win.title}?\nAll unsaved glitter will be lost.`,
    buttons: ["Yes", "No"],
  });
  if (answer !== "Yes") return;

  setMaximized(win, false);
  await animate(win.root, "out");
  win.root.classList.add("closed");
}

function toggleMaximize(win: Win): void {
  setMaximized(win, !win.root.classList.contains("maximized"));
}

function setMaximized(win: Win, maximized: boolean): void {
  win.root.classList.toggle("maximized", maximized);
  const anyMaximized = [...windows.values()].some((w) => w.root.classList.contains("maximized"));
  document.body.classList.toggle("has-maximized", anyMaximized);
}

function flash(node: HTMLElement): void {
  node.classList.remove("flash");
  void node.offsetWidth; // restart the animation
  node.classList.add("flash");
}

// Win95 windows "zoom" down into the taskbar in a few chunky frames
async function animate(node: HTMLElement, direction: "in" | "out"): Promise<void> {
  if (prefersReducedMotion()) return;
  const shown: Keyframe = { transform: "none", opacity: 1 };
  const hidden: Keyframe = { transform: "translateY(35vh) scale(0.1)", opacity: 0 };
  await node.animate(direction === "out" ? [shown, hidden] : [hidden, shown], {
    duration: 280,
    easing: "steps(6)",
  }).finished;
}

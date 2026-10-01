import { el } from "../lib/dom";

/** Big blinking banner across the top of the screen. */
export function showToast(text: string, durationMs = 2500): void {
  const toast = el("div", { className: "toast blink", textContent: text });
  toast.setAttribute("role", "status");
  document.body.append(toast);
  setTimeout(() => toast.remove(), durationMs);
}

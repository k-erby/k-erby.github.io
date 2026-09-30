import { el } from "../lib/dom";

export interface DialogOptions {
  title: string;
  message: string;
  icon?: string;
  buttons?: string[];
}

let dialogCount = 0;

/** A Win95-style modal. Resolves with the clicked button's label, or null if dismissed. */
export function showDialog({ title, message, icon = "ℹ️", buttons = ["OK"] }: DialogOptions): Promise<string | null> {
  return new Promise((resolve) => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const titleId = `dialog-title-${++dialogCount}`;

    const closeButton = el("button", { type: "button", textContent: "×", ariaLabel: "Close" });
    const buttonRow = el("div", { className: "dialog-buttons" });
    const dialog = el(
      "div",
      { className: "window dialog" },
      el(
        "div",
        { className: "titlebar" },
        el("h2", { id: titleId, textContent: title }),
        el("div", { className: "winbtns" }, closeButton),
      ),
      el(
        "div",
        { className: "dialog-body" },
        el("span", { className: "dialog-icon", textContent: icon, ariaHidden: "true" }),
        el("div", { textContent: message }),
      ),
      buttonRow,
    );
    dialog.setAttribute("role", "alertdialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", titleId);

    const overlay = el("div", { className: "dialog-overlay" }, dialog);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(null);
    };

    function close(result: string | null) {
      overlay.remove();
      document.removeEventListener("keydown", onKey);
      previousFocus?.focus();
      resolve(result);
    }

    for (const label of buttons) {
      const button = el("button", { type: "button", className: "btn95", textContent: label });
      button.addEventListener("click", () => close(label));
      buttonRow.append(button);
    }
    closeButton.addEventListener("click", () => close(null));
    document.addEventListener("keydown", onKey);

    document.body.append(overlay);
    buttonRow.querySelector("button")?.focus();
  });
}

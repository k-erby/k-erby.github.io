// localStorage can throw (private mode, blocked site data), so every access is guarded
// and the site works fine without it.

export function readNumber(key: string, fallback = 0): number {
  try {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function writeNumber(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // no storage, no problem
  }
}

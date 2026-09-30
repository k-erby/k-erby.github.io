# ✨ Kaitlin's Kool HomePage ✨

My personal site, lovingly built like it's 1998. Live at **https://k-erby.github.io**.

Vite + vanilla TypeScript, no framework. Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Running it

```sh
npm install
npm run dev       # local dev server with hot reload
npm run build     # typecheck + production build into dist/
npm run preview   # serve the production build
```

## Where things live

- `index.html`: all the page content
- `src/style.css`: all the glitter
- `src/main.ts`: wires up every feature
- `src/features/`
  - `windows.ts`: Win95 windows (minimize to taskbar, maximize, close with confirm)
  - `taskbar.ts`: taskbar clock, Start menu, Shut Down screen
  - `dialog.ts`: Win95-style modal dialogs
  - `starfield.ts`: canvas background with twinkling and shooting stars
  - `sparkles.ts`: cursor sparkle trail and click bursts
  - `pets.ts`: clickable siblings with speech bubbles and a pet counter
  - `catsAndDogs.ts`: Konami code (↑↑↓↓←→←→BA) makes it rain cats and dogs
  - `retro.ts`: hit counter, scrolling tab title, Add 2 Favorites, wavy text

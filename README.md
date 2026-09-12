# Nebula Calculator

A fan-made resource and farming calculator for tracking star node upgrades, essence/shard costs, and optimal farming paths across bosses. Built as a static site — no backend, no build step, just HTML, CSS, and JavaScript.

## Features

- **Star Node leveling** — pick a current and target level per boss and see exactly what it costs.
- **Optimal Farm Path** — automatically sequences farming: each boss's own essence first, then switches to Alkaid to finish off remaining shards.
- **Boss Cards** — per-boss kill estimates and projected loot from following the recommended farm path.
- **Resources Required** — a full breakdown of what's still needed across every selected boss, accounting for your current inventory, with Conquest cost included.
- **Sweeps** — estimate the shard-farming trade-off of adding Mizar and/or Alioth alongside Alkaid, updating live as you toggle them.
- **Characters** — save multiple characters (name, class, per-boss levels, and inventory), switch between them, and delete when no longer needed.
- **Boss drop reference** — a quick popup showing average drop rates for the currently selected boss.
- **Autosave** — inventory and level progress save automatically as you go, no manual save step required.

## Tech Stack

Vanilla HTML, CSS, and JavaScript. No frameworks, no build tools, no dependencies. Character and inventory data is saved locally in the browser via `localStorage` — nothing is sent to a server, and nothing is shared between different browsers or devices.

## Project Structure

```
├── index.html          # Redirects to ui/page.html (for GitHub Pages)
├── assets/             # Images: bosses, classes, star nodes, resource icons
├── data/                # costs.json, bossDrops.json
└── ui/
    ├── page.html        # Main app markup
    ├── app.js           # All application logic
    └── style.css        # Styling
```

## Running Locally

This is a static site — no installation or build step required.

1. Clone or download the repository.
2. Open the `ui` folder in an editor with a local server (e.g. VS Code with the **Live Server** extension).
3. Launch `page.html` through the local server (opening the file directly via `file://` may not work correctly due to `fetch()` calls for JSON data).

## Notes

- Saved characters and inventory are stored per-browser via `localStorage`. Clearing your browser's site data, or switching browsers/devices, will not carry your saved characters over.
- This is a fan-made, unofficial tool and is not affiliated with or endorsed by the game's developer or publisher.

## License

Feel free to fork, adapt, or build on this for your own use.
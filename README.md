# Pokédex Mini

A small Pokédex built with React + Vite: a list of the first 20 Pokémon from PokéAPI, a search box
that sends you to a detail page, and a 404 page for anything else. No backend, one design, no sound.

**Live demo:** https://imanuelvincencia16-hub.github.io/pokedex-mini/

## What it does

| Area | What it does |
| --- | --- |
| List | `GET /pokemon?limit=20`, one row per Pokémon with its sprite, a padded dex number (`#001`) and a capitalized name |
| States | "Loading Pokémon…" while the request is in flight, a red line with the server status if it fails |
| Search | Validates an empty box before doing anything, lowercases the query, then navigates to `/pokemon/:name` |
| Detail | Official artwork on a disc tinted with the primary type colour, the types as coloured pills, the six base stats, a back link, and its own error message for a name that does not exist |
| Routing | `HashRouter` with a shared `Layout` and an `<Outlet />`: `/`, `/pokemon/:name`, and `*` for the 404 page |

Each piece does one job. `SearchForm` only decides where to send you; whether the Pokémon exists is
answered by `DetailPage`, which owns the fetch. The list fetches once on mount, and the detail page
re-fetches whenever `:name` changes, with an `isCurrent` flag so a slow response for a Pokémon you
already left cannot overwrite the screen. `document.title` follows the Pokémon that is loaded.

## Structure

```
index.html
vite.config.js           base: "/pokedex-mini/", single entry
src/
├── main.jsx             createRoot + StrictMode
├── App.jsx              HashRouter, Layout, the three routes
├── config.js            API_BASE_URL, SPRITE_BASE_URL, TYPE_COLORS, DEFAULT_ACCENT
├── utils.js             getIdFromUrl, capitalize, formatStatName, getSpriteUrl
├── index.css            one stylesheet, no framework
├── components/
│   ├── Layout.jsx       header + <Outlet />
│   ├── PokemonList.jsx  the list, its loading and error states
│   └── SearchForm.jsx   the search box
└── pages/
    ├── ListPage.jsx     SearchForm + PokemonList
    ├── DetailPage.jsx   one Pokémon, fetched by :name
    └── NotFoundPage.jsx
```

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle into dist/
npm run lint     # oxlint
```

## Deploying to GitHub Pages

```bash
git add . && git commit -m "..." && git push   # source code

npm run deploy   # predeploy builds, then gh-pages publishes dist/ to the gh-pages branch
```

`gh-pages` is a dev dependency and `predeploy` runs the build automatically. The Pages source has to
be set to the `gh-pages` branch under **Settings → Pages**.

Because the repo is published under a project path, `vite.config.js` sets `base: "/pokedex-mini/"`,
and the app runs on `HashRouter` so refreshing a detail URL never asks GitHub for a path it does not
have.

## Changelog

### 2026-10-05: one design, the handout skeleton

The project was reduced to a single simple page:

- Removed the two-edition setup (`design.html` and `src/design/`, the second build input, the cross
  links) and the dark HUD stylesheet, fonts and animation layer
- Removed the silhouette quiz, the 18 type filters, the favourite team, the day/night theme and every
  sound feature (the mute toggle and the play-cry buttons)
- Removed `api.js`, `hooks.js` and `store.jsx`; each component now fetches the way the handout does
- `config.js` and `utils.js` are back to the handout's helpers plus one extra for stat labels, and the
  roster request is `limit=20` again
- Fixed the layout defects found while inspecting the rendered pages: the detail artwork was an
  inline image, so it shared a line box with the back link and sat on top of it; sprite boxes had no
  fixed size, so every row was a different height; and the stat rows printed raw API names
  (`hp`, `special-attack`)
- Colour taken from the subject rather than invented: the 18 official type colours drive the detail
  page, where the artwork disc and the type pills follow the Pokémon's own types and its primary type
  sets the page accent; sprites sit on a soft disc so the uneven pixel padding reads evenly
- The main page got the same treatment: the header is a full-width Pokédex red band with a ghost
  pokéball behind the wordmark and a dark seam along its bottom edge, and the page background is three
  layered CSS gradients (a red halo bleeding out from under that band, a faint dot grid for texture, a
  cool vertical base) so nothing sits on flat grey. The input placeholder was darkened because it is
  the form's only label
- Contrast measured in the rendered page, not assumed: wordmark and Search button 4.99:1 on the band,
  dex number 4.74:1 on the cards, and type pills 5.22:1 or better across all 18 types after dropping
  the text mix from 72% type colour to 40%
- Bundle went from two pages and 48 kB of CSS to one page and 4 kB of CSS

### 2026-10-01: Field Guide edition

A second design was published as `design.html` with its own entry, stylesheet and `localStorage` keys.
It was removed on 2026-10-05; the code is still in git history as commit `b7ac2b5`.

Data & artwork from [PokéAPI](https://pokeapi.co/).

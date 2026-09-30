# Pokédex Mini

A Pokémon archive that behaves like an actual Pokédex device: every screen pulls its data straight
from PokéAPI, and the accent colour, animation and sound all follow whichever Pokémon is on screen.
Built with React + Vite — no backend.

**Live demo:** https://imanuelvincencia16-hub.github.io/pokedex-mini/

## Features

| Area | What it does |
| --- | --- |
| Archive | 1302 entries, live search by name or number, 18 type filters, sort No.↑ No.↓ A–Z, infinite scroll |
| Detail | Sprite stage (artwork · front · back · animated GIF · shiny), animated stat bars, abilities, flavor text, physical data, a clickable evolution chain, Pokémon cries |
| Navigation | `←` `→` arrows on the detail page step through dex numbers, glitch-themed 404 page |
| Quiz | "Who is that Pokémon?" — silhouettes, 10 rounds, a 20-second timer, type hints, a peek button, score + streaks, Kanto/National pools |
| Personal | Favourite team saved in `localStorage`, day/night theme, sound can be muted |

A single `/pokemon?limit=1302` request returns every name and number, so search, filtering and
sorting all run client-side with no extra requests.

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle into dist/
npm run lint     # oxlint
```

## Deploying to GitHub Pages

```bash
git init
git remote add origin https://github.com/imanuelvincencia16-hub/pokedex-mini.git
git add . && git commit -m "Pokédex Mini" && git branch -M main && git push -u origin main

npm run deploy   # builds, then publishes dist/ to the gh-pages branch
```

Then enable the branch: **Settings → Pages → Build and deployment → Source = Deploy from a branch →
`gh-pages` / `root`**.

`vite.config.js` uses `base: "./"` and the app runs on `HashRouter`, so the site works under a GitHub
Pages project path without any server configuration.

## Structure

```
src/
├── api.js              fetch + a promise cache per endpoint
├── config.js           API URLs, page sizes, the 18-type colour palette
├── hooks.js            useLocalStorage, useDex, usePokemon, useInView, useCountUp
├── store.jsx           theme, sound, favourites, active accent colour
├── utils.js            formatting, type colours, ROM text cleanup
├── components/         Layout, SearchBar, TypeChips, PokemonCard, SpriteStage,
│                       StatBar, EvolutionChain, FavButton, Pokeball, Tools
└── pages/              ListPage, DetailPage, QuizPage, NotFoundPage
```

## Design notes

The accent colour always comes from the active Pokémon or type filter, then flows into the
background, the sprite stage ring, the stat bars and the buttons. Text drawn on top of an accent is
picked from its luminance (`readableOn`) so it stays readable on bright types such as Electric.
Every animation shares one motif — the scan line — and all of it switches off automatically when the
system asks for `prefers-reduced-motion`.

Data & artwork from [PokéAPI](https://pokeapi.co/).

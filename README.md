# Pokédex Mini

A small Pokédex made with React and Vite. There is no backend, every screen reads straight from
PokéAPI.

**Live demo:** https://imanuelvincencia16-hub.github.io/pokedex-mini/

## What's in it

- A list of the first 20 Pokémon, each row showing its sprite, dex number and name
- A search box that takes you to the detail page. If the box is empty it just says so, so no useless
  request goes out
- A detail page with the official artwork, the types, and the six base stats
- A 404 page for any other URL

The detail page takes its colours from the Pokémon you are looking at, so Charizard is orange and
Blastoise is blue. Those are the official type colours.

## How it works

`SearchForm` only decides where to send you. Whether that Pokémon actually exists is answered by
`DetailPage`, which owns the fetch. The list fetches once when it mounts, and the detail page refetches
whenever the name in the URL changes. It keeps an `isCurrent` flag so a slow response for a page you
already left cannot overwrite the screen.

Routing runs on `HashRouter` and `vite.config.js` sets `base: "/pokedex-mini/"`. That pair is what
makes refreshing a detail URL still work on GitHub Pages, which cannot rewrite a path back to
`index.html` the way a normal server can.

## Files

```
index.html
vite.config.js           base: "/pokedex-mini/"
src/
├── main.jsx             createRoot + StrictMode
├── App.jsx              HashRouter, Layout, the three routes
├── config.js            API URLs and the 18 type colours
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

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle into dist/
npm run lint     # oxlint
```

## Deploying

```bash
git add . && git commit -m "..." && git push   # the source
npm run deploy                                  # the live site
```

`predeploy` runs the build for you, then `gh-pages` publishes `dist/` to the `gh-pages` branch. The
Pages source has to point at that branch under **Settings → Pages**. Both commands are needed: pushing
only updates what the instructor reads, deploying only updates what visitors see.

## Changelog

**2026-10-05**

Cut the project back to one design. Gone are the second edition (`design.html`), the silhouette quiz,
the type filters, the favourite team, the day/night theme and all of the sound. `api.js`, `hooks.js`
and `store.jsx` went too, so each component now fetches the way the handout shows.

Checking the pages in the browser turned up three things that looked broken. The artwork on the detail
page was an inline image, so it shared a line with the back link and covered it. The sprites had no
fixed size, so the rows came out at different heights. And the stats printed raw API names like
`special-attack`. All three are fixed.

Then it got colour: the type colours on the detail page, a red Pokédex header band, and a layered
background instead of flat grey. The pill text needed a second pass after measuring it, because mixing
72% type colour into the text gave only 2.4:1 contrast on pale types like electric. At 40% it clears
5.2:1 on all 18 types.

**2026-10-01**

Published a second design at `design.html` with its own entry and stylesheet. Removed on 2026-10-05,
still in the history as commit `b7ac2b5`.

Data and artwork from [PokéAPI](https://pokeapi.co/).

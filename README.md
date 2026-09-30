# Pokédex Mini

Sebuah arsip Pokémon yang terasa seperti perangkat Pokédex sungguhan: data diambil langsung dari
PokéAPI, dan setiap layar mengubah warna aksen, animasi, dan suaranya mengikuti Pokémon yang sedang
dibuka. Dibangun dengan React + Vite, tanpa backend.

**Live demo:** https://<username>.github.io/pokedex-mini/

## Fitur

| Area | Yang bisa dilakukan |
| --- | --- |
| Arsip | 1302 entri, pencarian nama/nomor langsung, filter 18 tipe, urutkan No.↑ No.↓ A–Z, muat tanpa batas |
| Detail | Panggung sprite (artwork · depan · belakang · GIF animasi · shiny), bar statistik beranimasi, ability, flavor text, data fisik, rantai evolusi yang bisa diklik, suara Pokémon |
| Navigasi | Panah `←` `→` pada halaman detail, pagination nomor Pokédex, halaman 404 bertema glitch |
| Kuis | "Siapa Pokémon ini?" — siluet, 10 ronde, timer 20 detik, petunjuk tipe, tombol intip, skor + rangkaian, wilayah Kanto/Nasional |
| Personal | Tim favorit tersimpan di `localStorage`, mode malam/siang, suara bisa dimatikan |

Satu permintaan `/pokemon?limit=1302` memberi seluruh nama + nomor, jadi pencarian, filter, dan
pengurutan berjalan di sisi klien tanpa request tambahan.

## Menjalankan lokal

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # hasil produksi ke dist/
npm run lint     # oxlint
```

## Deploy ke GitHub Pages

```bash
git init
git remote add origin https://github.com/<username>/pokedex-mini.git
git add . && git commit -m "Pokédex Mini" && git branch -M main && git push -u origin main

npm run deploy   # build lalu push dist/ ke branch gh-pages
```

`vite.config.js` memakai `base: "./"` dan router memakai `HashRouter`, jadi situs tetap berfungsi di
path project page GitHub Pages tanpa konfigurasi server tambahan.

## Struktur

```
src/
├── api.js              fetch + cache promise per endpoint
├── config.js           URL API, ukuran halaman, palet 18 tipe
├── hooks.js            useLocalStorage, useDex, usePokemon, useInView, useCountUp
├── store.jsx           tema, suara, favorit, warna aksen aktif
├── utils.js            format, warna tipe, pemilih teks ROM "POKéMON"
├── components/         Layout, SearchBar, TypeChips, PokemonCard, SpriteStage,
│                       StatBar, EvolutionChain, FavButton, Pokeball, Tools
└── pages/              ListPage, DetailPage, QuizPage, NotFoundPage
```

## Catatan desain

Aksen warna selalu berasal dari tipe Pokémon atau filter yang aktif, lalu mengalir ke latar, cincin
panggung, bar statistik, dan tombol. Teks di atas warna aksen dihitung dari luminansinya
(`readableOn`) agar tetap terbaca pada tipe terang seperti Electric. Semua animasi punya motif yang
sama — garis pindai (scan line) — dan otomatis nonaktif saat sistem meminta `prefers-reduced-motion`.

Data & artwork dari [PokéAPI](https://pokeapi.co/).

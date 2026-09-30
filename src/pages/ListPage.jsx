import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getType } from "../api.js";
import { DEFAULT_ACCENT, DEX_SIZE, PAGE_SIZE } from "../config.js";
import { useDex } from "../hooks.js";
import { useStore } from "../store.jsx";
import { capitalize, typeColor } from "../utils.js";
import SearchBar from "../components/SearchBar.jsx";
import TypeChips from "../components/TypeChips.jsx";
import PokemonCard from "../components/PokemonCard.jsx";
import Pokeball from "../components/Pokeball.jsx";

const SORTS = {
  id: (a, b) => a.id - b.id,
  name: (a, b) => a.name.localeCompare(b.name),
  number: (a, b) => b.id - a.id,
};

function ListPage() {
  const navigate = useNavigate();
  const { dex, error } = useDex();
  const { favorites, setAccent } = useStore();

  const [query, setQuery] = useState("");
  const [type, setType] = useState(null);
  const [typeNames, setTypeNames] = useState(null);
  const [typeLoading, setTypeLoading] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sort, setSort] = useState("id");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setAccent(type ? typeColor(type) : DEFAULT_ACCENT);
  }, [type, setAccent]);

  useEffect(() => {
    document.title = "Pokédex · National Archive";
  }, []);

  useEffect(() => {
    if (!type) {
      setTypeNames(null);
      return undefined;
    }
    let active = true;
    setTypeLoading(true);
    setTypeNames(null);

    getType(type).then((data) => {
      if (!active) return;
      setTypeNames(new Set(data.pokemon.map((entry) => entry.pokemon.name)));
      setTypeLoading(false);
    });

    return () => {
      active = false;
    };
  }, [type]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase().replace(/^#/, "");
    const isNumeric = /^\d+$/.test(term);

    const list = dex.filter((entry) => {
      if (type && !typeNames?.has(entry.name)) return false;
      if (onlyFavorites && !favorites.includes(entry.name)) return false;
      if (!term) return true;
      return isNumeric ? String(entry.id).startsWith(term) : entry.name.includes(term);
    });

    return list.sort(SORTS[sort]);
  }, [dex, query, type, typeNames, onlyFavorites, favorites, sort]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query, type, onlyFavorites, sort]);

  const hasMore = filtered.length > visible;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible((value) => value + PAGE_SIZE),
      { rootMargin: "600px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, filtered.length]);

  const shown = filtered.slice(0, visible);

  function openFirst() {
    if (filtered.length) navigate(`/pokemon/${filtered[0].name}`);
  }

  if (error) {
    return (
      <div className="state">
        <Pokeball className="state__ball" />
        <h2>The archive is unreachable</h2>
        <p className="state__note">{error}</p>
        <button type="button" className="btn" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  if (!dex.length) {
    return (
      <div className="state">
        <Pokeball spinning className="state__ball" />
        <h2>Syncing the archive…</h2>
        <p className="state__note">Fetching {DEX_SIZE} entries from PokéAPI.</p>
      </div>
    );
  }

  return (
    <section className="dex">
      <div className="dex__top">
        <SearchBar
          value={query}
          onChange={setQuery}
          onEnter={openFirst}
          matches={typeLoading ? "…" : filtered.length}
          total={dex.length}
        />

        <div className="dex__bar">
          <button
            type="button"
            className={`toggle${onlyFavorites ? " is-on" : ""}`}
            onClick={() => setOnlyFavorites((value) => !value)}
          >
            ★ My team
            <span className="toggle__badge">{favorites.length}</span>
          </button>

          <div className="sorter" role="group" aria-label="Sort entries">
            <button type="button" className={sort === "id" ? "is-on" : ""} onClick={() => setSort("id")}>
              No. ↑
            </button>
            <button type="button" className={sort === "number" ? "is-on" : ""} onClick={() => setSort("number")}>
              No. ↓
            </button>
            <button type="button" className={sort === "name" ? "is-on" : ""} onClick={() => setSort("name")}>
              A–Z
            </button>
          </div>
        </div>

        <TypeChips active={type} onChange={setType} />
      </div>

      {typeLoading ? (
        <div className="state">
          <Pokeball spinning className="state__ball" />
          <h2>Scanning {capitalize(type)} type…</h2>
          <p className="state__note">Pulling this type&apos;s roster from PokéAPI.</p>
        </div>
      ) : shown.length > 0 ? (
        <ul className="grid">
          {shown.map((entry, index) => (
            <PokemonCard key={entry.name} pokemon={entry} index={index} />
          ))}
        </ul>
      ) : (
        <div className="state state--empty">
          <h2>Nothing matched</h2>
          <p className="state__note">
            Try clearing the type filter, or double-check how the name is spelled.
          </p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setQuery("");
              setType(null);
              setOnlyFavorites(false);
            }}
          >
            Reset filters
          </button>
        </div>
      )}

      {hasMore && (
        <div className="more" ref={sentinelRef}>
          <button type="button" className="btn btn--ghost" onClick={() => setVisible((value) => value + PAGE_SIZE)}>
            Show {Math.min(PAGE_SIZE, filtered.length - visible)} more entries
          </button>
        </div>
      )}
    </section>
  );
}

export default ListPage;

import { useEffect, useMemo, useState } from "react";
import { getType } from "../api.js";
import { DEFAULT_ACCENT, DEX_SIZE, PAGE_SIZE, TYPES } from "../config.js";
import { useDex, useInView } from "../hooks.js";
import Notice from "./Notice.jsx";
import {
  capitalize,
  getArtworkUrl,
  pad3,
  readableOn,
  typeColor,
} from "../utils.js";

const SORTS = {
  number: (a, b) => a.id - b.id,
  reverse: (a, b) => b.id - a.id,
  name: (a, b) => a.name.localeCompare(b.name),
};

const SORT_LABELS = [
  ["number", "No. ↑"],
  ["reverse", "No. ↓"],
  ["name", "A-Z"],
];

export default function Roster({ mode, team, onModeChange, onOpen, onToggleTeam, setAccent }) {
  const { dex, error } = useDex();
  const [query, setQuery] = useState("");
  const [type, setType] = useState(null);
  const [typeNames, setTypeNames] = useState(null);
  const [typeLoading, setTypeLoading] = useState(false);
  const [typeError, setTypeError] = useState(null);
  const [sort, setSort] = useState("number");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [note, setNote] = useState("");

  const onlyTeam = mode === "team";

  useEffect(() => {
    setAccent(type ? typeColor(type) : DEFAULT_ACCENT);
  }, [type, setAccent]);

  useEffect(() => {
    if (!type) {
      setTypeNames(null);
      setTypeError(null);
      return undefined;
    }
    let active = true;
    setTypeLoading(true);
    setTypeNames(null);
    setTypeError(null);

    getType(type)
      .then((data) => {
        if (!active) return;
        setTypeNames(new Set(data.pokemon.map((entry) => entry.pokemon.name)));
        setTypeLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setTypeError(err.message);
        setTypeLoading(false);
      });

    return () => {
      active = false;
    };
  }, [type]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase().replace(/^#/, "");
    const isNumeric = /^\d+$/.test(term);

    return dex
      .filter((entry) => {
        if (onlyTeam && !team.includes(entry.name)) return false;
        if (type && !typeNames?.has(entry.name)) return false;
        if (!term) return true;
        return isNumeric ? String(entry.id).startsWith(term) : entry.name.includes(term);
      })
      .sort(SORTS[sort]);
  }, [dex, query, type, typeNames, onlyTeam, team, sort]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query, type, onlyTeam, sort]);

  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;

  if (error) {
    return (
      <Notice
        mark="Press fault"
        title="The archive is unreachable"
        text={error}
        action="Reprint the page"
        onAction={() => window.location.reload()}
      />
    );
  }

  if (!dex.length) {
    return (
      <Notice
        mark="Warming up the press"
        title={`Setting ${DEX_SIZE.toLocaleString("en-US")} sheets`}
        text="Fetching the national roster from PokéAPI."
      />
    );
  }

  const heading = onlyTeam ? "Field team" : type ? capitalize(type) : "National roster";
  const subLabel = onlyTeam
    ? `${filtered.length} stamped ${filtered.length === 1 ? "sheet" : "sheets"}`
    : `${typeLoading ? "…" : filtered.length.toLocaleString("en-US")} of ${DEX_SIZE.toLocaleString("en-US")} sheets`;

  return (
    <section className="roster">
      <header className="sheet-bar">
        <div>
          <p className="eyebrow">
            <strong>No. 01</strong> · {subLabel}
          </p>
          <h2 className="sheet-title">
            {heading}
            {query.trim() && <em> · {query.trim()}</em>}
          </h2>
        </div>

        <div className="sort" role="group" aria-label="Sort sheets">
          {SORT_LABELS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={sort === key ? "is-on" : ""}
              onClick={() => setSort(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <form
        className="query"
        onSubmit={(event) => {
          event.preventDefault();
          const term = query.trim();

          if (term === "") {
            setNote("Type a name or a dex number first.");
            return;
          }

          if (!filtered.length) {
            setNote(`Nothing matches “${term}”. Check the spelling.`);
            return;
          }

          setNote("");
          onOpen(filtered[0].name);
        }}
      >
        <label className="query__icon" htmlFor="roster-query">
          Search
        </label>
        <input
          id="roster-query"
          className="query__input"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setNote("");
          }}
          placeholder="name or dex number"
          autoComplete="off"
        />
        {query ? (
          <button type="button" className="query__hint" onClick={() => setQuery("")}>
            clear
          </button>
        ) : (
          <span className="query__hint">type to filter</span>
        )}
        <button type="submit" className="query__go">
          Open first
        </button>
      </form>

      {note && <p className="query__note">{note}</p>}

      <div className="stamps">
        <button
          type="button"
          className={`stamp-chip${type === null ? " is-on" : ""}`}
          style={{ "--chip": DEFAULT_ACCENT, "--on-chip": "#ffffff" }}
          onClick={() => setType(null)}
        >
          All types
        </button>
        {TYPES.map((name) => {
          const color = typeColor(name);
          return (
            <button
              key={name}
              type="button"
              className={`stamp-chip${type === name ? " is-on" : ""}`}
              style={{ "--chip": color, "--on-chip": readableOn(color) }}
              onClick={() => setType((current) => (current === name ? null : name))}
            >
              <span className="stamp-chip__dot" aria-hidden="true" />
              {name}
            </button>
          );
        })}
      </div>

      {typeError ? (
        <Notice
          mark="Jam in the feeder"
          title={`The ${capitalize(type)} roster will not load`}
          text={typeError}
          action="Clear the type filter"
          onAction={() => setType(null)}
        />
      ) : typeLoading ? (
        <Notice mark="Counting" title={`Sorting the ${capitalize(type)} shelf`} text="Pulling this type's roster from PokéAPI." />
      ) : shown.length ? (
        <ul className="plates">
          {shown.map((entry, index) => (
            <PlateCard
              key={entry.name}
              pokemon={entry}
              index={index}
              isTeam={team.includes(entry.name)}
              onOpen={onOpen}
              onToggleTeam={onToggleTeam}
            />
          ))}
        </ul>
      ) : onlyTeam ? (
        <Notice
          mark="Blank page"
          title="No sheets stamped yet"
          text="Tap the star in the corner of any card and it lands here, saved on this device."
          action="Back to the roster"
          onAction={() => onModeChange("all")}
        />
      ) : (
        <Notice
          mark="Blank page"
          title="Nothing matched"
          text="Clear the type filter, or double-check how the name is spelled."
          action="Reset the press"
          onAction={() => {
            setQuery("");
            setType(null);
            onModeChange("all");
          }}
        />
      )}

      {hasMore && !typeLoading && !typeError && (
        <div className="more">
          <button
            type="button"
            className="action action--ghost"
            onClick={() => setVisible((value) => value + PAGE_SIZE)}
          >
            Print {Math.min(PAGE_SIZE, filtered.length - visible)} more sheets
          </button>
        </div>
      )}
    </section>
  );
}

function PlateCard({ pokemon, index, isTeam, onOpen, onToggleTeam }) {
  const [ref, inView] = useInView({ rootMargin: "120px" });
  const tilt = ((((pokemon.id * 7) % 5) - 2) * 0.55).toFixed(2);
  const label = capitalize(pokemon.name);

  return (
    <li
      ref={ref}
      className={`plate-card${inView ? " plate-card--in" : ""}${isTeam ? " is-team" : ""}`}
      style={{ "--tilt": `${tilt}deg`, "--delay": `${(index % 18) * 40}ms` }}
    >
      <a
        className="plate-card__face"
        href={`#/entry/${pokemon.name}`}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          onOpen(pokemon.name);
        }}
      >
        <span className="plate-card__no">No. {pad3(pokemon.id)}</span>
        <span className="plate-card__disc">
          <img
            className="plate-card__img"
            src={getArtworkUrl(pokemon.id)}
            alt=""
            width={96}
            height={96}
            loading="lazy"
            onError={(event) => {
              event.target.style.visibility = "hidden";
            }}
          />
        </span>
        <span className="plate-card__name">{label}</span>
        <span className="plate-card__rule" aria-hidden="true" />
      </a>

      <button
        type="button"
        className={`fav-stamp${isTeam ? " is-on" : ""}`}
        onClick={() => onToggleTeam(pokemon.name)}
        title={isTeam ? `Remove ${label} from the field team` : `Stamp ${label} onto the field team`}
        aria-label={isTeam ? `Remove ${label} from the field team` : `Add ${label} to the field team`}
        aria-pressed={isTeam}
      >
        ★
      </button>
    </li>
  );
}

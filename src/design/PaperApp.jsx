import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_ACCENT, DEX_SIZE } from "../config.js";
import { useDex, useLocalStorage } from "../hooks.js";
import { capitalize, getSpriteUrl, pad3 } from "../utils.js";
import EntrySpread from "./EntrySpread.jsx";
import Notice from "./Notice.jsx";
import Roster from "./Roster.jsx";

const THEME_KEY = "pokedex-paper:theme";
const TEAM_KEY = "pokedex-paper:team";

function routeFromHash() {
  const hash = window.location.hash;
  const entry = hash.match(/^#\/entry\/([^/?#]+)/);
  if (entry) return { name: "entry", slug: decodeURIComponent(entry[1]) };
  if (hash === "#/roster/team") return { name: "roster", mode: "team" };
  if (["", "#", "#/", "#/roster", "#/roster/all"].includes(hash)) {
    return { name: "roster", mode: "all" };
  }
  return { name: "notfound", hash };
}

export default function PaperApp() {
  const [route, setRoute] = useState(routeFromHash);
  const [theme, setTheme] = useLocalStorage(THEME_KEY, "day");
  const [team, setTeam] = useLocalStorage(TEAM_KEY, []);
  const [accent, setAccent] = useState(DEFAULT_ACCENT);
  const { dex } = useDex();

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const go = useCallback((hash) => {
    window.location.hash = hash;
    setRoute(routeFromHash());
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const open = useCallback((name) => go(`#/entry/${name}`), [go]);
  const showRoster = useCallback((mode) => go(`#/roster/${mode}`), [go]);

  const toggleTeam = useCallback(
    (name) => {
      setTeam((current) =>
        current.includes(name) ? current.filter((entry) => entry !== name) : [...current, name],
      );
    },
    [setTeam],
  );

  const teamEntries = useMemo(
    () =>
      team
        .map((name) => dex.find((entry) => entry.name === name))
        .filter((entry) => Boolean(entry)),
    [team, dex],
  );

  return (
    <div className="paper" data-theme={theme} style={{ "--accent": accent }}>
      <div className="paper__grain" aria-hidden="true" />
      <div className="paper__edge" aria-hidden="true" />

      <div className="paper__frame">
        <Rail
          route={route}
          dex={dex}
          team={team}
          teamEntries={teamEntries}
          theme={theme}
          onTheme={setTheme}
          onShowRoster={showRoster}
          onOpen={open}
        />

        <main className="sheet">
          {route.name === "entry" ? (
            <EntrySpread
              slug={route.slug}
              team={team}
              onOpen={open}
              onBack={() => showRoster("all")}
              onToggleTeam={toggleTeam}
              setAccent={setAccent}
            />
          ) : route.name === "roster" ? (
            <Roster
              mode={route.mode}
              team={team}
              onModeChange={showRoster}
              onOpen={open}
              onToggleTeam={toggleTeam}
              setAccent={setAccent}
            />
          ) : (
            <Notice
              mark="Misprint"
              title="There is nothing at this address"
              text={`“${route.hash.replace(/^#/, "")}” is not a page in this field guide.`}
              action="Back to the roster"
              onAction={() => showRoster("all")}
            />
          )}

          <footer className="colophon">
            <span>Field Guide edition · set in Archivo Black, Newsreader and Space Mono</span>
            <span>Data and artwork · PokéAPI</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

function Rail({
  route,
  dex,
  team,
  teamEntries,
  theme,
  onTheme,
  onShowRoster,
  onOpen,
}) {
  const [number, setNumber] = useState("");
  const [note, setNote] = useState(null);

  function jump(event) {
    event.preventDefault();
    const id = Number(number);
    if (!Number.isInteger(id) || id < 1 || id > DEX_SIZE) {
      setNote("Numbers run from 1 to " + DEX_SIZE + ".");
      return;
    }
    const entry = dex.find((item) => item.id === id);
    if (!entry) {
      setNote("Nothing catalogued at No. " + pad3(id) + " yet.");
      return;
    }
    setNote(null);
    setNumber("");
    onOpen(entry.name);
  }

  return (
    <aside className="rail">
      <div>
        <p className="masthead__kicker">Pokédex Mini · Edition 02</p>
        <h1 className="masthead__title">
          Field<span>Guide</span>
        </h1>
        <div className="masthead__rule" />
      </div>

      <div className="rail__block">
        <p className="rail__label">Index</p>
        <nav className="rail__nav">
          <button
            type="button"
            className={`rail__link${route.name === "roster" && route.mode === "all" ? " is-on" : ""}`}
            onClick={() => onShowRoster("all")}
          >
            National roster
            <span className="rail__count">{dex.length || "…"}</span>
          </button>
          <button
            type="button"
            className={`rail__link${route.name === "roster" && route.mode === "team" ? " is-on" : ""}`}
            onClick={() => onShowRoster("team")}
          >
            Field team
            <span className="rail__count">{team.length}</span>
          </button>
        </nav>
      </div>

      <div className="rail__block">
        <p className="rail__label">Stamped</p>
        {teamEntries.length ? (
          <div className="team">
            {teamEntries.map((entry) => (
              <button
                key={entry.name}
                type="button"
                className="team__stamp"
                onClick={() => onOpen(entry.name)}
                title={`No. ${pad3(entry.id)} ${capitalize(entry.name)}`}
              >
                <img src={getSpriteUrl(entry.id)} alt="" width={34} height={34} loading="lazy" />
              </button>
            ))}
          </div>
        ) : (
          <p className="team__empty">
            Nothing stamped yet. Tap the star on any sheet to build a team of six.
          </p>
        )}
      </div>

      <div className="rail__block">
        <p className="rail__label">Jump to a dex number</p>
        <form className="jump" onSubmit={jump}>
          <input
            className="jump__input"
            value={number}
            onChange={(event) => {
              setNumber(event.target.value);
              setNote(null);
            }}
            inputMode="numeric"
            placeholder="001"
            aria-label="Dex number"
            disabled={!dex.length}
          />
          <button type="submit" className="jump__go" disabled={!dex.length}>
            Open
          </button>
        </form>
        {note && <p className="jump__note">{note}</p>}
      </div>

      <div className="rail__block">
        <p className="rail__label">Paper stock</p>
        <div className="switch">
          <button
            type="button"
            className={theme === "night" ? "" : " is-on"}
            onClick={() => onTheme("day")}
          >
            Day
          </button>
          <button
            type="button"
            className={theme === "night" ? " is-on" : ""}
            onClick={() => onTheme("night")}
          >
            Night
          </button>
        </div>
      </div>

      <div className="rail__foot">
        <span>Prefer the glow? Open the HUD edition.</span>
        <a href="./index.html">HUD edition ↗</a>
      </div>
    </aside>
  );
}

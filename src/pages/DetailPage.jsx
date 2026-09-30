import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getEvolutionChain, getSpecies } from "../api.js";
import { DEFAULT_ACCENT } from "../config.js";
import { useDex, usePokemon } from "../hooks.js";
import { useStore } from "../store.jsx";
import {
  accentOf,
  capitalize,
  cleanFlavor,
  formatKilograms,
  formatMeters,
  pad3,
  typeColor,
} from "../utils.js";
import SpriteStage from "../components/SpriteStage.jsx";
import StatBar from "../components/StatBar.jsx";
import EvolutionChain from "../components/EvolutionChain.jsx";
import FavButton from "../components/FavButton.jsx";
import Pokeball from "../components/Pokeball.jsx";

function Measure({ label, value, ratio }) {
  return (
    <div className="measure">
      <div className="measure__head">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <span className="measure__track">
        <span className="measure__fill" style={{ "--ratio": `${Math.min(100, ratio * 100)}%` }} />
      </span>
    </div>
  );
}

function DetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { pokemon, error, isLoading } = usePokemon(slug);
  const { dex } = useDex();
  const { setAccent, playCry, soundOn } = useStore();
  const [species, setSpecies] = useState(null);
  const [chain, setChain] = useState(null);

  useEffect(() => {
    setAccent(pokemon ? accentOf(pokemon.types) : DEFAULT_ACCENT);
  }, [pokemon, setAccent]);

  useEffect(() => {
    document.title = pokemon
      ? `${capitalize(pokemon.name)} · Pokédex`
      : "Pokédex · National Archive";
  }, [pokemon]);

  useEffect(() => {
    if (!pokemon) {
      setSpecies(null);
      setChain(null);
      return undefined;
    }

    let active = true;
    setSpecies(null);
    setChain(null);

    getSpecies(pokemon.id)
      .then((data) => {
        if (!active) return null;
        setSpecies(data);
        return getEvolutionChain(data.evolution_chain.url);
      })
      .then((evolution) => {
        if (active && evolution) setChain(evolution.chain);
      })
      .catch(() => {
        // Species and evolution are bonus context; the page works without them.
      });

    return () => {
      active = false;
    };
  }, [pokemon]);

  const neighbours = useMemo(() => {
    if (!pokemon || !dex.length) return { prev: null, next: null };
    const index = dex.findIndex((entry) => entry.id === pokemon.id);
    return {
      prev: index > 0 ? dex[index - 1] : null,
      next: index >= 0 && index < dex.length - 1 ? dex[index + 1] : null,
    };
  }, [pokemon, dex]);

  useEffect(() => {
    function onKey(event) {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key === "ArrowLeft" && neighbours.prev) navigate(`/pokemon/${neighbours.prev.name}`);
      if (event.key === "ArrowRight" && neighbours.next) navigate(`/pokemon/${neighbours.next.name}`);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [neighbours, navigate]);

  if (isLoading) {
    return (
      <div className="state">
        <Pokeball spinning className="state__ball" />
        <h2>Scanning “{slug}”…</h2>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="state">
        <Pokeball className="state__ball" />
        <h2>Entry not found</h2>
        <p className="state__note">
          There is no Pokémon named or numbered “{slug}”. Check the spelling and try again.
        </p>
        <Link to="/" className="btn">
          ← Back to the archive
        </Link>
      </div>
    );
  }

  const flavor = species?.flavor_text_entries?.find((entry) => entry.language.name === "en");
  const genus = species?.genera?.find((entry) => entry.language.name === "en")?.genus;
  const total = pokemon.stats.reduce((sum, entry) => sum + entry.base_stat, 0);
  const cryUrl = pokemon.cries?.latest;

  return (
    <article className="detail">
      <header className="detail__bar">
        <Link to="/" className="crumb">
          ← Archive
        </Link>
        <div className="pager">
          <button
            type="button"
            className="pager__btn"
            disabled={!neighbours.prev}
            onClick={() => navigate(`/pokemon/${neighbours.prev.name}`)}
            title={neighbours.prev ? `Previous: ${capitalize(neighbours.prev.name)}` : "First entry"}
          >
            ‹
          </button>
          <span className="pager__id">#{pad3(pokemon.id)}</span>
          <button
            type="button"
            className="pager__btn"
            disabled={!neighbours.next}
            onClick={() => navigate(`/pokemon/${neighbours.next.name}`)}
            title={neighbours.next ? `Next: ${capitalize(neighbours.next.name)}` : "Last entry"}
          >
            ›
          </button>
        </div>
      </header>

      <section className="hero">
        <SpriteStage pokemon={pokemon} />

        <div className="hero__meta">
          <h2 className="hero__name">{capitalize(pokemon.name)}</h2>
          {genus && <p className="hero__genus">{genus}</p>}

          <div className="badges">
            {pokemon.types.map((entry) => (
              <span
                key={entry.type.name}
                className="badge"
                style={{ "--chip": typeColor(entry.type.name) }}
              >
                {capitalize(entry.type.name)}
              </span>
            ))}
          </div>

          {flavor && <p className="hero__flavor">{cleanFlavor(flavor.flavor_text)}</p>}

          <div className="hero__actions">
            <FavButton pokemon={pokemon} />
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => playCry(cryUrl)}
              disabled={!cryUrl}
              title={soundOn ? "Play this Pokémon's cry" : "Sound is muted"}
            >
              ♪ Cry{soundOn ? "" : " (muted)"}
            </button>
          </div>
        </div>
      </section>

      <div className="panels">
        <section className="panel">
          <h3 className="panel__title">Base stats</h3>
          <ul className="stats">
            {pokemon.stats.map((entry, index) => (
              <StatBar
                key={entry.stat.name}
                stat={entry.stat.name}
                value={entry.base_stat}
                delay={index * 70}
              />
            ))}
          </ul>
          <p className="panel__foot">
            Total <strong>{total}</strong>
          </p>
        </section>

        <section className="panel">
          <h3 className="panel__title">Physical data</h3>
          <Measure label="Height" value={formatMeters(pokemon.height)} ratio={pokemon.height / 140} />
          <Measure label="Weight" value={formatKilograms(pokemon.weight)} ratio={Math.sqrt(pokemon.weight / 999)} />

          <dl className="facts">
            <div>
              <dt>Base experience</dt>
              <dd>{pokemon.base_experience ?? "—"}</dd>
            </div>
            <div>
              <dt>Growth rate</dt>
              <dd>{species ? capitalize(species.growth_rate.name) : "—"}</dd>
            </div>
            <div>
              <dt>Capture rate</dt>
              <dd>{species?.capture_rate ?? "—"}</dd>
            </div>
            <div>
              <dt>Habitat</dt>
              <dd>{species?.habitat ? capitalize(species.habitat.name) : "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="panel">
          <h3 className="panel__title">Abilities</h3>
          <ul className="abilities">
            {pokemon.abilities.map((entry) => (
              <li key={entry.ability.name} className={entry.is_hidden ? "is-hidden" : ""}>
                <span>{capitalize(entry.ability.name)}</span>
                <em>{entry.is_hidden ? "hidden" : "regular"}</em>
              </li>
            ))}
          </ul>
          <p className="panel__foot">
            {pokemon.forms.length} {pokemon.forms.length === 1 ? "form" : "forms"} ·{" "}
            {pokemon.moves.length} moves recorded
          </p>
        </section>

        <section className="panel panel--wide">
          <h3 className="panel__title">Evolution chain</h3>
          {chain ? (
            <EvolutionChain chain={chain} currentName={pokemon.name} />
          ) : (
            <p className="state__note">Building the family tree…</p>
          )}
        </section>
      </div>
    </article>
  );
}

export default DetailPage;

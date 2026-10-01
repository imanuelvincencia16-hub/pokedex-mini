import { useEffect, useMemo, useState } from "react";
import { getEvolutionChain, getSpecies } from "../api.js";
import { DEFAULT_ACCENT } from "../config.js";
import { useCountUp, useDex, useInView, usePokemon } from "../hooks.js";
import Notice from "./Notice.jsx";
import {
  accentOf,
  capitalize,
  cleanFlavor,
  formatKilograms,
  formatMeters,
  getSpriteUrl,
  pad3,
  readableOn,
  typeColor,
} from "../utils.js";

const STAT_LABELS = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

function viewsOf(pokemon) {
  const sprites = pokemon.sprites;
  const animated = sprites.versions?.["generation-v"]?.["black-white"]?.animated;
  const artwork = sprites.other?.["official-artwork"]?.front_default;
  const shinyArtwork = sprites.other?.["official-artwork"]?.front_shiny;

  return [
    { key: "artwork", label: "Artwork", src: artwork, pixel: false },
    { key: "front", label: "Front", src: sprites.front_default, pixel: true },
    { key: "back", label: "Back", src: sprites.back_default, pixel: true },
    { key: "animated", label: "Motion", src: animated?.front_default, pixel: true },
    {
      key: "shiny",
      label: "Shiny",
      src: shinyArtwork || sprites.front_shiny || animated?.front_shiny,
      pixel: !shinyArtwork,
    },
  ].filter((view) => Boolean(view.src));
}

function idOf(speciesUrl) {
  return Number(speciesUrl.split("/").filter(Boolean).pop());
}

// Evolution arrives nested; one level per column keeps branching families like
// Eevee stacked instead of sprawling sideways.
function stagesOf(node) {
  const stages = [];
  let level = [node];

  while (level.length) {
    stages.push(
      level.map((entry) => ({
        name: entry.species.name,
        id: idOf(entry.species.url),
        hint: triggerOf(entry.evolution_details?.[0]),
      })),
    );
    level = level.flatMap((entry) => entry.evolves_to || []);
  }

  return stages;
}

function triggerOf(detail) {
  if (!detail) return null;
  if (detail.min_level) return `Lv ${detail.min_level}`;
  const item = detail.min_items?.[0]?.name;
  if (item) return capitalize(item);
  const trigger = detail.trigger?.name;
  if (trigger && trigger !== "level-up") return capitalize(trigger);
  return null;
}

function playCry(url) {
  if (!url || typeof Audio === "undefined") return;
  const audio = new Audio(url);
  audio.volume = 0.32;
  audio.play().catch(() => {
    // Some builds have no .ogg codec; silence beats an unhandled rejection.
  });
}

export default function EntrySpread({ slug, team, onOpen, onBack, onToggleTeam, setAccent }) {
  const { pokemon, error, isLoading } = usePokemon(slug);
  const { dex } = useDex();
  const [species, setSpecies] = useState(null);
  const [chain, setChain] = useState(null);
  const [view, setView] = useState("artwork");

  useEffect(() => {
    setView("artwork");
  }, [slug]);

  useEffect(() => {
    setAccent(pokemon ? accentOf(pokemon.types) : DEFAULT_ACCENT);
  }, [pokemon, setAccent]);

  useEffect(() => {
    document.title = pokemon
      ? `${capitalize(pokemon.name)} · Field Guide`
      : "Pokédex · Field Guide edition";
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
        // Genus, flavor text and family are extras; the sheet still reads fine.
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
      if (event.key === "ArrowLeft" && neighbours.prev) onOpen(neighbours.prev.name);
      if (event.key === "ArrowRight" && neighbours.next) onOpen(neighbours.next.name);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [neighbours, onOpen]);

  if (isLoading) {
    return (
      <Notice mark="On the press" title={`Inking No. ${slug}`} text="Fetching this sheet from PokéAPI." />
    );
  }

  if (error || !pokemon) {
    return (
      <Notice
        mark="Misprint"
        title="Entry not found"
        text={`There is no Pokémon named or numbered “${slug}”. Check the spelling and try again.`}
        action="Back to the roster"
        onAction={onBack}
      />
    );
  }

  const views = viewsOf(pokemon);
  const active = views.find((entry) => entry.key === view) ?? views[0];
  const flavor = species?.flavor_text_entries?.find((entry) => entry.language.name === "en");
  const genus = species?.genera?.find((entry) => entry.language.name === "en")?.genus;
  const total = pokemon.stats.reduce((sum, entry) => sum + entry.base_stat, 0);
  const name = capitalize(pokemon.name);
  const inTeam = team.includes(pokemon.name);
  const stages = chain ? stagesOf(chain) : null;

  return (
    <article className="spread-page">
      <button type="button" className="backlink" onClick={onBack}>
        ← Back to the roster
      </button>

      <section className="spread">
        <figure className="plate">
          <span className="plate__corner plate__corner--tl" aria-hidden="true" />
          <span className="plate__corner plate__corner--tr" aria-hidden="true" />
          <span className="plate__corner plate__corner--bl" aria-hidden="true" />
          <span className="plate__corner plate__corner--br" aria-hidden="true" />

          <div className="plate__figure">
            <img
              key={`${pokemon.id}-${active.key}`}
              className={`plate__img${active.pixel ? " plate__img--pixel" : ""}`}
              src={active.src}
              alt={`${name}, ${active.label.toLowerCase()} view`}
              width={240}
              height={240}
              onError={(event) => {
                event.target.style.visibility = "hidden";
              }}
            />
          </div>

          <span className="plate__stamp">Verified entry</span>

          <figcaption className="views">
            {views.map((entry) => (
              <button
                key={entry.key}
                type="button"
                className={entry.key === active.key ? "is-on" : ""}
                onClick={() => setView(entry.key)}
              >
                {entry.label}
              </button>
            ))}
          </figcaption>
        </figure>

        <div>
          <p className="entry-no">{pad3(pokemon.id)}</p>
          <h2 className="entry-name">{name}</h2>
          {genus && <p className="entry-genus">{genus}</p>}

          <ul className="types">
            {pokemon.types.map((entry) => {
              const color = typeColor(entry.type.name);
              return (
                <li
                  key={entry.type.name}
                  className="type"
                  style={{ "--chip": color, "--on-chip": readableOn(color) }}
                >
                  {capitalize(entry.type.name)}
                </li>
              );
            })}
          </ul>

          {flavor && <p className="entry-flavor">{cleanFlavor(flavor.flavor_text)}</p>}

          <div className="entry-actions">
            <button
              type="button"
              className={`action${inTeam ? "" : " action--ghost"}`}
              onClick={() => onToggleTeam(pokemon.name)}
            >
              {inTeam ? "★ On the field team" : "☆ Stamp to field team"}
            </button>
            <button
              type="button"
              className="action action--ghost"
              onClick={() => playCry(pokemon.cries?.latest)}
              disabled={!pokemon.cries?.latest}
            >
              ♪ Play cry
            </button>

            <div className="pager">
              <button
                type="button"
                disabled={!neighbours.prev}
                onClick={() => onOpen(neighbours.prev.name)}
                title={neighbours.prev ? `Previous: ${capitalize(neighbours.prev.name)}` : "First entry"}
              >
                ‹
              </button>
              <span>{pad3(pokemon.id)}</span>
              <button
                type="button"
                disabled={!neighbours.next}
                onClick={() => onOpen(neighbours.next.name)}
                title={neighbours.next ? `Next: ${capitalize(neighbours.next.name)}` : "Last entry"}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="panels">
        <section className="panel">
          <h3 className="panel__title">Base stats</h3>
          <ul className="bars">
            {pokemon.stats.map((entry, index) => (
              <Bar key={entry.stat.name} stat={entry.stat.name} value={entry.base_stat} delay={index * 70} />
            ))}
          </ul>
          <p className="panel__foot">
            Total <strong>{total}</strong> · highest <strong>{highest(pokemon.stats)}</strong>
          </p>
        </section>

        <section className="panel">
          <h3 className="panel__title">Specimen data</h3>
          <Measure label="Height" value={formatMeters(pokemon.height)} ratio={pokemon.height / 140} />
          <Measure
            label="Weight"
            value={formatKilograms(pokemon.weight)}
            ratio={Math.sqrt(pokemon.weight / 999)}
          />

          <dl className="specimens">
            <div className="specimen">
              <dt>Base experience</dt>
              <dd>{pokemon.base_experience ?? "n/a"}</dd>
            </div>
            <div className="specimen">
              <dt>Growth rate</dt>
              <dd>{species ? capitalize(species.growth_rate.name) : "…"}</dd>
            </div>
            <div className="specimen">
              <dt>Capture rate</dt>
              <dd>{species?.capture_rate ?? "…"}</dd>
            </div>
            <div className="specimen">
              <dt>Habitat</dt>
              <dd>{species?.habitat ? capitalize(species.habitat.name) : "Unknown"}</dd>
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
            <strong>{pokemon.forms.length}</strong> {pokemon.forms.length === 1 ? "form" : "forms"} ·{" "}
            <strong>{pokemon.moves.length}</strong> moves recorded
          </p>
        </section>

        <section className="panel panel--wide">
          <h3 className="panel__title">Evolution family</h3>
          {stages ? (
            <ul className="family">
              {stages.map((stage, stageIndex) => (
                <li className="family__stage" key={stageIndex}>
                  <div className="family__column">
                    {stage.map((member) => (
                      <button
                        key={member.name}
                        type="button"
                        className={`family__node${member.name === pokemon.name ? " is-current" : ""}`}
                        onClick={() => onOpen(member.name)}
                        title={`No. ${pad3(member.id)} ${capitalize(member.name)}`}
                      >
                        <img
                          src={getSpriteUrl(member.id)}
                          alt=""
                          width={58}
                          height={58}
                          loading="lazy"
                          onError={(event) => {
                            event.target.style.visibility = "hidden";
                          }}
                        />
                        <span>{capitalize(member.name)}</span>
                      </button>
                    ))}
                  </div>
                  {stageIndex < stages.length - 1 && (
                    <span className="family__arrow" aria-hidden="true">
                      <span className="family__line" />
                      <span className="family__hint">{stages[stageIndex + 1]?.[0]?.hint}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="notice__text">Drawing the family tree…</p>
          )}
        </section>
      </div>
    </article>
  );
}

function highest(stats) {
  const top = stats.reduce((best, entry) => (entry.base_stat > best.base_stat ? entry : best));
  return STAT_LABELS[top.stat.name] || top.stat.name;
}

function Bar({ stat, value, delay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const shown = useCountUp(value, { start: inView, duration: 750 });

  return (
    <li className="bar" ref={ref}>
      <span className="bar__label">{STAT_LABELS[stat] || stat.replace(/-/g, " ")}</span>
      <span className="bar__track">
        <span className="bar__rule" aria-hidden="true" />
        <span
          className="bar__fill"
          style={{
            "--pct": inView ? `${Math.min(100, (value / 180) * 100)}%` : "0%",
            "--delay": `${delay}ms`,
          }}
        />
      </span>
      <span className="bar__value">{shown}</span>
    </li>
  );
}

function Measure({ label, value, ratio }) {
  return (
    <div className="meters">
      <div className="meters__head">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <span className="meters__track">
        <span className="meters__fill" style={{ "--pct": `${Math.min(100, ratio * 100)}%` }} />
      </span>
    </div>
  );
}

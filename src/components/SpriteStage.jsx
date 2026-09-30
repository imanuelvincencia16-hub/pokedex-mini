import { useMemo, useState } from "react";

function buildViews(pokemon) {
  const sprites = pokemon.sprites;
  const animated = sprites.versions?.["generation-v"]?.["black-white"]?.animated;

  return [
    {
      key: "artwork",
      label: "Artwork",
      src: sprites.other?.["official-artwork"]?.front_default,
      pixel: false,
    },
    { key: "front", label: "Front", src: sprites.front_default, pixel: true },
    { key: "back", label: "Back", src: sprites.back_default, pixel: true },
    { key: "animated", label: "Animated", src: animated?.front_default, pixel: true },
    {
      key: "shiny",
      label: "Shiny",
      src:
        sprites.other?.["official-artwork"]?.front_shiny ||
        sprites.front_shiny ||
        animated?.front_shiny,
      pixel: !sprites.other?.["official-artwork"]?.front_shiny,
    },
  ].filter((view) => Boolean(view.src));
}

function SpriteStage({ pokemon }) {
  const views = useMemo(() => buildViews(pokemon), [pokemon]);
  const [active, setActive] = useState(views[0].key);
  const view = views.find((entry) => entry.key === active) ?? views[0];

  return (
    <figure className={`stage${view.pixel ? " stage--pixel" : ""}${view.key === "shiny" ? " stage--shiny" : ""}`}>
      <span className="stage__ring" aria-hidden="true" />
      <span className="stage__ring stage__ring--slow" aria-hidden="true" />

      <img
        key={`${pokemon.id}-${view.key}`}
        className="stage__img"
        src={view.src}
        alt={`${pokemon.name} (${view.label.toLowerCase()} view)`}
        width={220}
        height={220}
        onError={(event) => {
          event.target.style.visibility = "hidden";
        }}
      />

      <span className="stage__scan" aria-hidden="true" />

      <figcaption className="stage__tabs">
        {views.map((entry) => (
          <button
            key={entry.key}
            type="button"
            className={`stage__tab${entry.key === view.key ? " is-on" : ""}`}
            onClick={() => setActive(entry.key)}
          >
            {entry.label}
          </button>
        ))}
      </figcaption>
    </figure>
  );
}

export default SpriteStage;

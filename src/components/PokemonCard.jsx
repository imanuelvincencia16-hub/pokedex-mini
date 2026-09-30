import { Link } from "react-router-dom";
import { useInView } from "../hooks.js";
import { capitalize, getSpriteUrl, pad3 } from "../utils.js";
import FavButton from "./FavButton.jsx";

function PokemonCard({ pokemon, index }) {
  const [ref, inView] = useInView({ rootMargin: "120px" });

  return (
    <li
      ref={ref}
      className={`card${inView ? " card--in" : ""}`}
      style={{ "--delay": `${(index % 20) * 45}ms` }}
    >
      <Link className="card__touch" to={`/pokemon/${pokemon.name}`}>
        <span className="card__halo" aria-hidden="true" />
        <img
          className="card__sprite"
          src={getSpriteUrl(pokemon.id)}
          alt={pokemon.name}
          width={76}
          height={76}
          loading="lazy"
          onError={(event) => {
            event.target.style.visibility = "hidden";
          }}
        />
        <span className="card__name">{capitalize(pokemon.name)}</span>
        <span className="card__id">#{pad3(pokemon.id)}</span>
        <span className="card__scan" aria-hidden="true" />
      </Link>
      <FavButton pokemon={pokemon} size="sm" />
    </li>
  );
}

export default PokemonCard;

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL, TYPE_COLORS, DEFAULT_ACCENT } from "../config.js";
import { capitalize, formatStatName } from "../utils.js";

function DetailPage() {
  const { name } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadPokemon() {
      setIsLoading(true);
      setError(null);
      setPokemon(null);

      try {
        const response = await fetch(`${API_BASE_URL}/pokemon/${name}`);

        if (!response.ok) {
          throw new Error(`No Pokémon named "${name}". Check the spelling.`);
        }

        const data = await response.json();

        if (isCurrent) {
          setPokemon(data);
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.message);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadPokemon();

    return () => {
      isCurrent = false;
    };
  }, [name]);

  useEffect(() => {
    document.title = pokemon
      ? `${capitalize(pokemon.name)} · PokéDex Mini`
      : "PokéDex Mini";
  }, [pokemon]);

  if (isLoading) return <p className="status">Loading {name}…</p>;
  if (error) return <p className="status status-error">{error}</p>;

  const accent = TYPE_COLORS[pokemon.types[0]?.type.name] ?? DEFAULT_ACCENT;

  return (
    <div className="detail-page" style={{ "--accent": accent }}>
      <Link to="/" className="back-link">
        ← Back to list
      </Link>
      <img
        src={
          pokemon.sprites.other["official-artwork"].front_default ??
          pokemon.sprites.front_default
        }
        alt={pokemon.name}
        width={180}
        height={180}
      />
      <h2>{capitalize(pokemon.name)}</h2>
      <p className="pokemon-types">
        {pokemon.types.map((t) => (
          <span
            key={t.type.name}
            className="type-pill"
            style={{ "--type": TYPE_COLORS[t.type.name] ?? DEFAULT_ACCENT }}
          >
            {capitalize(t.type.name)}
          </span>
        ))}
      </p>
      <ul className="stat-list">
        {pokemon.stats.map((s) => (
          <li key={s.stat.name}>
            <span className="stat-name">{formatStatName(s.stat.name)}</span>
            <span className="stat-value">{s.base_stat}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DetailPage;

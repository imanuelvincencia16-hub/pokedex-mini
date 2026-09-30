import { useStore } from "../store.jsx";

function FavButton({ pokemon, size = "md" }) {
  const { favorites, toggleFavorite } = useStore();
  const active = favorites.includes(pokemon.name);

  return (
    <button
      type="button"
      className={`fav fav--${size}${active ? " is-on" : ""}`}
      aria-pressed={active}
      title={active ? `Remove ${pokemon.name} from your team` : `Save ${pokemon.name} to your team`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(pokemon.name);
      }}
    >
      <span className="fav__mark">{active ? "★" : "☆"}</span>
    </button>
  );
}

export default FavButton;

import { useStore } from "../store.jsx";

function FavButton({ pokemon, size = "md" }) {
  const { favorites, toggleFavorite } = useStore();
  const active = favorites.includes(pokemon.name);

  return (
    <button
      type="button"
      className={`fav fav--${size}${active ? " is-on" : ""}`}
      aria-pressed={active}
      title={active ? `Keluarkan ${pokemon.name} dari tim` : `Simpan ${pokemon.name} ke tim`}
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

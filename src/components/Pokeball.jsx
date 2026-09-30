function Pokeball({ className = "", spinning = false }) {
  return (
    <span
      className={`pokeball ${spinning ? "pokeball--spinning" : ""} ${className}`}
      aria-hidden="true"
    >
      <span className="pokeball__top" />
      <span className="pokeball__band" />
      <span className="pokeball__core" />
    </span>
  );
}

export default Pokeball;

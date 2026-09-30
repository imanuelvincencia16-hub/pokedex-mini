import { useRef } from "react";

function SearchBar({ value, onChange, onEnter, matches, total }) {
  const inputRef = useRef(null);

  function handleSubmit(event) {
    event.preventDefault();
    onEnter();
  }

  return (
    <div className="search">
      <form className="search__form" onSubmit={handleSubmit} role="search">
        <span className="search__icon" aria-hidden="true">
          ⌕
        </span>
        <input
          ref={inputRef}
          className="search__input"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") onChange("");
          }}
          placeholder="Cari nama atau nomor Pokédex…"
          autoComplete="off"
          spellCheck="false"
          aria-label="Cari Pokémon"
        />
        {value && (
          <button type="button" className="search__clear" onClick={() => { onChange(""); inputRef.current?.focus(); }}>
            ✕
          </button>
        )}
        <button type="submit" className="search__go">
          Buka
        </button>
      </form>

      <p className="search__hint">
        <span className="search__count">
          {matches} / {total} entri
        </span>
        {matches > 0 && <span className="search__enter">Enter membuka entri pertama</span>}
      </p>
    </div>
  );
}

export default SearchBar;

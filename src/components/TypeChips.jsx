import { TYPES } from "../config.js";
import { capitalize, typeColor } from "../utils.js";

function TypeChips({ active, onChange }) {
  return (
    <div className="chips" role="group" aria-label="Filter by type">
      <button
        type="button"
        className={`chip${active === null ? " is-on" : ""}`}
        style={{ "--chip": "var(--accent)" }}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {TYPES.map((type) => (
        <button
          key={type}
          type="button"
          className={`chip${active === type ? " is-on" : ""}`}
          style={{ "--chip": typeColor(type) }}
          onClick={() => onChange(active === type ? null : type)}
        >
          <span className="chip__dot" aria-hidden="true" />
          {capitalize(type)}
        </button>
      ))}
    </div>
  );
}

export default TypeChips;

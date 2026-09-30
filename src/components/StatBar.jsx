import { useCountUp, useInView } from "../hooks.js";

const STAT_LABELS = {
  hp: "HP",
  attack: "Serangan",
  defense: "Pertahanan",
  "special-attack": "Serangan Spesial",
  "special-defense": "Pertahanan Spesial",
  speed: "Kecepatan",
};

function StatBar({ stat, value, delay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const shown = useCountUp(value, { start: inView, duration: 800 });

  return (
    <li className="stat" ref={ref}>
      <span className="stat__label">{STAT_LABELS[stat] || capitalizeStat(stat)}</span>
      <span className="stat__track">
        <span
          className="stat__fill"
          style={{
            width: inView ? `${Math.min(100, (value / 180) * 100)}%` : "0%",
            transitionDelay: `${delay}ms`,
          }}
        />
      </span>
      <span className="stat__value">{shown}</span>
    </li>
  );
}

function capitalizeStat(stat) {
  return stat.replace(/-/g, " ");
}

export default StatBar;

import { useCountUp, useInView } from "../hooks.js";

const STAT_LABELS = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Attack",
  "special-defense": "Sp. Defense",
  speed: "Speed",
};

function StatBar({ stat, value, delay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const shown = useCountUp(value, { start: inView, duration: 800 });

  return (
    <li className="stat" ref={ref}>
      <span className="stat__label">{STAT_LABELS[stat] || stat.replace(/-/g, " ")}</span>
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

export default StatBar;

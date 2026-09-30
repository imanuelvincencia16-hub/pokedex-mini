import { Link } from "react-router-dom";
import { capitalize, getSpriteUrl, pad3 } from "../utils.js";

function idOf(speciesUrl) {
  return Number(speciesUrl.split("/").filter(Boolean).pop());
}

// The API nests evolutions; walk one level at a time so branching families
// (Eevee, Tyrogue) end up stacked in the same column.
function toStages(node) {
  const stages = [];
  let level = [node];

  while (level.length) {
    stages.push(
      level.map((entry) => ({
        name: entry.species.name,
        id: idOf(entry.species.url),
        hint: describeTrigger(entry.evolution_details?.[0]),
      })),
    );
    level = level.flatMap((entry) => entry.evolves_to || []);
  }

  return stages;
}

function describeTrigger(detail) {
  if (!detail) return null;
  if (detail.min_level) return `Lv. ${detail.min_level}`;
  const item = detail.min_items?.[0]?.name;
  if (item) return capitalize(item);
  const trigger = detail.trigger?.name;
  if (trigger && trigger !== "level-up") return capitalize(trigger);
  return null;
}

function EvolutionChain({ chain, currentName }) {
  const stages = toStages(chain);

  return (
    <ol className="evo">
      {stages.map((stage, stageIndex) => (
        <li className="evo__stage" key={stageIndex}>
          <div className="evo__column">
            {stage.map((member) => {
              const isCurrent = member.name === currentName;
              return (
                <Link
                  key={member.name}
                  to={`/pokemon/${member.name}`}
                  className={`evo__node${isCurrent ? " is-current" : ""}`}
                  title={`${capitalize(member.name)} · #${pad3(member.id)}`}
                >
                  <img src={getSpriteUrl(member.id)} alt="" width={56} height={56} loading="lazy" onError={(event) => { event.target.style.visibility = "hidden"; }} />
                  <span className="evo__name">{capitalize(member.name)}</span>
                </Link>
              );
            })}
          </div>
          {stageIndex < stages.length - 1 && (
            <span className="evo__arrow" aria-hidden="true">
              <span className="evo__arrow-line" />
              <span className="evo__arrow-hint">{stage[stageIndex + 1]?.[0]?.hint}</span>
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

export default EvolutionChain;

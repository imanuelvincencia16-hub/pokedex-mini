import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPokemon } from "../api.js";
import { useLocalStorage } from "../hooks.js";
import { useStore } from "../store.jsx";
import { capitalize, pad3, typeColor } from "../utils.js";
import Pokeball from "../components/Pokeball.jsx";

const ROUNDS = 10;
const TIME = 20;

const POOLS = {
  kanto: { label: "Kanto", size: 151 },
  // Ids above 1025 are alternate forms (Mega, etc.) - the quiz draws species only.
  national: { label: "National", size: 1025 },
};

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function rank(hits) {
  if (hits >= 9) return "Master Trainer";
  if (hits >= 7) return "Gym Leader";
  if (hits >= 5) return "Pokédex Ranger";
  if (hits >= 3) return "Trainer";
  return "Beginner";
}

function QuizPage() {
  const { setAccent, playCry } = useStore();
  const [best, setBest] = useLocalStorage("pokedex:quiz-best", 0);
  const [pool, setPool] = useState("kanto");
  const [phase, setPhase] = useState("menu");
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(null);
  const [used, setUsed] = useState([]);
  const [answer, setAnswer] = useState("");
  const [verdict, setVerdict] = useState(null);
  const [hinted, setHinted] = useState(false);
  const [left, setLeft] = useState(TIME);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    setAccent("#f4d23c");
    document.title = "Quiz · Who is that Pokémon?";
  }, [setAccent]);

  function draw(taken) {
    setTarget(null);
    const size = POOLS[pool].size;
    let id;
    do {
      id = 1 + Math.floor(Math.random() * size);
    } while (taken.includes(id));
    setUsed([...taken, id]);
    getPokemon(id).then(setTarget);
  }

  function start() {
    setRound(1);
    setScore(0);
    setStreak(0);
    setHits(0);
    setVerdict(null);
    setHinted(false);
    setAnswer("");
    setLeft(TIME);
    setPhase("playing");
    draw([]);
  }

  const settle = useCallback(
    (kind, current) => {
      setVerdict(kind);
      setPhase("answered");
      setAccent(typeColor(current.types[0]?.type.name));

      if (kind !== "correct") {
        setStreak(0);
        return;
      }
      setScore((value) => value + 100 + left * 5 + streak * 15 - (hinted ? 40 : 0));
      setStreak((value) => value + 1);
      setHits((value) => value + 1);
      playCry(current.cries?.latest);
    },
    [left, streak, hinted, playCry, setAccent],
  );

  useEffect(() => {
    if (phase !== "playing") return undefined;
    if (left <= 0) {
      if (target) settle("timeout", target);
      return undefined;
    }
    const timer = setTimeout(() => setLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, left, settle, target]);

  function submit(event) {
    event.preventDefault();
    const guess = normalize(answer);
    if (!guess || !target) return;
    const correct = guess === normalize(target.name) || guess === String(target.id);
    settle(correct ? "correct" : "wrong", target);
  }

  function next() {
    if (round >= ROUNDS) {
      setBest((value) => Math.max(value, score));
      setPhase("done");
      return;
    }
    setRound((value) => value + 1);
    setVerdict(null);
    setHinted(false);
    setAnswer("");
    setLeft(TIME);
    setPhase("playing");
    draw(used);
  }

  if (phase === "menu") {
    return (
      <section className="quiz quiz--menu">
        <Pokeball spinning className="quiz__ball" />
        <h2 className="quiz__title">Who is this Pokémon?</h2>
        <p className="quiz__lead">
          Ten silhouettes, twenty seconds each. Answer with a name or a Pokédex number. Use the peek
          button when you are stuck — it costs 40 points.
        </p>

        <div className="quiz__pools" role="group" aria-label="Choose a region">
          {Object.entries(POOLS).map(([key, value]) => (
            <button
              key={key}
              type="button"
              className={`pool${pool === key ? " is-on" : ""}`}
              onClick={() => setPool(key)}
            >
              <strong>{value.label}</strong>
              <small>{value.size} Pokémon</small>
            </button>
          ))}
        </div>

        <button type="button" className="btn btn--big" onClick={start}>
          Start the quiz
        </button>
        {best > 0 && <p className="quiz__best">Best score: {best}</p>}
      </section>
    );
  }

  if (phase === "done") {
    return (
      <section className="quiz quiz--done">
        <h2 className="quiz__title">Field exam complete</h2>
        <p className="quiz__points">{score}</p>
        <p className="quiz__lead">
          {hits} of {ROUNDS} identified · rank <strong>{rank(hits)}</strong> · best score{" "}
          {Math.max(best, score)}
        </p>
        <div className="quiz__actions">
          <button type="button" className="btn btn--big" onClick={start}>
            Play again
          </button>
          <Link to="/" className="btn btn--ghost">
            Back to the archive
          </Link>
        </div>
      </section>
    );
  }

  const revealed = Boolean(verdict);

  return (
    <section className={`quiz quiz--play${verdict ? ` is-${verdict}` : ""}`}>
      <header className="quiz__bar">
        <span className="quiz__round">
          Round {round} / {ROUNDS}
        </span>
        <span className={`quiz__streak${streak > 1 ? " is-hot" : ""}`}>
          {streak > 1 ? `×${streak} streak` : "Streak: —"}
        </span>
        <span className="quiz__score">{score} pts</span>
      </header>

      <div className="quiz__timer" aria-hidden="true">
        <span className="quiz__timer-fill" style={{ width: `${(left / TIME) * 100}%` }} />
      </div>

      <div className="quiz__stage">
        {!target && (
          <div className="state">
            <Pokeball spinning className="state__ball" />
          </div>
        )}
        {target && (
          <img
            key={target.id}
            className={`quiz__figure${revealed ? " is-revealed" : ""}${hinted && !revealed ? " is-hinted" : ""}`}
            src={
              revealed
                ? target.sprites.other["official-artwork"].front_default
                : target.sprites.front_default
            }
            alt={revealed ? target.name : "Pokémon silhouette"}
            width={230}
            height={230}
          />
        )}
      </div>

      {target && (
        <div className="quiz__hints">
          {target.types.map((entry) => (
            <span key={entry.type.name} className="badge" style={{ "--chip": typeColor(entry.type.name) }}>
              {capitalize(entry.type.name)}
            </span>
          ))}
          <span className="quiz__dex">#{pad3(target.id)}</span>
        </div>
      )}

      {verdict && target ? (
        <div className="quiz__result">
          <h3 className="quiz__verdict">
            {verdict === "correct" ? "Nailed it!" : verdict === "timeout" ? "Time is up" : "Not quite"}
          </h3>
          <p className="quiz__answer">{capitalize(target.name)}</p>
          <p className="quiz__facts">
            Height {(target.height / 10).toFixed(1)} m · Weight {(target.weight / 10).toFixed(1)} kg ·{" "}
            {target.base_experience ?? 0} base EXP
          </p>
          <div className="quiz__actions">
            <Link to={`/pokemon/${target.name}`} className="btn btn--ghost">
              Open entry
            </Link>
            <button type="button" className="btn btn--big" onClick={next}>
              {round >= ROUNDS ? "See results" : "Next →"}
            </button>
          </div>
        </div>
      ) : (
        <form className="quiz__form" onSubmit={submit}>
          <input
            className="search__input quiz__input"
            type="text"
            value={answer}
            autoFocus
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Type a Pokémon name…"
            autoComplete="off"
            spellCheck="false"
            aria-label="Pokémon name guess"
          />
          <button type="submit" className="btn btn--big" disabled={!target}>
            Guess
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={hinted}
            onClick={() => setHinted(true)}
          >
            {hinted ? "Peek used (−40)" : "Peek (−40)"}
          </button>
        </form>
      )}
    </section>
  );
}

export default QuizPage;

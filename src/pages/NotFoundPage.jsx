import { useEffect } from "react";
import { Link } from "react-router-dom";
import { DEFAULT_ACCENT } from "../config.js";
import { useStore } from "../store.jsx";

function NotFoundPage() {
  const { setAccent } = useStore();

  useEffect(() => {
    setAccent(DEFAULT_ACCENT);
    document.title = "404 · Pokédex";
  }, [setAccent]);

  return (
    <section className="missing">
      <p className="missing__code" data-text="404">
        404
      </p>
      <h2 className="missing__title">Entry not registered</h2>
      <p className="missing__note">
        The page you asked for is not in the national archive. The signal probably dropped out on
        Route 0.
      </p>
      <div className="missing__actions">
        <Link to="/" className="btn btn--big">
          ← Back to the archive
        </Link>
        <Link to="/quiz" className="btn btn--ghost">
          Play the silhouette quiz
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;

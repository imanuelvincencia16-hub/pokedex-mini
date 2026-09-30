import { useEffect } from "react";
import { Link } from "react-router-dom";
import { DEFAULT_ACCENT } from "../config.js";
import { useStore } from "../store.jsx";

function NotFoundPage() {
  const { setAccent } = useStore();

  useEffect(() => {
    setAccent(DEFAULT_ACCENT);
  }, [setAccent]);

  return (
    <section className="missing">
      <p className="missing__code" data-text="404">
        404
      </p>
      <h2 className="missing__title">Entri belum terdaftar</h2>
      <p className="missing__note">
        Halaman yang kamu buka tidak ada di arsip nasional. Mungkin sinyalnya terputus di Route 0.
      </p>
      <div className="missing__actions">
        <Link to="/" className="btn btn--big">
          ← Kembali ke arsip
        </Link>
        <Link to="/quiz" className="btn btn--ghost">
          Main kuis siluet
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;

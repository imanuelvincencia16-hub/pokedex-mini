import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useStore } from "../store.jsx";
import { readableOn } from "../utils.js";
import Pokeball from "./Pokeball.jsx";
import { ThemeToggle, SoundToggle } from "./Tools.jsx";

function Layout() {
  const location = useLocation();
  const { accent, favorites } = useStore();

  return (
    <div
      className="shell"
      style={{ "--accent": accent, "--on-accent": readableOn(accent) }}
    >
      <div className="ambient" aria-hidden="true">
        <span className="ambient__grid" />
        <span className="ambient__glow" />
        <span className="ambient__sweep" />
      </div>

      <header className="topbar">
        <Link to="/" className="brand">
          <Pokeball className="brand__ball" />
          <span className="brand__text">
            <strong>POKÉDEX</strong>
            <small>national archive</small>
          </span>
        </Link>

        <nav className="nav">
          <NavLink to="/" end className="nav__link">
            Dex
          </NavLink>
          <NavLink to="/quiz" className="nav__link">
            Quiz
          </NavLink>
          <span className="nav__count" title="Pokémon you have saved">
            ★ {favorites.length}
          </span>
        </nav>

        <div className="topbar__tools">
          <ThemeToggle />
          <SoundToggle />
        </div>
      </header>

      <main className="page" key={location.pathname}>
        <Outlet />
      </main>

      <footer className="foot">
        <span>Data &amp; artwork from PokéAPI</span>
        <span className="foot__dot">·</span>
        <span>React + Vite, no backend</span>
      </footer>
    </div>
  );
}

export default Layout;

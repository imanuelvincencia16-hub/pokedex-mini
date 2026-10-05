import { Outlet, Link } from "react-router-dom";

function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <img
          className="brand-ghost"
          src={`${import.meta.env.BASE_URL}pokeball.svg`}
          alt=""
          aria-hidden="true"
        />
        <Link to="/" className="app-title-link">
          <h1>PokéDex Mini</h1>
        </Link>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "./hooks.js";
import { DEFAULT_ACCENT } from "./config.js";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [theme, setTheme] = useLocalStorage("pokedex:theme", "dark");
  const [soundOn, setSoundOn] = useLocalStorage("pokedex:sound", true);
  const [favorites, setFavorites] = useLocalStorage("pokedex:favorites", []);
  const [accent, setAccent] = useState(DEFAULT_ACCENT);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleFavorite = useCallback(
    (name) => {
      setFavorites((current) =>
        current.includes(name)
          ? current.filter((entry) => entry !== name)
          : [...current, name],
      );
    },
    [setFavorites],
  );

  const playCry = useCallback(
    (url) => {
      if (!soundOn || !url || typeof Audio === "undefined") return;
      const audio = new Audio(url);
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Browsers can refuse to decode an .ogg we have no codec for; a silent
        // failure beats an unhandled rejection here.
      });
    },
    [soundOn],
  );

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      soundOn,
      setSoundOn,
      favorites,
      toggleFavorite,
      playCry,
      accent,
      setAccent,
    }),
    [theme, setTheme, soundOn, setSoundOn, favorites, toggleFavorite, playCry, accent],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside <StoreProvider>");
  return store;
}

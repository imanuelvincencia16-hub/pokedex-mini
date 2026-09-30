import { useStore } from "../store.jsx";

export function ThemeToggle() {
  const { theme, setTheme } = useStore();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="tool"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Ganti ke mode siang" : "Ganti ke mode malam"}
    >
      <span className="tool__glyph">{isDark ? "☾" : "☀"}</span>
      <span className="tool__label">{isDark ? "Malam" : "Siang"}</span>
    </button>
  );
}

export function SoundToggle() {
  const { soundOn, setSoundOn } = useStore();

  return (
    <button
      type="button"
      className="tool"
      onClick={() => setSoundOn(!soundOn)}
      title={soundOn ? "Bisukan suara Pokémon" : "Nyalakan suara Pokémon"}
    >
      <span className="tool__glyph">{soundOn ? "◉" : "○"}</span>
      <span className="tool__label">{soundOn ? "Suara" : "Bisu"}</span>
    </button>
  );
}

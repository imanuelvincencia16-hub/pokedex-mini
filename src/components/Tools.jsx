import { useStore } from "../store.jsx";

export function ThemeToggle() {
  const { theme, setTheme } = useStore();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="tool"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to day mode" : "Switch to night mode"}
    >
      <span className="tool__glyph">{isDark ? "☾" : "☀"}</span>
      <span className="tool__label">{isDark ? "Night" : "Day"}</span>
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
      title={soundOn ? "Mute Pokémon sounds" : "Unmute Pokémon sounds"}
    >
      <span className="tool__glyph">{soundOn ? "◉" : "○"}</span>
      <span className="tool__label">{soundOn ? "Sound" : "Muted"}</span>
    </button>
  );
}

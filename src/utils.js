import { SPRITE_BASE_URL, TYPE_COLORS, DEFAULT_ACCENT } from "./config.js";

export function capitalize(name) {
  if (!name) return "";
  return name
    .split(/[-\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function pad3(id) {
  return String(id).padStart(3, "0");
}

export function getSpriteUrl(id) {
  return `${SPRITE_BASE_URL}/${id}.png`;
}

export function getArtworkUrl(id) {
  return `${SPRITE_BASE_URL}/other/official-artwork/${id}.png`;
}

export function typeColor(type) {
  return TYPE_COLORS[type] || DEFAULT_ACCENT;
}

export function accentOf(types) {
  return typeColor(types && types[0] && types[0].type.name);
}

// The accent changes with whatever is on screen, so ink on top of it has to
// follow its luminance - white on electric yellow is unreadable.
export function readableOn(hex) {
  const value = (hex || "").replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return "#ffffff";
  const channels = [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  const luminance = (0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]) / 255;
  return luminance > 0.62 ? "#08111d" : "#ffffff";
}

// PokéAPI flavor text still carries the ROM's control characters and its
// all-caps species name, both of which read as broken in the UI.
export function cleanFlavor(text) {
  return (text || "")
    .replace(/\p{Cc}/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/pok[eé]mon/gi, "Pokémon");
}

export function formatMeters(decimeters) {
  return `${(decimeters / 10).toFixed(1)} m`;
}

export function formatKilograms(hectograms) {
  return `${(hectograms / 10).toFixed(1)} kg`;
}

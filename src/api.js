import { API_BASE_URL, DEX_SIZE } from "./config.js";

const cache = new Map();

export function api(path) {
  if (cache.has(path)) return cache.get(path);

  const request = fetch(`${API_BASE_URL}${path}`).then((response) => {
    if (!response.ok) {
      throw new Error(`PokéAPI responded with status ${response.status}`);
    }
    return response.json();
  });

  request.catch(() => cache.delete(path));
  cache.set(path, request);
  return request;
}

export const getPokemon = (key) => api(`/pokemon/${key}`);
export const getSpecies = (id) => api(`/pokemon-species/${id}`);
export const getType = (name) => api(`/type/${name}`);

// The chain URL comes straight from the species response; trim it to a path.
export function getEvolutionChain(url) {
  return api(url.replace(API_BASE_URL, ""));
}

let dexRequest = null;

// One request for every Pokémon name + number, then all filtering happens client-side.
export function getDex() {
  if (!dexRequest) {
    dexRequest = api(`/pokemon?limit=${DEX_SIZE}`).then((data) =>
      data.results.map((entry) => ({
        name: entry.name,
        id: Number(entry.url.split("/").filter(Boolean).pop()),
      })),
    );
  }
  return dexRequest;
}

import { useEffect, useRef, useState } from "react";
import { getDex, getPokemon } from "./api.js";

export function useLocalStorage(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored === null ? fallback : JSON.parse(stored);
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Private mode or a full quota: the app still works, just without memory.
    }
  }, [key, value]);

  return [value, setValue];
}

export function useDex() {
  const [dex, setDex] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getDex()
      .then((list) => active && setDex(list))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, []);

  return { dex, error };
}

export function usePokemon(key) {
  const [pokemon, setPokemon] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!key) return undefined;
    let active = true;
    setPokemon(null);
    setError(null);

    getPokemon(key)
      .then((data) => active && setPokemon(data))
      .catch((err) => active && setError(err.message));

    return () => {
      active = false;
    };
  }, [key]);

  return { pokemon, error, isLoading: Boolean(key) && !pokemon && !error };
}

export function useInView({ threshold = 0.15, rootMargin = "0px" } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView];
}

export function useCountUp(target, { duration = 900, start = true } = {}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return undefined;
    }

    let frame;
    const begin = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - begin) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, start]);

  return value;
}

import { useState, useEffect } from "react";

const STORAGE_KEY = "historialDespacho";

export interface SearchEntry {
  sku: string;
  date: string;  // ISO timestamp
}

export function useSearchHistory(maxItems = 10) {
  const [history, setHistory] = useState<SearchEntry[]>([]);

  // Carga inicial desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Persistencia en localStorage
  const persist = (newHistory: SearchEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  // Añade una nueva entrada (evita duplicados, recorta exceso)
  const push = (sku: string) => {
    const now = new Date().toISOString();
    const filtered = history.filter((e) => e.sku !== sku);
    const next = [{ sku, date: now }, ...filtered].slice(0, maxItems);
    persist(next);
  };

  // Limpia todo el historial
  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  return { history, push, clear };
}

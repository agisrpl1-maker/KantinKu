"use client";

import { useEffect, useState } from "react";
import { bacaStok, EVENT_STOK_MENU_BERUBAH } from "../../data/stok";

export default function useStokMenu(id: number, stokAwal: number) {
  const [stok, setStok] = useState(stokAwal);
  const [error, setError] = useState(false);

  useEffect(() => {
    function muatStok() {
      try {
        setStok(bacaStok(id));
        setError(false);
      } catch (caught) {
        console.error("Gagal membaca stok menu.", caught);
        setError(true);
      }
    }

    const timer = window.setTimeout(muatStok, 0);
    window.addEventListener(EVENT_STOK_MENU_BERUBAH, muatStok);
    window.addEventListener("storage", muatStok);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(EVENT_STOK_MENU_BERUBAH, muatStok);
      window.removeEventListener("storage", muatStok);
    };
  }, [id]);

  return { stok, error };
}

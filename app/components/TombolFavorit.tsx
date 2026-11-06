"use client";

import { useEffect, useState } from "react";
import { bacaFavorit, simpanFavorit } from "../../data/favorit";

export default function TombolFavorit({ id }: { id: number }) {
  const [favorit, setFavorit] = useState(false);
  const [pesan, setPesan] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setFavorit(bacaFavorit().includes(id));
      } catch (error) {
        console.error("Gagal membaca daftar favorit.", error);
        setPesan("Daftar favorit tidak dapat dibaca.");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [id]);

  function ubahFavorit() {
    try {
      const ids = bacaFavorit();
      const berikutnya = ids.includes(id) ? ids.filter((favoritId) => favoritId !== id) : [...ids, id];
      simpanFavorit(berikutnya);
      setFavorit(berikutnya.includes(id));
      setPesan("");
    } catch (error) {
      console.error("Gagal menyimpan daftar favorit.", error);
      setPesan("Favorit tidak dapat disimpan.");
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={ubahFavorit}
        aria-pressed={favorit}
        className="rounded bg-slate-100 px-3 py-2 text-sm hover:bg-slate-200"
      >
        {favorit ? "♥ Favorit" : "♡ Tambah favorit"}
      </button>
      {pesan && <p role="alert" className="mt-2 text-sm text-red-600">{pesan}</p>}
    </div>
  );
}

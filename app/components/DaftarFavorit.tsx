"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Menu } from "../../data/menu";
import { bacaFavorit } from "../../data/favorit";
import { rupiah } from "../../data/menu";

export default function DaftarFavorit() {
  const [semuaMenu, setSemuaMenu] = useState<Menu[]>([]);
  const [idsFavorit, setIdsFavorit] = useState<number[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      try {
        setIdsFavorit(bacaFavorit());
      } catch (caught) {
        console.error("Gagal membaca daftar favorit.", caught);
        setError("Daftar favorit tidak dapat dibaca.");
      }

      fetch("/api/menu", { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Gagal mengambil data menu.");
          return response.json() as Promise<Menu[]>;
        })
        .then(setSemuaMenu)
        .catch((caught: unknown) => {
          if (caught instanceof Error && caught.name === "AbortError") return;
          console.error("Gagal mengambil menu favorit.", caught);
          setError("Menu favorit gagal dimuat.");
        })
        .finally(() => setMemuat(false));
    }, 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  if (memuat) return <p>Memuat...</p>;
  if (error) return <p role="alert" className="text-red-600">{error}</p>;

  const daftar = semuaMenu.filter((item) => idsFavorit.includes(item.id));
  if (daftar.length === 0) return <p className="text-slate-500">Belum ada menu favorit.</p>;

  return (
    <ul className="space-y-2">
      {daftar.map((item) => (
        <li key={item.id}>
          <Link
            href={`/menu/${item.id}`}
            className="flex items-center justify-between gap-4 text-blue-600 hover:underline"
          >
            <span>{item.nama}</span>
            <span>{rupiah(item.harga)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

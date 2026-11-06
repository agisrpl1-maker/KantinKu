"use client";

import { useMemo, useState } from "react";
import { menu } from "../../data/menu";
import KartuMenu from "./KartuMenu";

const kategoriMenu = ["Semua", "Makanan", "Minuman", "Camilan"];

type UrutanMenu = "nama-asc" | "harga-asc" | "harga-desc";

export default function KatalogMenu() {
  const [pencarian, setPencarian] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [urutan, setUrutan] = useState<UrutanMenu>("nama-asc");

  const hasilMenu = useMemo(() => {
    const kataKunci = pencarian.trim().toLocaleLowerCase("id-ID");

    return menu
      .filter((item) => {
        const cocokKategori = kategori === "Semua" || item.kategori === kategori;
        const cocokPencarian =
          kataKunci.length === 0 ||
          item.nama.toLocaleLowerCase("id-ID").includes(kataKunci) ||
          item.kategori.toLocaleLowerCase("id-ID").includes(kataKunci);

        return cocokKategori && cocokPencarian;
      })
      .sort((a, b) => {
        if (urutan === "harga-asc") return a.harga - b.harga;
        if (urutan === "harga-desc") return b.harga - a.harga;
        return a.nama.localeCompare(b.nama, "id");
      });
  }, [pencarian, kategori, urutan]);

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Katalog Menu</h1>
        <p className="mt-2 text-slate-600">Cari dan pilih menu favoritmu.</p>
      </div>

      <div className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="cari-menu" className="mb-1.5 block text-sm font-medium text-slate-700">
            Pencarian
          </label>
          <input
            id="cari-menu"
            type="search"
            value={pencarian}
            onChange={(event) => setPencarian(event.target.value)}
            placeholder="Cari nama atau kategori menu"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label htmlFor="kategori-menu" className="mb-1.5 block text-sm font-medium text-slate-700">
            Kategori
          </label>
          <select
            id="kategori-menu"
            value={kategori}
            onChange={(event) => setKategori(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {kategoriMenu.map((pilihan) => (
              <option key={pilihan} value={pilihan}>
                {pilihan}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="urutan-menu" className="mb-1.5 block text-sm font-medium text-slate-700">
            Urutkan
          </label>
          <select
            id="urutan-menu"
            value={urutan}
            onChange={(event) => setUrutan(event.target.value as UrutanMenu)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="nama-asc">Nama A–Z</option>
            <option value="harga-asc">Harga termurah</option>
            <option value="harga-desc">Harga termahal</option>
          </select>
        </div>
      </div>

      {hasilMenu.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hasilMenu.map((item) => (
            <KartuMenu key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-slate-600">
          Menu tidak ditemukan.
        </p>
      )}
    </section>
  );
}

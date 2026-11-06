"use client";

import { useCallback, useEffect, useState } from "react";
import {
  bacaKeranjang,
  EVENT_KERANJANG_BERUBAH,
  type ItemKeranjang,
  simpanKeranjang,
} from "../../data/keranjang";
import type { Menu } from "../../data/menu";

export default function FormDetailMenu({ item }: { item: Menu }) {
  const [keranjang, setKeranjang] = useState<ItemKeranjang[]>([]);
  const [jumlah, setJumlah] = useState(1);
  const [pesan, setPesan] = useState("");

  const muatKeranjang = useCallback(() => {
    try {
      setKeranjang(bacaKeranjang());
    } catch (error) {
      console.error("Gagal membaca keranjang.", error);
      setPesan("Keranjang tidak dapat dibaca. Coba muat ulang halaman.");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(muatKeranjang, 0);
    window.addEventListener(EVENT_KERANJANG_BERUBAH, muatKeranjang);
    window.addEventListener("storage", muatKeranjang);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(EVENT_KERANJANG_BERUBAH, muatKeranjang);
      window.removeEventListener("storage", muatKeranjang);
    };
  }, [muatKeranjang]);

  const jumlahDiKeranjang = keranjang.find((baris) => baris.id === item.id)?.jumlah ?? 0;
  const sisaStok = item.stock - jumlahDiKeranjang;
  const stokTidakCukup = item.stock <= 0 || sisaStok <= 0;

  function tambahKeKeranjang(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const jumlahAkhir = keranjang.find((baris) => baris.id === item.id)?.jumlah ?? 0;
    if (jumlah < 1 || jumlahAkhir + jumlah > item.stock) {
      setPesan(`Jumlah melebihi stok tersedia. Sisa stok: ${Math.max(0, item.stock - jumlahAkhir)}.`);
      return;
    }

    const barisAda = keranjang.some((baris) => baris.id === item.id);
    const keranjangBaru = barisAda
      ? keranjang.map((baris) =>
          baris.id === item.id ? { ...baris, jumlah: baris.jumlah + jumlah } : baris,
        )
      : [...keranjang, { id: item.id, jumlah }];

    try {
      simpanKeranjang(keranjangBaru);
      setKeranjang(keranjangBaru);
      setPesan(`${item.nama} ditambahkan ke keranjang.`);
    } catch (error) {
      console.error("Gagal menyimpan keranjang.", error);
      setPesan("Gagal menyimpan keranjang. Periksa penyimpanan browser lalu coba lagi.");
    }
  }

  if (item.stock === 0) {
    return <p className="mt-6 font-medium text-red-600">Menu ini habis.</p>;
  }

  return (
    <form onSubmit={tambahKeKeranjang} className="mt-6">
      {jumlahDiKeranjang > 0 && (
        <p className="mb-3 text-sm text-slate-600">
          Sudah ada {jumlahDiKeranjang} di keranjang. Tersedia untuk ditambahkan: {Math.max(0, sisaStok)}.
        </p>
      )}
      {!stokTidakCukup && (
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="jumlah-menu" className="mb-1.5 block text-sm font-medium text-slate-700">
              Jumlah
            </label>
            <input
              id="jumlah-menu"
              type="number"
              min={1}
              max={sisaStok}
              value={jumlah}
              onChange={(event) => {
                const nilai = Number(event.target.value);
                setJumlah(Number.isInteger(nilai) && nilai > 0 ? Math.min(nilai, sisaStok) : 1);
                setPesan("");
              }}
              className="w-24 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
          >
            Tambah ke keranjang
          </button>
        </div>
      )}
      {stokTidakCukup && <p className="font-medium text-amber-700">Stok menu ini sudah ada di keranjang.</p>}
      {pesan && (
        <p aria-live="polite" className="mt-3 text-sm font-medium text-slate-700">
          {pesan}
        </p>
      )}
    </form>
  );
}

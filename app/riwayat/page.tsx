"use client";

import { useCallback, useEffect, useState } from "react";
import { bacaRiwayat, type Pesanan } from "../../data/keranjang";
import { rupiah } from "../../data/menu";

export default function RiwayatPage() {
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [siap, setSiap] = useState(false);
  const [error, setError] = useState("");

  const muatRiwayat = useCallback(() => {
    try {
      setPesanan(bacaRiwayat());
      setError("");
    } catch (caught) {
      console.error("Gagal membaca riwayat pesanan.", caught);
      setError("Riwayat pesanan tidak dapat dibaca dari penyimpanan browser.");
    } finally {
      setSiap(true);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(muatRiwayat, 0);
    window.addEventListener("storage", muatRiwayat);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", muatRiwayat);
    };
  }, [muatRiwayat]);

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Riwayat Pesanan</h1>
      {!siap ? (
        <p className="mt-6 text-slate-600">Memuat riwayat...</p>
      ) : error ? (
        <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </p>
      ) : pesanan.length === 0 ? (
        <p className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          Belum ada pesanan.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {[...pesanan]
            .sort((a, b) => Date.parse(b.dibuatPada) - Date.parse(a.dibuatPada))
            .map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-slate-900">{item.namaPemesan}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(item.dibuatPada).toLocaleString("id-ID")}
                  </p>
                </div>
                <p className="font-bold text-slate-900">{rupiah(item.total)}</p>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-slate-600">
                {item.items.map((baris) => (
                  <li key={baris.id}>
                    {baris.nama} × {baris.jumlah} — {rupiah(baris.harga * baris.jumlah)}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-slate-600">
                {item.metode === "Diantar" ? `Diantar ke kelas ${item.kelas}` : "Ambil sendiri"}
                {" · "}Subtotal {rupiah(item.subtotal)}
                {item.diskon > 0 ? ` · Diskon ${rupiah(item.diskon)}` : ""}
                {item.ongkir > 0 ? ` · Ongkir ${rupiah(item.ongkir)}` : ""}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

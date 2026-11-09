"use client";

import { useCallback, useEffect, useState } from "react";
import { bacaRiwayat, KUNCI_RIWAYAT, type Pesanan } from "../../data/keranjang";
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

  function hapusPesanan(id: string) {
    if (!window.confirm("Hapus pesanan ini dari riwayat?")) return;

    try {
      const berikutnya = bacaRiwayat().filter((item) => item.id !== id);
      window.localStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(berikutnya));
      setPesanan(berikutnya);
      setError("");
    } catch (caught) {
      console.error("Gagal menghapus pesanan dari riwayat.", caught);
      setError("Pesanan gagal dihapus. Coba lagi.");
    }
  }

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
              <article key={item.id} className="rounded-xl border border-black bg-white p-5 shadow-sm">
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900">{item.namaPemesan}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(item.dibuatPada).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-slate-900">{rupiah(item.total)}</p>
                    <button
                      type="button"
                      onClick={() => hapusPesanan(item.id)}
                      className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </div>
                </header>
                <ul className="mt-4 divide-y divide-black border-y border-black text-sm">
                  {item.items.map((baris) => (
                    <li key={baris.id} className="flex justify-between gap-4 py-2.5">
                      <span className="text-slate-700">
                        {baris.nama} <span className="text-slate-500">× {baris.jumlah}</span>
                      </span>
                      <span className="shrink-0 text-slate-700">{rupiah(baris.harga * baris.jumlah)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm text-slate-600">
                  <span>
                    {item.metode === "Diantar" ? `Diantar ke kelas ${item.kelas}` : "Ambil sendiri"}
                  </span>
                  <span>Subtotal {rupiah(item.subtotal)}</span>
                </div>
                {(item.diskon > 0 || item.ongkir > 0) && (
                  <div className="mt-2 space-y-1 text-right text-sm text-slate-500">
                    {item.diskon > 0 && <p>Diskon −{rupiah(item.diskon)}</p>}
                    {item.ongkir > 0 && <p>Ongkir {rupiah(item.ongkir)}</p>}
                  </div>
                )}
              </article>
            ))}
        </div>
      )}
    </section>
  );
}

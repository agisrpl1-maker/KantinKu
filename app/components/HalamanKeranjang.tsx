"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  bacaKeranjang,
  EVENT_KERANJANG_BERUBAH,
  hitungSubtotal,
  type ItemKeranjang,
  simpanKeranjang,
} from "../../data/keranjang";
import { menu, rupiah } from "../../data/menu";
import { bacaSemuaStok, EVENT_STOK_MENU_BERUBAH, type DaftarStok } from "../../data/stok";
import { simpanCheckout } from "../../data/checkout";

const MINIMUM_PROMO = 20_000;
const BIAYA_ONGKIR = 2_000;

export default function HalamanKeranjang() {
  const [keranjang, setKeranjang] = useState<ItemKeranjang[]>([]);
  const [stokMenu, setStokMenu] = useState<DaftarStok>(
    Object.fromEntries(menu.map((item) => [item.id, item.stock])),
  );
  const [stokError, setStokError] = useState(false);
  const [siap, setSiap] = useState(false);
  const [namaPemesan, setNamaPemesan] = useState("");
  const [metode, setMetode] = useState<"Ambil sendiri" | "Diantar">("Ambil sendiri");
  const [kelas, setKelas] = useState("");
  const [kodePromo, setKodePromo] = useState("");
  const [promoAktif, setPromoAktif] = useState(false);
  const promoAktifRef = useRef(false);
  const [pesan, setPesan] = useState("");
  const [pesanSukses, setPesanSukses] = useState("");

  const aturPromoAktif = useCallback((aktif: boolean) => {
    promoAktifRef.current = aktif;
    setPromoAktif(aktif);
  }, []);

  const muatKeranjang = useCallback(() => {
    try {
      const keranjangTerbaru = bacaKeranjang();
      setKeranjang(keranjangTerbaru);
      if (promoAktifRef.current && hitungSubtotal(keranjangTerbaru) < MINIMUM_PROMO) {
        aturPromoAktif(false);
        setKodePromo("");
        setPesan(`Promo HEMAT10 dibatalkan karena subtotal di bawah ${rupiah(MINIMUM_PROMO)}.`);
      } else {
        setPesan("");
      }
    } catch (error) {
      console.error("Gagal membaca keranjang.", error);
      setPesan("Keranjang tidak dapat dibaca. Periksa penyimpanan browser.");
    } finally {
      setSiap(true);
    }
  }, [aturPromoAktif]);

  useEffect(() => {
    function muatStok() {
      try {
        setStokMenu(bacaSemuaStok());
        setStokError(false);
      } catch (error) {
        console.error("Gagal membaca stok menu.", error);
        setStokError(true);
        setPesan("Stok menu tidak dapat dibaca. Coba muat ulang halaman.");
      }
    }

    const timer = window.setTimeout(muatKeranjang, 0);
    const timerStok = window.setTimeout(muatStok, 0);
    window.addEventListener(EVENT_KERANJANG_BERUBAH, muatKeranjang);
    window.addEventListener("storage", muatKeranjang);
    window.addEventListener(EVENT_STOK_MENU_BERUBAH, muatStok);
    window.addEventListener("storage", muatStok);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(timerStok);
      window.removeEventListener(EVENT_KERANJANG_BERUBAH, muatKeranjang);
      window.removeEventListener("storage", muatKeranjang);
      window.removeEventListener(EVENT_STOK_MENU_BERUBAH, muatStok);
      window.removeEventListener("storage", muatStok);
    };
  }, [muatKeranjang]);

  const subtotal = useMemo(() => hitungSubtotal(keranjang), [keranjang]);
  const diskon = promoAktif && subtotal >= MINIMUM_PROMO ? Math.round(subtotal * 0.1) : 0;
  const ongkir = metode === "Diantar" && keranjang.length > 0 ? BIAYA_ONGKIR : 0;
  const total = subtotal - diskon + ongkir;

  function simpanPerubahan(keranjangBaru: ItemKeranjang[]) {
    try {
      const promoDibatalkan =
        promoAktifRef.current && hitungSubtotal(keranjangBaru) < MINIMUM_PROMO;
      if (promoDibatalkan) {
        aturPromoAktif(false);
      }
      simpanKeranjang(keranjangBaru);
      setKeranjang(keranjangBaru);
      setPesanSukses("");
      if (promoDibatalkan) {
        setKodePromo("");
        setPesan(`Promo HEMAT10 dibatalkan karena subtotal di bawah ${rupiah(MINIMUM_PROMO)}.`);
      } else {
        setPesan("");
      }
    } catch (error) {
      console.error("Gagal memperbarui keranjang.", error);
      setPesan("Perubahan keranjang gagal disimpan. Coba lagi.");
    }
  }

  function ubahJumlah(id: number, jumlah: number) {
    const itemMenu = menu.find((item) => item.id === id);
    if (!itemMenu) {
      setPesan("Menu pada keranjang tidak ditemukan. Hapus item tersebut untuk melanjutkan.");
      return;
    }
    if (jumlah <= 0) {
      simpanPerubahan(keranjang.filter((item) => item.id !== id));
      return;
    }
    if (jumlah > stokMenu[id]) {
      setPesan(`Jumlah ${itemMenu.nama} tidak boleh melebihi stok (${stokMenu[id]}).`);
      return;
    }
    simpanPerubahan(keranjang.map((item) => (item.id === id ? { ...item, jumlah } : item)));
  }

  function pakaiPromo() {
    const kode = kodePromo.trim().toLocaleUpperCase("id-ID").replace("I", "1").replace("O", "0");
    if (kode !== "HEMAT10") {
      aturPromoAktif(false);
      setPesan("Kode promo tidak dikenal.");
      return;
    }
    if (subtotal < MINIMUM_PROMO) {
      aturPromoAktif(false);
      setPesan(`Promo HEMAT10 butuh belanja minimal ${rupiah(MINIMUM_PROMO)}.`);
      return;
    }
    setKodePromo(kode);
    aturPromoAktif(true);
    setPesan("Promo HEMAT10 dipakai: diskon 10%.");
  }

  function pesanSekarang(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPesan("");
    setPesanSukses("");

    if (namaPemesan.trim().length < 3) {
      setPesan("Nama pemesan minimal 3 huruf.");
      return;
    }
    if (metode === "Diantar" && kelas.trim().length < 3) {
      setPesan("Kelas minimal 3 karakter.");
      return;
    }

    const itemPesanan = keranjang.map((baris) => {
      const itemMenu = menu.find((item) => item.id === baris.id);
      return itemMenu ? { baris, itemMenu } : undefined;
    });
    const itemTidakValid = itemPesanan.find(
      (item) => !item || item.baris.jumlah > stokMenu[item.baris.id],
    );
    if (itemTidakValid) {
      setPesan("Ada menu yang jumlahnya melebihi stok. Periksa kembali keranjang.");
      return;
    }
    if (stokError) {
      setPesan("Stok menu tidak dapat dibaca. Coba muat ulang halaman.");
      return;
    }
    if (itemPesanan.length === 0) {
      setPesan("Keranjang masih kosong.");
      return;
    }

    const jumlahDiskon = promoAktif && subtotal >= MINIMUM_PROMO ? Math.round(subtotal * 0.1) : 0;
    const jumlahOngkir = metode === "Diantar" ? BIAYA_ONGKIR : 0;
    const totalBayar = subtotal - jumlahDiskon + jumlahOngkir;
    const detailPesanan = itemPesanan.flatMap((item) =>
      item
        ? [
            {
              id: item.itemMenu.id,
              nama: item.itemMenu.nama,
              jumlah: item.baris.jumlah,
              harga: item.itemMenu.harga,
            },
          ]
        : [],
    );
    const pesanan = {
      id: `${Date.now()}`,
      namaPemesan: namaPemesan.trim(),
      metode,
      ...(metode === "Diantar" ? { kelas: kelas.trim() } : {}),
      items: detailPesanan,
      subtotal,
      diskon: jumlahDiskon,
      ongkir: jumlahOngkir,
      total: totalBayar,
      dibuatPada: new Date().toISOString(),
    };

    try {
      simpanCheckout(pesanan, keranjang);
      setKeranjang([]);
      setPesan("");
      aturPromoAktif(false);
      setKodePromo("");
      setNamaPemesan("");
      setKelas("");
      setMetode("Ambil sendiri");
      setPesanSukses(
        `Terima kasih, ${pesanan.namaPemesan}! ${
          metode === "Diantar" ? `Pesanan diantar ke kelas ${kelas.trim()}.` : "Pesanan diambil sendiri di kantin."
        } Subtotal ${rupiah(subtotal)}, diskon ${rupiah(jumlahDiskon)}, ongkir ${rupiah(jumlahOngkir)}, total bayar ${rupiah(totalBayar)}. Keranjang dikosongkan dan pesanan disimpan ke riwayat.`,
      );
    } catch (error) {
      console.error("Gagal menyelesaikan checkout.", error);
      setPesan(error instanceof Error ? error.message : "Checkout gagal disimpan. Coba lagi.");
    }
  }

  if (!siap) {
    return <p className="py-8 text-center text-slate-600">Memuat keranjang...</p>;
  }

  const adaItem = keranjang.length > 0;

  return (
    <section>
      <h1 className="mb-5 text-3xl font-bold text-slate-900">Checkout</h1>

      {pesanSukses && (
        <p aria-live="polite" className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-green-800">
          {pesanSukses} <Link href="/riwayat" className="underline">Lihat riwayat</Link>
        </p>
      )}
      {pesan && <p aria-live="polite" className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-amber-800">{pesan}</p>}

      {!adaItem ? (
        <p className="rounded border bg-white p-6 text-center">
          Keranjang masih kosong. <Link href="/menu" className="text-blue-600 underline">Lihat menu</Link>
        </p>
      ) : (
        <form onSubmit={pesanSekarang} className="grid gap-5 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-4">
            <section className="space-y-3 rounded border bg-white p-4">
              <label htmlFor="nama-pemesan" className="block font-medium">Nama pemesan</label>
              <input
                id="nama-pemesan"
                value={namaPemesan}
                onChange={(event) => setNamaPemesan(event.target.value)}
                required
                minLength={3}
                placeholder="Minimal 3 huruf"
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
            </section>

            <section className="space-y-3 rounded border bg-white p-4">
              <label htmlFor="kode-promo" className="block font-medium">Kode promo</label>
              <div className="flex gap-2">
                <input
                  id="kode-promo"
                  value={kodePromo}
                  onChange={(event) => setKodePromo(event.target.value)}
                  placeholder="HEMAT10"
                  className="min-w-0 flex-1 rounded border border-slate-300 px-3 py-2"
                />
                <button type="button" onClick={pakaiPromo} className="rounded bg-slate-800 px-4 py-2 text-white">
                  Pakai
                </button>
              </div>
              <p className="text-sm text-slate-500">Diskon 10% untuk belanja minimal {rupiah(MINIMUM_PROMO)}.</p>
            </section>

            <section className="space-y-3 rounded border bg-white p-4">
              <p className="font-medium">Metode pesanan</p>
              <label className="flex items-center gap-2">
                <input type="radio" name="metode" checked={metode === "Ambil sendiri"} onChange={() => setMetode("Ambil sendiri")} />
                Ambil sendiri
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="metode" checked={metode === "Diantar"} onChange={() => setMetode("Diantar")} />
                Diantar ({rupiah(BIAYA_ONGKIR)})
              </label>
              {metode === "Diantar" && (
                <label htmlFor="kelas-pemesan" className="block">
                  Kelas
                  <input
                    id="kelas-pemesan"
                    value={kelas}
                    onChange={(event) => setKelas(event.target.value)}
                    required
                    minLength={3}
                    placeholder="Contoh: XII RPL 1"
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  />
                </label>
              )}
            </section>

            <button type="submit" disabled={stokError} className="w-full rounded bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              Pesan sekarang
            </button>
          </div>

          <aside className="h-fit rounded border bg-white p-4">
            <div className="mb-3 flex justify-between border-b pb-3 font-semibold">
              <h2>Pesanan ({keranjang.reduce((jumlah, item) => jumlah + item.jumlah, 0)})</h2>
              <Link href="/menu" className="font-normal text-blue-600">Ubah</Link>
            </div>

            <div className="divide-y">
              {keranjang.map((baris) => {
                const item = menu.find((pilihan) => pilihan.id === baris.id);
                return (
                  <div key={baris.id} className="flex justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium">{item?.nama ?? "Menu tidak tersedia"}</p>
                      {item ? (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <button type="button" aria-label={`Kurangi ${item.nama}`} onClick={() => ubahJumlah(baris.id, baris.jumlah - 1)}>−</button>
                          <span>{baris.jumlah}</span>
                          <button type="button" aria-label={`Tambah ${item.nama}`} disabled={baris.jumlah >= (stokMenu[item.id] ?? 0)} onClick={() => ubahJumlah(baris.id, baris.jumlah + 1)}>+</button>
                          <button type="button" onClick={() => ubahJumlah(baris.id, 0)} className="ml-2 text-red-600">Hapus</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => ubahJumlah(baris.id, 0)} className="mt-2 text-sm text-red-600">Hapus</button>
                      )}
                    </div>
                    <span className="font-medium">{item ? rupiah(item.harga * baris.jumlah) : "—"}</span>
                  </div>
                );
              })}
            </div>

            <dl className="space-y-2 border-t pt-3 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{rupiah(subtotal)}</dd></div>
              {diskon > 0 && <div className="flex justify-between"><dt>Diskon</dt><dd>−{rupiah(diskon)}</dd></div>}
              {metode === "Diantar" && <div className="flex justify-between"><dt>Ongkir</dt><dd>{rupiah(BIAYA_ONGKIR)}</dd></div>}
              <div className="flex justify-between border-t pt-3 text-base font-bold"><dt>Total</dt><dd>{rupiah(total)}</dd></div>
            </dl>
          </aside>
        </form>
      )}
    </section>
  );
}

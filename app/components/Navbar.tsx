"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  bacaKeranjang,
  EVENT_KERANJANG_BERUBAH,
  jumlahItemKeranjang,
} from "../../data/keranjang";

const menu = [
  { href: "/", teks: "Beranda" },
  { href: "/menu", teks: "Menu" },
  { href: "/favorit", teks: "Favorit" },
  { href: "/keranjang", teks: "Keranjang" },
  { href: "/riwayat", teks: "Riwayat" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [jumlahKeranjang, setJumlahKeranjang] = useState(0);

  const hitungKeranjang = useCallback(() => {
    try {
      setJumlahKeranjang(jumlahItemKeranjang(bacaKeranjang()));
    } catch (error) {
      console.error("Gagal membaca jumlah item keranjang.", error);
      setJumlahKeranjang(0);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(hitungKeranjang, 0);
    window.addEventListener(EVENT_KERANJANG_BERUBAH, hitungKeranjang);
    window.addEventListener("storage", hitungKeranjang);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(EVENT_KERANJANG_BERUBAH, hitungKeranjang);
      window.removeEventListener("storage", hitungKeranjang);
    };
  }, [hitungKeranjang]);

  return (
    <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:gap-6 sm:px-6">
      <span className="text-lg font-bold text-blue-600">KantinKu</span>

      {menu.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={
            pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
              ? "font-semibold text-blue-600"
              : "text-slate-600 transition hover:text-blue-600"
          }
        >
          {item.teks}
          {item.href === "/keranjang" && jumlahKeranjang > 0 ? ` (${jumlahKeranjang})` : ""}
        </Link>
      ))}
    </nav>
  );
}

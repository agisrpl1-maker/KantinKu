import {
  bacaRiwayat,
  EVENT_KERANJANG_BERUBAH,
  KUNCI_KERANJANG,
  KUNCI_RIWAYAT,
  type ItemKeranjang,
  type Pesanan,
} from "./keranjang";
import { bacaSemuaStok, EVENT_STOK_MENU_BERUBAH, KUNCI_STOK_MENU } from "./stok";
import { menu } from "./menu";

function pulihkan(kunci: string, nilai: string | null) {
  try {
    if (nilai === null) window.localStorage.removeItem(kunci);
    else window.localStorage.setItem(kunci, nilai);
  } catch (error) {
    console.error(`Gagal memulihkan penyimpanan ${kunci}.`, error);
  }
}

export function simpanCheckout(pesanan: Pesanan, items: ItemKeranjang[]) {
  const stok = bacaSemuaStok();
  for (const baris of items) {
    const itemMenu = menu.find((item) => item.id === baris.id);
    if (!itemMenu || baris.jumlah > stok[baris.id]) {
      throw new Error(
        `Stok ${itemMenu?.nama ?? "menu"} tidak cukup. Stok tersedia: ${stok[baris.id] ?? 0}.`,
      );
    }
    stok[baris.id] -= baris.jumlah;
  }

  const riwayatSebelumnya = window.localStorage.getItem(KUNCI_RIWAYAT);
  const stokSebelumnya = window.localStorage.getItem(KUNCI_STOK_MENU);
  const keranjangSebelumnya = window.localStorage.getItem(KUNCI_KERANJANG);

  try {
    window.localStorage.setItem(KUNCI_RIWAYAT, JSON.stringify([pesanan, ...bacaRiwayat()]));
    window.localStorage.setItem(KUNCI_STOK_MENU, JSON.stringify(stok));
    window.localStorage.setItem(KUNCI_KERANJANG, "[]");
  } catch (error) {
    pulihkan(KUNCI_RIWAYAT, riwayatSebelumnya);
    pulihkan(KUNCI_STOK_MENU, stokSebelumnya);
    pulihkan(KUNCI_KERANJANG, keranjangSebelumnya);
    throw error;
  }

  window.dispatchEvent(new Event(EVENT_STOK_MENU_BERUBAH));
  window.dispatchEvent(new Event(EVENT_KERANJANG_BERUBAH));
}

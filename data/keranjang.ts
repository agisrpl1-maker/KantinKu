import { menu } from "./menu";

export const KUNCI_KERANJANG = "keranjang";
export const EVENT_KERANJANG_BERUBAH = "keranjang-berubah";
export const KUNCI_RIWAYAT = "riwayat";

export type ItemKeranjang = {
  id: number;
  jumlah: number;
};

export type ItemPesanan = {
  id: number;
  nama: string;
  jumlah: number;
  harga: number;
};

export type Pesanan = {
  id: string;
  namaPemesan: string;
  metode: "Ambil sendiri" | "Diantar";
  kelas?: string;
  items: ItemPesanan[];
  subtotal: number;
  diskon: number;
  ongkir: number;
  total: number;
  dibuatPada: string;
};

function dataValid(data: unknown): data is ItemKeranjang[] {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        Number.isInteger(item.id) &&
        Number.isInteger(item.jumlah) &&
        item.jumlah > 0,
    )
  );
}

function pesananValid(data: unknown): data is Pesanan {
  if (typeof data !== "object" || data === null) return false;
  const pesanan = data as Record<string, unknown>;
  return (
    typeof pesanan.id === "string" &&
    typeof pesanan.namaPemesan === "string" &&
    (pesanan.metode === "Ambil sendiri" || pesanan.metode === "Diantar") &&
    (pesanan.kelas === undefined || typeof pesanan.kelas === "string") &&
    Array.isArray(pesanan.items) &&
    pesanan.items.every(
      (item: unknown) =>
        typeof item === "object" &&
        item !== null &&
        Number.isInteger((item as Record<string, unknown>).id) &&
        typeof (item as Record<string, unknown>).nama === "string" &&
        Number.isInteger((item as Record<string, unknown>).jumlah) &&
        Number.isFinite((item as Record<string, unknown>).harga),
    ) &&
    Number.isFinite(pesanan.subtotal) &&
    Number.isFinite(pesanan.diskon) &&
    Number.isFinite(pesanan.ongkir) &&
    Number.isFinite(pesanan.total) &&
    typeof pesanan.dibuatPada === "string"
  );
}

export function bacaKeranjang(): ItemKeranjang[] {
  const tersimpan = window.localStorage.getItem(KUNCI_KERANJANG);
  if (tersimpan === null) return [];

  const data: unknown = JSON.parse(tersimpan);
  if (!dataValid(data)) {
    throw new Error("Data keranjang di penyimpanan lokal tidak valid.");
  }
  return data;
}

export function simpanKeranjang(items: ItemKeranjang[]) {
  window.localStorage.setItem(KUNCI_KERANJANG, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT_KERANJANG_BERUBAH));
}

export function jumlahItemKeranjang(items: ItemKeranjang[]) {
  return items.reduce((total, item) => total + item.jumlah, 0);
}

export function hitungSubtotal(items: ItemKeranjang[]) {
  return items.reduce((total, item) => {
    const menuItem = menu.find((pilihan) => pilihan.id === item.id);
    return total + (menuItem?.harga ?? 0) * item.jumlah;
  }, 0);
}

export function bacaRiwayat(): Pesanan[] {
  const tersimpan = window.localStorage.getItem(KUNCI_RIWAYAT);
  if (tersimpan === null) return [];

  const data: unknown = JSON.parse(tersimpan);
  if (!Array.isArray(data) || !data.every(pesananValid)) {
    throw new Error("Data riwayat pesanan di penyimpanan lokal tidak valid.");
  }
  return data;
}

export function simpanPesanan(pesanan: Pesanan) {
  const riwayat = bacaRiwayat();
  window.localStorage.setItem(KUNCI_RIWAYAT, JSON.stringify([pesanan, ...riwayat]));
}

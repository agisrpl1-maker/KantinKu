import { menu } from "./menu";

export const KUNCI_STOK_MENU = "stok-menu";
export const EVENT_STOK_MENU_BERUBAH = "stok-menu-berubah";

export type DaftarStok = Record<number, number>;

export function restockSemuaMenu() {
  const stokAwal = Object.fromEntries(menu.map((item) => [item.id, item.stock]));
  window.localStorage.setItem(KUNCI_STOK_MENU, JSON.stringify(stokAwal));
  window.dispatchEvent(new Event(EVENT_STOK_MENU_BERUBAH));
}

export function bacaSemuaStok(): DaftarStok {
  const tersimpan = window.localStorage.getItem(KUNCI_STOK_MENU);
  const data: unknown = tersimpan === null ? {} : JSON.parse(tersimpan);

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("Data stok menu tidak valid.");
  }

  const stokTersimpan = data as Record<string, unknown>;
  return Object.fromEntries(
    menu.map((item) => {
      const jumlah = stokTersimpan[item.id];
      if (
        jumlah !== undefined &&
        (typeof jumlah !== "number" || !Number.isInteger(jumlah) || jumlah < 0)
      ) {
        throw new Error(`Data stok ${item.nama} tidak valid.`);
      }
      return [item.id, typeof jumlah === "number" ? jumlah : item.stock];
    }),
  );
}

export function bacaStok(id: number) {
  return bacaSemuaStok()[id] ?? 0;
}

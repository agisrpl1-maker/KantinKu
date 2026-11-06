export const KUNCI_FAVORIT = "favorit";

export function bacaFavorit(): number[] {
  const tersimpan = window.localStorage.getItem(KUNCI_FAVORIT);
  if (tersimpan === null) return [];

  const data: unknown = JSON.parse(tersimpan);
  if (!Array.isArray(data) || !data.every(Number.isInteger)) {
    throw new Error("Data favorit di penyimpanan lokal tidak valid.");
  }
  return data;
}

export function simpanFavorit(ids: number[]) {
  window.localStorage.setItem(KUNCI_FAVORIT, JSON.stringify(ids));
}

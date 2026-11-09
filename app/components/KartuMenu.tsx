import Link from "next/link";
import type { Menu } from "../../data/menu";
import { rupiah } from "../../data/menu";
import TombolFavorit from "./TombolFavorit";
import useStokMenu from "./useStokMenu";

export default function KartuMenu({ item }: { item: Menu }) {
  const { stok, error } = useStokMenu(item.id, item.stock);
  const habis = stok === 0;

  return (
    <article className={`rounded-xl border p-4 shadow-sm ${habis ? "bg-slate-100 opacity-60" : "bg-white"}`}>
      <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
        {item.kategori}
      </span>
      <h2 className="mt-3 font-semibold text-slate-900">{item.nama}</h2>
      <p className="mt-1 text-sm text-slate-500">{rupiah(item.harga)}</p>
      <p className={error || habis ? "text-sm text-slate-500" : "text-sm text-green-700"}>
        {error ? "Stok tidak dapat dimuat" : habis ? "Menu habis" : `Sisa ${stok} stok`}
      </p>
      <div className="mt-3">
        {habis || error ? (
          <button disabled className="rounded bg-slate-300 px-3 py-1.5 text-sm text-slate-500">
            Lihat detail
          </button>
        ) : (
          <Link
            href={`/menu/${item.id}`}
            className="inline-block rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            Lihat detail
          </Link>
        )}
      </div>
      <TombolFavorit id={item.id} />
    </article>
  );
}

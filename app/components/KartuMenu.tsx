import Link from "next/link";
import type { Menu } from "../../data/menu";
import { rupiah } from "../../data/menu";

export default function KartuMenu({ item }: { item: Menu }) {
  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">{item.nama}</h2>
          <p className="mt-1 text-sm text-slate-500">{item.kategori}</p>
        </div>
        <span className={item.stock > 0 ? "rounded bg-green-100 px-2 py-1 text-xs text-green-700" : "rounded bg-red-100 px-2 py-1 text-xs text-red-700"}>
          {item.stock > 0 ? `${item.stock} stok` : "Habis"}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="font-medium">{rupiah(item.harga)}</p>
        <Link
          href={`/menu/${item.id}`}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          Detail
        </Link>
      </div>
    </article>
  );
}

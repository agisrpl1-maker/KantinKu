import Link from "next/link";
import { notFound } from "next/navigation";
import { menu, rupiah } from "../../../data/menu";
import FormDetailMenu from "../../components/FormDetailMenu";

export function generateStaticParams() {
  return menu.map((item) => ({ id: String(item.id) }));
}

export default async function DetailMenuPage({
  params,
}: PageProps<"/menu/[id]">) {
  const { id } = await params;
  const idMenu = Number(id);
  const item = Number.isInteger(idMenu) ? menu.find((menuItem) => menuItem.id === idMenu) : undefined;

  if (!item) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-2xl p-6">
      <Link href="/menu" className="text-sm font-medium text-blue-600 hover:text-blue-700">
        ← Kembali ke menu
      </Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{item.nama}</h1>
          <p className="mt-2 text-slate-600">{item.kategori}</p>
        </div>
        <span
          className={
            item.stock > 0
              ? "rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700"
              : "rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700"
          }
        >
          {item.stock > 0 ? `${item.stock} stok` : "Habis"}
        </span>
      </div>
      <p className="mt-5 text-2xl font-bold text-slate-900">{rupiah(item.harga)}</p>
      <FormDetailMenu item={item} />
    </article>
  );
}

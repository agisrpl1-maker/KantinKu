import Link from "next/link";
import { notFound } from "next/navigation";
import { menu, rupiah } from "../../../data/menu";
import FormDetailMenu from "../../components/FormDetailMenu";
import TombolFavorit from "../../components/TombolFavorit";

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
    <article className="mx-auto max-w-2xl rounded-xl border bg-white p-6">
      <Link href="/menu" className="text-sm font-medium text-blue-600 hover:text-blue-700">
        ← Kembali ke menu
      </Link>
      <div className="mt-5">
        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
          {item.kategori}
        </span>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{item.nama}</h1>
        <p className="mt-1 text-slate-500">{rupiah(item.harga)}</p>
      </div>
      <TombolFavorit id={item.id} />
      <FormDetailMenu item={item} />
    </article>
  );
}

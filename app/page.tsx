import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="py-8 text-center sm:py-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Temukan Menu Favoritmu di KantinKu
        </h1>
        <p className="mt-3 text-slate-600">
          Pilih makanan, minuman, dan camilan favoritmu di kantin.
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
        >
          Jelajahi Menu
        </Link>
      </section>
    </div>
  );
}

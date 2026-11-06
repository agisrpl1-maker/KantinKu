import { menu } from "../../../../data/menu";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const idMenu = Number(id);
  const item = Number.isInteger(idMenu)
    ? menu.find((pilihan) => pilihan.id === idMenu)
    : undefined;

  if (!item) {
    return Response.json({ pesan: "Menu tidak ditemukan" }, { status: 404 });
  }

  return Response.json(item);
}

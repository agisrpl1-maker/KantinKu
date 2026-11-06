import { menu } from "../../../data/menu";

export async function GET() {
  return Response.json(menu);
}

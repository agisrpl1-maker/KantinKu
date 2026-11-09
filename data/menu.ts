export type Menu = {
    id: number;
    nama: string;
    kategori: string;
    harga: number;
    stock: number;
};

export const menu: Menu[] = [
    { id:1, nama: "Nasi Goreng Spesial", kategori: "Makanan", harga: 12000, stock: 15 },
    { id:2, nama: "Mie Ayam", kategori: "Makanan", harga: 10000, stock: 8 },
    { id:3, nama: "Es Teh Manis", kategori: "Minuman", harga: 3000, stock: 40 },
    { id:4, nama: "Jus Alpukat", kategori: "Minuman", harga: 8000, stock: 10 },
    { id:5, nama: "Pisang Goreng", kategori: "Camilan", harga: 5000, stock: 20 },
    { id:6, nama: "Risol Mayo", kategori: "Camilan", harga: 4000, stock: 3 },
];

export function rupiah(n: number) {
    return "Rp" + n.toLocaleString("id-ID");
}
import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import InisialisasiStok from "./components/InisialisasiStok";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KantinKu",
  description: "KantinKu app untuk memilih menu dan melihat katalog makanan favorit",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <InisialisasiStok />
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <main className="mx-auto w-full max-w-5xl flex-1 p-6">{children}</main>
        <footer className="border-t border-slate-200 bg-white p-4 text-center text-sm text-slate-500">
          KantinKu | menu favorit untuk harimu
        </footer>
      </body>
    </html>
  );
}

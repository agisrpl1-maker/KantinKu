"use client";

import { useEffect, useRef } from "react";
import { restockSemuaMenu } from "../../data/stok";

export default function InisialisasiStok() {
  const sudahDiperiksa = useRef(false);

  useEffect(() => {
    if (sudahDiperiksa.current) return;
    sudahDiperiksa.current = true;

    const navigasi = window.performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (navigasi?.type === "reload") {
      try {
        restockSemuaMenu();
      } catch (error) {
        console.error("Gagal mengisi ulang stok menu.", error);
      }
    }
  }, []);

  return null;
}

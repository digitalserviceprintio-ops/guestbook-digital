import * as XLSX from "xlsx";
import { Guest, statusLabels, categoryLabels, formatRupiah } from "@/types/guest";

export function exportGuestsToExcel(guests: Guest[]) {
  const pengantinGuests = guests.filter((g) => g.category === "pengantin");
  const orangTuaGuests = guests.filter((g) => g.category === "orang_tua");

  const mapRows = (list: Guest[]) =>
    list.map((g, i) => ({
      No: i + 1,
      Nama: g.name,
      "Jumlah Tamu": g.numberOfGuests,
      Alamat: g.address,
      "Nominal Amplop": g.envelopeAmount,
      Status: statusLabels[g.status],
      Catatan: g.notes,
    }));

  const wb = XLSX.utils.book_new();

  // Sheet: Semua Tamu
  const allRows = guests.map((g, i) => ({
    No: i + 1,
    Nama: g.name,
    Kategori: categoryLabels[g.category],
    "Jumlah Tamu": g.numberOfGuests,
    Alamat: g.address,
    "Nominal Amplop": g.envelopeAmount,
    Status: statusLabels[g.status],
    Catatan: g.notes,
  }));
  const wsAll = XLSX.utils.json_to_sheet(allRows);
  wsAll["!cols"] = [{ wch: 5 }, { wch: 25 }, { wch: 14 }, { wch: 12 }, { wch: 30 }, { wch: 16 }, { wch: 18 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsAll, "Semua Tamu");

  // Sheet: Pengantin
  if (pengantinGuests.length > 0) {
    const wsPengantin = XLSX.utils.json_to_sheet(mapRows(pengantinGuests));
    wsPengantin["!cols"] = [{ wch: 5 }, { wch: 25 }, { wch: 12 }, { wch: 30 }, { wch: 16 }, { wch: 18 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsPengantin, "Tamu Pengantin");
  }

  // Sheet: Orang Tua
  if (orangTuaGuests.length > 0) {
    const wsOrangTua = XLSX.utils.json_to_sheet(mapRows(orangTuaGuests));
    wsOrangTua["!cols"] = [{ wch: 5 }, { wch: 25 }, { wch: 12 }, { wch: 30 }, { wch: 16 }, { wch: 18 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsOrangTua, "Tamu Orang Tua");
  }

  // Sheet: Ringkasan
  const summaryData = [
    { Keterangan: "Total Undangan", Pengantin: pengantinGuests.length, "Orang Tua": orangTuaGuests.length, Total: guests.length },
    { Keterangan: "Total Tamu", Pengantin: pengantinGuests.reduce((s, g) => s + g.numberOfGuests, 0), "Orang Tua": orangTuaGuests.reduce((s, g) => s + g.numberOfGuests, 0), Total: guests.reduce((s, g) => s + g.numberOfGuests, 0) },
    { Keterangan: "Hadir", Pengantin: pengantinGuests.filter((g) => g.status === "hadir").length, "Orang Tua": orangTuaGuests.filter((g) => g.status === "hadir").length, Total: guests.filter((g) => g.status === "hadir").length },
    { Keterangan: "Tidak Hadir", Pengantin: pengantinGuests.filter((g) => g.status === "tidak_hadir").length, "Orang Tua": orangTuaGuests.filter((g) => g.status === "tidak_hadir").length, Total: guests.filter((g) => g.status === "tidak_hadir").length },
    { Keterangan: "Belum Konfirmasi", Pengantin: pengantinGuests.filter((g) => g.status === "belum_konfirmasi").length, "Orang Tua": orangTuaGuests.filter((g) => g.status === "belum_konfirmasi").length, Total: guests.filter((g) => g.status === "belum_konfirmasi").length },
    { Keterangan: "Total Amplop", Pengantin: pengantinGuests.reduce((s, g) => s + g.envelopeAmount, 0), "Orang Tua": orangTuaGuests.reduce((s, g) => s + g.envelopeAmount, 0), Total: guests.reduce((s, g) => s + g.envelopeAmount, 0) },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary["!cols"] = [{ wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

  XLSX.writeFile(wb, `laporan-buku-tamu-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

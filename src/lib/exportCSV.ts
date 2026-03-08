import { Guest, formatRupiah } from "@/types/guest";

export function exportGuestsToCSV(guests: Guest[]) {
  const headers = ["No", "Nama", "Jumlah Tamu", "Alamat", "Nominal Amplop", "Kategori", "Status", "Catatan"];
  
  const rows = guests.map((g, i) => [
    i + 1,
    g.name,
    g.numberOfGuests,
    g.address,
    g.envelopeAmount,
    g.category === "pengantin" ? "Pengantin" : "Orang Tua",
    g.status === "hadir" ? "Hadir" : g.status === "tidak_hadir" ? "Tidak Hadir" : "Belum Konfirmasi",
    g.notes,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => {
        const str = String(cell ?? "");
        return str.includes(",") || str.includes('"') || str.includes("\n")
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(",")
    ),
  ].join("\n");

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `daftar-tamu-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

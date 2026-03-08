export type AttendanceStatus = "hadir" | "tidak_hadir" | "belum_konfirmasi";

export interface Guest {
  id: string;
  name: string;
  phone: string;
  numberOfGuests: number;
  address: string;
  envelopeAmount: number;
  status: AttendanceStatus;
  notes: string;
  createdAt: Date;
}

export const statusLabels: Record<AttendanceStatus, string> = {
  hadir: "Hadir",
  tidak_hadir: "Tidak Hadir",
  belum_konfirmasi: "Belum Konfirmasi",
};

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export type AttendanceStatus = "hadir" | "tidak_hadir" | "belum_konfirmasi";
export type GuestCategory = "pengantin" | "orang_tua";
export type Gender = "laki_laki" | "perempuan";

export interface Guest {
  id: string;
  name: string;
  gender: Gender;
  numberOfGuests: number;
  address: string;
  envelopeAmount: number;
  status: AttendanceStatus;
  category: GuestCategory;
  notes: string;
  souvenirPickedUp: boolean;
  createdAt: Date;
}

export const genderLabels: Record<Gender, string> = {
  laki_laki: "Laki-laki",
  perempuan: "Perempuan",
};

export const statusLabels: Record<AttendanceStatus, string> = {
  hadir: "Hadir",
  tidak_hadir: "Tidak Hadir",
  belum_konfirmasi: "Belum Konfirmasi",
};

export const categoryLabels: Record<GuestCategory, string> = {
  pengantin: "Pengantin",
  orang_tua: "Orang Tua",
};

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

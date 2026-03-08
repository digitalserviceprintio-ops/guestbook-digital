export type AttendanceStatus = "hadir" | "tidak_hadir" | "belum_konfirmasi";

export interface Guest {
  id: string;
  name: string;
  phone: string;
  numberOfGuests: number;
  status: AttendanceStatus;
  notes: string;
  createdAt: Date;
}

export const statusLabels: Record<AttendanceStatus, string> = {
  hadir: "Hadir",
  tidak_hadir: "Tidak Hadir",
  belum_konfirmasi: "Belum Konfirmasi",
};

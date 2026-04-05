import { useState, useMemo } from "react";
import { Guest, AttendanceStatus, statusLabels, formatRupiah, genderLabels } from "@/types/guest";
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GuestListProps {
  guests: Guest[];
  filter: AttendanceStatus | "all";
  search: string;
  onFilterChange: (f: AttendanceStatus | "all") => void;
  onSearchChange: (s: string) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (id: string) => void;
}

const filterOptions: { value: AttendanceStatus | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "hadir", label: "Hadir" },
  { value: "tidak_hadir", label: "Tidak Hadir" },
  { value: "belum_konfirmasi", label: "Belum" },
];

const statusColorMap: Record<AttendanceStatus, string> = {
  hadir: "bg-success text-success-foreground",
  tidak_hadir: "bg-destructive text-destructive-foreground",
  belum_konfirmasi: "bg-pending text-pending-foreground",
};

export function GuestList({
  guests,
  filter,
  search,
  onFilterChange,
  onSearchChange,
  onEdit,
  onDelete,
}: GuestListProps) {
  return (
    <div className="space-y-3">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama atau alamat..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl bg-card pl-10 pr-4 py-3 text-sm md:text-base font-body text-card-foreground placeholder:text-muted-foreground shadow-card border-0 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide shrink-0">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange(opt.value)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs md:text-sm font-body font-medium transition-all ${
                filter === opt.value
                  ? "gradient-gold text-primary-foreground shadow-card"
                  : "bg-card text-muted-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: Card rows / Desktop: Table */}
      {guests.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8 font-body">
          Belum ada tamu yang terdaftar
        </p>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-2xl bg-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">No</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Nama</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Gender</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Jumlah</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Amplop</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Alamat</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Catatan</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest, idx) => (
                    <tr key={guest.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-card-foreground whitespace-nowrap">{guest.name}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{genderLabels[guest.gender]}</td>
                      <td className="px-4 py-3 text-center text-card-foreground">{guest.numberOfGuests}</td>
                      <td className="px-4 py-3">
                        <Badge className={`text-[10px] px-2 py-0.5 ${statusColorMap[guest.status]} border-0`}>
                          {statusLabels[guest.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-card-foreground whitespace-nowrap">
                        {guest.envelopeAmount > 0 ? formatRupiah(guest.envelopeAmount) : "-"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">{guest.address || "-"}</td>
                      <td className="px-4 py-3 text-muted-foreground italic max-w-[150px] truncate">{guest.notes || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => onEdit(guest)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => onDelete(guest.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: Compact Table */}
          <div className="md:hidden rounded-2xl bg-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-body">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Nama</th>
                    <th className="text-center px-2 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Jml</th>
                    <th className="text-center px-2 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Status</th>
                    <th className="text-right px-2 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Amplop</th>
                    <th className="text-center px-2 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr key={guest.id} className="border-b border-border/50">
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-card-foreground truncate max-w-[120px]">{guest.name}</p>
                        {guest.address && (
                          <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{guest.address}</p>
                        )}
                      </td>
                      <td className="px-2 py-2.5 text-center text-card-foreground">{guest.numberOfGuests}</td>
                      <td className="px-2 py-2.5 text-center">
                        <Badge className={`text-[9px] px-1.5 py-0 ${statusColorMap[guest.status]} border-0`}>
                          {statusLabels[guest.status]}
                        </Badge>
                      </td>
                      <td className="px-2 py-2.5 text-right text-card-foreground whitespace-nowrap">
                        {guest.envelopeAmount > 0 ? formatRupiah(guest.envelopeAmount) : "-"}
                      </td>
                      <td className="px-2 py-2.5">
                        <div className="flex items-center justify-center gap-0.5">
                          <button onClick={() => onEdit(guest)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => onDelete(guest.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

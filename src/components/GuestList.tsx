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

const ITEMS_PER_PAGE = 25;

export function GuestList({
  guests,
  filter,
  search,
  onFilterChange,
  onSearchChange,
  onEdit,
  onDelete,
}: GuestListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when filters change
  const totalPages = Math.max(1, Math.ceil(guests.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedGuests = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return guests.slice(start, start + ITEMS_PER_PAGE);
  }, [guests, safePage]);

  // Reset page when search/filter changes
  const handleFilterChange = (f: AttendanceStatus | "all") => {
    setCurrentPage(1);
    onFilterChange(f);
  };
  const handleSearchChange = (s: string) => {
    setCurrentPage(1);
    onSearchChange(s);
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-xl bg-card pl-10 pr-4 py-3 text-sm md:text-base font-body text-card-foreground placeholder:text-muted-foreground shadow-card border-0 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide shrink-0">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
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

      {/* Results info */}
      {guests.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-body text-muted-foreground">
            Menampilkan {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, guests.length)} dari {guests.length} tamu
          </p>
        </div>
      )}

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
                  {paginatedGuests.map((guest, idx) => (
                    <tr key={guest.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{(safePage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
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
                  {paginatedGuests.map((guest) => (
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} className="px-2 text-xs text-muted-foreground">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`min-w-[32px] h-8 rounded-lg text-xs font-body font-medium transition-all ${
                      safePage === p
                        ? "gradient-gold text-primary-foreground shadow-card"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

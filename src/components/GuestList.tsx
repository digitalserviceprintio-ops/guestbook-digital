import { motion, AnimatePresence } from "framer-motion";
import { Guest, AttendanceStatus, statusLabels, formatRupiah } from "@/types/guest";
import { Search, Pencil, Trash2, MapPin, Banknote } from "lucide-react";
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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari nama atau alamat..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl bg-card pl-10 pr-4 py-3 text-sm font-body text-card-foreground placeholder:text-muted-foreground shadow-card border-0 outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFilterChange(opt.value)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-body font-medium transition-all ${
              filter === opt.value
                ? "gradient-gold text-primary-foreground shadow-card"
                : "bg-card text-muted-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {guests.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-muted-foreground py-8 font-body"
            >
              Belum ada tamu yang terdaftar
            </motion.p>
          )}
          {guests.map((guest) => (
            <motion.div
              key={guest.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-xl bg-card p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-card-foreground truncate">
                      {guest.name}
                    </h3>
                    <Badge className={`text-[10px] px-2 py-0 ${statusColorMap[guest.status]} border-0`}>
                      {statusLabels[guest.status]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground font-body">
                    <span>{guest.numberOfGuests} orang</span>
                    {guest.envelopeAmount > 0 && (
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <Banknote className="h-3 w-3" />
                        {formatRupiah(guest.envelopeAmount)}
                      </span>
                    )}
                  </div>
                  {guest.address && (
                    <p className="text-xs text-muted-foreground mt-0.5 font-body flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {guest.address}
                    </p>
                  )}
                  {guest.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5 font-body italic">
                      {guest.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => onEdit(guest)}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(guest.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

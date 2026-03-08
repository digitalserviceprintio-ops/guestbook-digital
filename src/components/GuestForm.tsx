import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Guest, AttendanceStatus, statusLabels } from "@/types/guest";
import { X } from "lucide-react";

interface GuestFormProps {
  open: boolean;
  guest?: Guest | null;
  onClose: () => void;
  onSave: (data: Omit<Guest, "id" | "createdAt">) => void;
  onUpdate?: (id: string, data: Partial<Guest>) => void;
}

const statusOptions: AttendanceStatus[] = ["belum_konfirmasi", "hadir", "tidak_hadir"];

export function GuestForm({ open, guest, onClose, onSave, onUpdate }: GuestFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [status, setStatus] = useState<AttendanceStatus>("belum_konfirmasi");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (guest) {
      setName(guest.name);
      setPhone(guest.phone);
      setNumberOfGuests(guest.numberOfGuests);
      setStatus(guest.status);
      setNotes(guest.notes);
    } else {
      setName("");
      setPhone("");
      setNumberOfGuests(1);
      setStatus("belum_konfirmasi");
      setNotes("");
    }
  }, [guest, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (guest && onUpdate) {
      onUpdate(guest.id, { name: name.trim(), phone, numberOfGuests, status, notes });
    } else {
      onSave({ name: name.trim(), phone, numberOfGuests, status, notes });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-background p-5 pb-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-foreground">
                {guest ? "Edit Tamu" : "Tambah Tamu"}
              </h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">
                  Nama Tamu *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama tamu"
                  required
                  maxLength={100}
                  className="w-full rounded-xl bg-card px-4 py-3 text-sm font-body text-card-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">
                  Nomor HP
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  maxLength={20}
                  className="w-full rounded-xl bg-card px-4 py-3 text-sm font-body text-card-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">
                  Jumlah Tamu
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setNumberOfGuests(Math.max(1, numberOfGuests - 1))}
                    className="h-10 w-10 rounded-xl bg-card text-card-foreground font-body font-bold text-lg flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    −
                  </button>
                  <span className="text-lg font-display font-bold w-8 text-center text-foreground">{numberOfGuests}</span>
                  <button
                    type="button"
                    onClick={() => setNumberOfGuests(Math.min(20, numberOfGuests + 1))}
                    className="h-10 w-10 rounded-xl bg-card text-card-foreground font-body font-bold text-lg flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">
                  Status Kehadiran
                </label>
                <div className="flex gap-2">
                  {statusOptions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`flex-1 rounded-xl py-2.5 text-xs font-body font-medium transition-all ${
                        status === s
                          ? "gradient-gold text-primary-foreground shadow-card"
                          : "bg-card text-muted-foreground"
                      }`}
                    >
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">
                  Catatan
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan tambahan..."
                  rows={2}
                  maxLength={500}
                  className="w-full rounded-xl bg-card px-4 py-3 text-sm font-body text-card-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full gradient-gold text-primary-foreground font-body font-semibold py-3.5 rounded-xl shadow-elevated hover:opacity-90 transition-opacity text-sm"
              >
                {guest ? "Simpan Perubahan" : "Tambah Tamu"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

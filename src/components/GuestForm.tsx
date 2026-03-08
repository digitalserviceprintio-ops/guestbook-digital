import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Guest, AttendanceStatus, GuestCategory, Gender, statusLabels, genderLabels } from "@/types/guest";
import { X } from "lucide-react";

interface GuestFormProps {
  open: boolean;
  guest?: Guest | null;
  category: GuestCategory;
  onClose: () => void;
  onSave: (data: Omit<Guest, "id" | "createdAt">) => void;
  onUpdate?: (id: string, data: Partial<Guest>) => void;
}

const statusOptions: AttendanceStatus[] = ["belum_konfirmasi", "hadir", "tidak_hadir"];

export function GuestForm({ open, guest, category, onClose, onSave, onUpdate }: GuestFormProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("laki_laki");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [address, setAddress] = useState("");
  const [envelopeAmount, setEnvelopeAmount] = useState("");
  const [status, setStatus] = useState<AttendanceStatus>("belum_konfirmasi");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (guest) {
      setName(guest.name);
      setGender(guest.gender);
      setNumberOfGuests(guest.numberOfGuests);
      setAddress(guest.address);
      setEnvelopeAmount(guest.envelopeAmount ? guest.envelopeAmount.toString() : "");
      setStatus(guest.status);
      setNotes(guest.notes);
    } else {
      setName("");
      setGender("laki_laki");
      setNumberOfGuests(1);
      setAddress("");
      setEnvelopeAmount("");
      setStatus("belum_konfirmasi");
      setNotes("");
    }
  }, [guest, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      gender,
      numberOfGuests,
      address,
      envelopeAmount: parseInt(envelopeAmount) || 0,
      status,
      category: guest ? guest.category : category,
      notes,
      souvenirPickedUp: guest ? guest.souvenirPickedUp : false,
    };

    if (guest && onUpdate) {
      onUpdate(guest.id, data);
    } else {
      onSave(data);
    }
    onClose();
  };

  const inputClass =
    "w-full rounded-xl bg-card px-4 py-3 text-sm font-body text-card-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-ring";

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
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">
                    Jumlah Tamu
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNumberOfGuests(Math.max(1, numberOfGuests - 1))}
                      className="h-10 w-10 rounded-xl bg-card text-card-foreground font-body font-bold text-lg flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
                    >
                      −
                    </button>
                    <span className="text-lg font-display font-bold w-6 text-center text-foreground">{numberOfGuests}</span>
                    <button
                      type="button"
                      onClick={() => setNumberOfGuests(Math.min(20, numberOfGuests + 1))}
                      className="h-10 w-10 rounded-xl bg-card text-card-foreground font-body font-bold text-lg flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">
                    Nominal Amplop (Rp)
                  </label>
                  <input
                    type="number"
                    value={envelopeAmount}
                    onChange={(e) => setEnvelopeAmount(e.target.value)}
                    placeholder="0"
                    min={0}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">
                  Alamat
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Masukkan alamat tamu"
                  maxLength={200}
                  className={inputClass}
                />
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
                  className={`${inputClass} resize-none`}
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

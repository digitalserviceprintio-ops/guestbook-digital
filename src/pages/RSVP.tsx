import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWeddingSettings } from "@/hooks/useWeddingSettings";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RSVP = () => {
  const { toast } = useToast();
  const { settings, loading: settingsLoading } = useWeddingSettings();
  const [name, setName] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [status, setStatus] = useState<"hadir" | "tidak_hadir">("hadir");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from("guests").insert({
      name: name.trim(),
      number_of_guests: numberOfGuests,
      status,
      address,
      notes,
      category: "pengantin",
    });

    if (error) {
      toast({ title: "Gagal", description: "Mohon coba lagi.", variant: "destructive" });
    } else {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  const inputClass =
    "w-full rounded-xl bg-card px-4 py-3 text-sm font-body text-card-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-ring";

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body text-sm">Memuat...</p>
      </div>
    );
  }

  if (!settings.rsvpOpen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm w-full rounded-2xl bg-card p-8 shadow-elevated text-center space-y-4">
          <XCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="font-display text-2xl font-bold text-card-foreground">RSVP Ditutup</h2>
          <p className="text-sm font-body text-muted-foreground">
            Mohon maaf, periode konfirmasi kehadiran sudah ditutup.
          </p>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm w-full rounded-2xl bg-card p-8 shadow-elevated text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
          <h2 className="font-display text-2xl font-bold text-card-foreground">Terima Kasih!</h2>
          <p className="text-sm font-body text-muted-foreground">
            {status === "hadir"
              ? `Konfirmasi kehadiran Anda (${numberOfGuests} orang) telah kami terima. Sampai jumpa di hari bahagia kami!`
              : "Terima kasih atas konfirmasinya. Semoga kita bisa bertemu di lain kesempatan."}
          </p>
        </motion.div>
      </div>
    );
  }

  const navigateBack = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="max-w-md mx-auto px-5 pt-5">
        <button onClick={() => navigateBack("/")} className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
      </div>
      <div className="max-w-md mx-auto px-5 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <p className="text-xs font-body text-muted-foreground tracking-widest uppercase">Konfirmasi Kehadiran</p>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {settings.groomName} & {settings.brideName}
          </h1>
          <p className="text-sm font-body text-muted-foreground">Mohon konfirmasi kehadiran Anda</p>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Nama Lengkap *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama Anda" required maxLength={100} className={inputClass} />
          </div>

          <div>
            <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Konfirmasi Kehadiran</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setStatus("hadir")} className={`flex-1 rounded-xl py-3 text-sm font-body font-medium transition-all ${status === "hadir" ? "gradient-gold text-primary-foreground shadow-card" : "bg-card text-muted-foreground"}`}>
                Ya, Saya Hadir
              </button>
              <button type="button" onClick={() => setStatus("tidak_hadir")} className={`flex-1 rounded-xl py-3 text-sm font-body font-medium transition-all ${status === "tidak_hadir" ? "bg-destructive text-destructive-foreground shadow-card" : "bg-card text-muted-foreground"}`}>
                Tidak Hadir
              </button>
            </div>
          </div>

          {status === "hadir" && (
            <div>
              <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Jumlah Tamu</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setNumberOfGuests(Math.max(1, numberOfGuests - 1))} className="h-10 w-10 rounded-xl bg-card text-card-foreground font-body font-bold text-lg flex items-center justify-center hover:bg-secondary transition-colors">−</button>
                <span className="text-lg font-display font-bold text-foreground w-6 text-center">{numberOfGuests}</span>
                <button type="button" onClick={() => setNumberOfGuests(Math.min(10, numberOfGuests + 1))} className="h-10 w-10 rounded-xl bg-card text-card-foreground font-body font-bold text-lg flex items-center justify-center hover:bg-secondary transition-colors">+</button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Alamat</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Alamat Anda" maxLength={200} className={inputClass} />
          </div>

          <div>
            <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Ucapan & Doa</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tuliskan ucapan untuk pengantin..." rows={3} maxLength={500} className={`${inputClass} resize-none`} />
          </div>

          <button type="submit" disabled={submitting} className="w-full gradient-gold text-primary-foreground font-body font-semibold py-3.5 rounded-xl shadow-elevated hover:opacity-90 transition-opacity text-sm disabled:opacity-50">
            {submitting ? "Mengirim..." : "Kirim Konfirmasi"}
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default RSVP;

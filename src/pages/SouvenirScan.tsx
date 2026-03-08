import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Gift, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GuestInfo {
  id: string;
  name: string;
  status: string;
  category: string;
  souvenir_picked_up: boolean;
  number_of_guests: number;
}

const SouvenirScan = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [guest, setGuest] = useState<GuestInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("guests")
      .select("id, name, status, category, souvenir_picked_up, number_of_guests")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setGuest(data);
        setLoading(false);
      });
  }, [id]);

  const handlePickup = async () => {
    if (!guest) return;
    setProcessing(true);
    const { error } = await supabase
      .from("guests")
      .update({ souvenir_picked_up: true })
      .eq("id", guest.id);

    if (error) {
      toast({ title: "Error", description: "Gagal memproses pengambilan souvenir.", variant: "destructive" });
    } else {
      setGuest({ ...guest, souvenir_picked_up: true });
      toast({ title: "Berhasil!", description: `Souvenir untuk ${guest.name} telah dicatat.` });
    }
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-5 py-4"
      >
        <div className="flex items-center gap-3 max-w-lg md:max-w-2xl mx-auto">
          <button onClick={() => navigate("/souvenir")} className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg md:text-xl font-bold text-foreground">Verifikasi Souvenir</h1>
        </div>
      </motion.header>

      <main className="max-w-lg md:max-w-xl mx-auto px-5 py-8">
        {loading ? (
          <p className="text-center text-muted-foreground font-body text-sm">Memuat...</p>
        ) : !guest ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-card p-6 md:p-8 shadow-elevated text-center space-y-3">
            <XCircle className="h-12 w-12 md:h-16 md:w-16 text-destructive mx-auto" />
            <h2 className="font-display text-lg md:text-xl font-bold text-card-foreground">Tamu Tidak Ditemukan</h2>
            <p className="text-sm md:text-base font-body text-muted-foreground">QR Code tidak valid atau tamu tidak terdaftar.</p>
          </motion.div>
        ) : guest.souvenir_picked_up ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-card p-6 md:p-8 shadow-elevated text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 md:h-16 md:w-16 text-success mx-auto" />
            <h2 className="font-display text-lg md:text-xl font-bold text-card-foreground">{guest.name}</h2>
            <p className="text-sm md:text-base font-body text-muted-foreground">Souvenir sudah diambil sebelumnya.</p>
          </motion.div>
        ) : guest.status !== "hadir" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-card p-6 md:p-8 shadow-elevated text-center space-y-3">
            <AlertTriangle className="h-12 w-12 md:h-16 md:w-16 text-warning mx-auto" />
            <h2 className="font-display text-lg md:text-xl font-bold text-card-foreground">{guest.name}</h2>
            <p className="text-sm md:text-base font-body text-muted-foreground">
              Tamu belum tercatat hadir. Silakan check-in di meja penerima tamu terlebih dahulu.
            </p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl bg-card p-6 md:p-8 shadow-elevated text-center space-y-4">
            <Gift className="h-12 w-12 md:h-16 md:w-16 text-primary mx-auto" />
            <h2 className="font-display text-xl md:text-2xl font-bold text-card-foreground">{guest.name}</h2>
            <p className="text-sm md:text-base font-body text-muted-foreground">{guest.number_of_guests} orang</p>
            <button
              onClick={handlePickup}
              disabled={processing}
              className="w-full gradient-gold text-primary-foreground font-body font-semibold py-3.5 rounded-xl shadow-elevated hover:opacity-90 transition-opacity text-sm md:text-base disabled:opacity-50"
            >
              {processing ? "Memproses..." : "Konfirmasi Pengambilan Souvenir"}
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default SouvenirScan;

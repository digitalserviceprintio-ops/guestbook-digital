import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Gift, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Guest, statusLabels, categoryLabels } from "@/types/guest";

const GuestQR = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("guests")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setGuest({
            id: data.id,
            name: data.name,
            gender: (data.gender || "laki_laki") as Guest["gender"],
            numberOfGuests: data.number_of_guests,
            address: data.address || "",
            envelopeAmount: data.envelope_amount || 0,
            status: data.status as Guest["status"],
            category: data.category as Guest["category"],
            notes: data.notes || "",
            souvenirPickedUp: data.souvenir_picked_up ?? false,
            createdAt: new Date(data.created_at),
          });
        }
        setLoading(false);
      });
  }, [id]);

  const qrValue = `${window.location.origin}/souvenir-scan/${id}`;

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-5 py-4"
      >
        <div className="flex items-center gap-3 max-w-lg md:max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg md:text-xl font-bold text-foreground">QR Code Tamu</h1>
        </div>
      </motion.header>

      <main className="max-w-lg md:max-w-xl mx-auto px-5 py-8 flex flex-col items-center">
        {loading ? (
          <p className="text-muted-foreground font-body text-sm">Memuat...</p>
        ) : !guest ? (
          <p className="text-destructive font-body text-sm">Tamu tidak ditemukan</p>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full space-y-6">
            <div className="rounded-2xl bg-card p-6 md:p-8 shadow-elevated text-center space-y-4">
              <h2 className="font-display text-xl md:text-2xl font-bold text-card-foreground">{guest.name}</h2>
              <p className="text-xs md:text-sm font-body text-muted-foreground">
                {categoryLabels[guest.category]} · {statusLabels[guest.status]} · {guest.numberOfGuests} orang
              </p>

              <div className="inline-block bg-background rounded-2xl p-4 md:p-6 shadow-card">
                <QRCodeSVG value={qrValue} size={200} level="H" className="md:w-[250px] md:h-[250px]" />
              </div>

              <p className="text-[11px] md:text-xs font-body text-muted-foreground">
                Tunjukkan QR ini di counter souvenir
              </p>

              {guest.souvenirPickedUp ? (
                <div className="flex items-center justify-center gap-2 text-success font-body font-semibold text-sm md:text-base">
                  <CheckCircle2 className="h-5 w-5" />
                  Souvenir sudah diambil
                </div>
              ) : guest.status === "hadir" ? (
                <div className="flex items-center justify-center gap-2 text-primary font-body font-semibold text-sm md:text-base">
                  <Gift className="h-5 w-5" />
                  Souvenir belum diambil
                </div>
              ) : (
                <div className="text-xs md:text-sm font-body text-muted-foreground">
                  Tamu harus hadir terlebih dahulu untuk mengambil souvenir
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default GuestQR;

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Calendar, Clock } from "lucide-react";
import { useWeddingSettings } from "@/hooks/useWeddingSettings";
import defaultHero from "@/assets/wedding-hero.jpg";

const Welcome = () => {
  const navigate = useNavigate();
  const { settings, loading } = useWeddingSettings();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body text-sm">Memuat...</p>
      </div>
    );
  }

  const heroImg = settings.heroImageUrl || defaultHero;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-[70vh] min-h-[480px] lg:h-[60vh]">
        <img src={heroImg} alt="Foto Pengantin" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-foreground/10 to-background" />

        <div className="relative z-10 h-full flex flex-col items-center justify-end pb-10 px-5 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
            <p className="text-xs md:text-sm font-body tracking-[0.3em] uppercase text-primary-foreground/80">The Wedding of</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              {settings.groomName} & {settings.brideName}
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-10 bg-primary-foreground/40" />
              <Heart className="h-4 w-4 text-primary-foreground/60 fill-primary-foreground/60" />
              <div className="h-px w-10 bg-primary-foreground/40" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Info Section */}
      <main className="max-w-md md:max-w-xl lg:max-w-2xl mx-auto px-5 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-center space-y-2">
          <p className="text-xs md:text-sm font-body text-muted-foreground tracking-widest uppercase">Bismillahirrahmanirrahim</p>
          <p className="text-sm md:text-base font-body text-muted-foreground leading-relaxed">{settings.invitationText}</p>
        </motion.div>

        {/* Event Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-2xl bg-card p-6 md:p-8 shadow-elevated space-y-4">
          <h2 className="font-display text-lg md:text-xl font-bold text-card-foreground text-center">Detail Acara</h2>
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl gradient-gold flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm md:text-base font-body font-semibold text-card-foreground">{formatDate(settings.eventDate)}</p>
                <p className="text-xs md:text-sm font-body text-muted-foreground">Akad & Resepsi</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl gradient-gold flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm md:text-base font-body font-semibold text-card-foreground">{settings.akadTime} - {settings.endTime} WIB</p>
                <p className="text-xs md:text-sm font-body text-muted-foreground">Akad: {settings.akadTime} · Resepsi: {settings.resepsiTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl gradient-gold flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm md:text-base font-body font-semibold text-card-foreground">{settings.venueName}</p>
                <p className="text-xs md:text-sm font-body text-muted-foreground">{settings.venueAddress}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="space-y-3 max-w-md mx-auto">
          {settings.rsvpOpen ? (
            <button
              onClick={() => navigate("/rsvp")}
              className="w-full gradient-gold text-primary-foreground font-body font-semibold py-4 rounded-xl shadow-elevated hover:opacity-90 transition-opacity text-sm md:text-base"
            >
              Konfirmasi Kehadiran (RSVP)
            </button>
          ) : (
            <div className="w-full bg-muted text-muted-foreground font-body font-medium py-4 rounded-xl text-center text-sm md:text-base">
              RSVP Sudah Ditutup
            </div>
          )}
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-card text-card-foreground font-body font-medium py-3.5 rounded-xl shadow-card hover:bg-secondary transition-colors text-sm md:text-base"
          >
            Buku Tamu & Dashboard
          </button>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-center text-[11px] md:text-xs font-body text-muted-foreground">
          {settings.closingText}
        </motion.p>
      </main>
    </div>
  );
};

export default Welcome;

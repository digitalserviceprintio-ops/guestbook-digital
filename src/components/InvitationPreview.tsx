import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, Calendar, Clock, Volume2, VolumeX, X, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useWeddingSettings } from "@/hooks/useWeddingSettings";
import defaultHero from "@/assets/wedding-hero.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }),
};

interface InvitationPreviewProps {
  open: boolean;
  onClose: () => void;
}

export const InvitationPreview = ({ open, onClose }: InvitationPreviewProps) => {
  const { settings, loading } = useWeddingSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const images = settings.heroImages && settings.heroImages.length > 0
    ? settings.heroImages
    : (settings.heroImageUrl ? [settings.heroImageUrl] : [defaultHero]);

  useEffect(() => {
    if (!open || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [open, images.length]);

  const musicUrl = settings.backgroundMusic?.url;

  useEffect(() => {
    if (!open || !musicUrl) return;
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [open, musicUrl]);

  // Stop music when dialog closes
  useEffect(() => {
    if (!open && audioRef.current) {
      audioRef.current.pause();
      setMusicPlaying(false);
    }
  }, [open]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setMusicPlaying(!musicPlaying);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const token = localStorage.getItem("access_token");
  const rsvpUrl = token ? `${window.location.origin}/rsvp/${token}` : "";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md md:max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto border-0 rounded-2xl">
        <DialogTitle className="sr-only">Preview Undangan Digital</DialogTitle>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 rounded-full gradient-hero animate-pulse" />
          </div>
        ) : (
          <div className="bg-background">
            {/* Header badge */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-2 bg-primary/10 backdrop-blur-sm">
              <span className="text-xs font-body font-medium text-primary flex items-center gap-1.5">
                <ExternalLink className="h-3 w-3" />
                Preview Undangan
              </span>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-primary/10 transition-colors text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Hero */}
            <div className="relative h-[280px] md:h-[320px]">
              <AnimatePresence mode="wait">
                {images.map((img, idx) =>
                  idx === currentSlide ? (
                    <motion.img
                      key={idx}
                      src={img}
                      alt={`Foto ${idx + 1}`}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : null
                )}
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-foreground/10 to-background" />

              <div className="relative z-10 h-full flex flex-col items-center justify-end pb-6 px-4 text-center">
                <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary-foreground/80 font-medium">The Wedding of</p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground leading-tight mt-1">
                  {settings.groomName} & {settings.brideName}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-px w-8 bg-primary-foreground/40" />
                  <Heart className="h-3 w-3 text-primary-foreground/60 fill-primary-foreground/60" />
                  <div className="h-px w-8 bg-primary-foreground/40" />
                </div>

                {images.length > 1 && (
                  <div className="flex items-center gap-1.5 mt-3">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`rounded-full transition-all duration-500 ${
                          idx === currentSlide ? "w-5 h-1.5 gradient-hero" : "w-1.5 h-1.5 bg-primary-foreground/40"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Music toggle in preview */}
              {musicUrl && (
                <button
                  onClick={toggleMusic}
                  className="absolute top-3 right-3 z-20 h-8 w-8 rounded-full glass flex items-center justify-center text-primary-foreground"
                >
                  {musicPlaying ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                </button>
              )}
            </div>

            {/* Content */}
            <div className="px-5 py-5 space-y-4">
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="text-center space-y-1">
                <p className="text-[10px] font-body text-muted-foreground tracking-widest uppercase font-medium">Bismillahirrahmanirrahim</p>
                <p className="text-xs font-body text-muted-foreground leading-relaxed">{settings.invitationText}</p>
              </motion.div>

              {/* Event Details */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="rounded-xl glass-strong p-4 shadow-card space-y-3">
                <h3 className="font-display text-sm font-bold text-card-foreground text-center">Detail Acara</h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-lg gradient-hero flex items-center justify-center shrink-0">
                      <Calendar className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-body font-semibold text-card-foreground">{formatDate(settings.eventDate)}</p>
                      <p className="text-[10px] font-body text-muted-foreground">Akad & Resepsi</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-lg gradient-hero flex items-center justify-center shrink-0">
                      <Clock className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-body font-semibold text-card-foreground">{settings.akadTime} - {settings.endTime} WIB</p>
                      <p className="text-[10px] font-body text-muted-foreground">Akad: {settings.akadTime} · Resepsi: {settings.resepsiTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-lg gradient-hero flex items-center justify-center shrink-0">
                      <MapPin className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-body font-semibold text-card-foreground">{settings.venueName}</p>
                      <p className="text-[10px] font-body text-muted-foreground">{settings.venueAddress}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* RSVP Button Preview */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
                {settings.rsvpOpen ? (
                  <div className="w-full gradient-hero text-primary-foreground font-body font-semibold py-3 rounded-xl text-center text-xs opacity-80">
                    Konfirmasi Kehadiran (RSVP)
                  </div>
                ) : (
                  <div className="w-full glass text-muted-foreground font-body font-medium py-3 rounded-xl text-center text-xs">
                    RSVP Sudah Ditutup
                  </div>
                )}
              </motion.div>

              <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={3} className="text-center text-[10px] font-body text-muted-foreground">
                {settings.closingText}
              </motion.p>
            </div>

            {/* Footer with RSVP link */}
            {rsvpUrl && (
              <div className="px-5 pb-5 space-y-2">
                <div className="rounded-xl bg-muted/50 p-3 space-y-2">
                  <p className="text-[10px] font-body font-medium text-muted-foreground text-center">Link RSVP untuk dibagikan:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-[10px] font-mono bg-background rounded-lg px-2 py-1.5 text-foreground truncate">{rsvpUrl}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(rsvpUrl);
                      }}
                      className="shrink-0 text-[10px] font-body font-medium px-3 py-1.5 rounded-lg gradient-hero text-primary-foreground"
                    >
                      Salin
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const text = `Assalamu'alaikum Wr. Wb.\n\nDengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan:\n\n💍 *${settings.groomName} & ${settings.brideName}*\n\n📅 ${formatDate(settings.eventDate)}\n🕐 ${settings.akadTime} - ${settings.endTime} WIB\n📍 ${settings.venueName}\n${settings.venueAddress}\n\nKonfirmasi kehadiran melalui link berikut:\n${rsvpUrl}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.\n\nWassalamu'alaikum Wr. Wb.`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1da851] text-white text-xs font-body font-semibold transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Share via WhatsApp
                </button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

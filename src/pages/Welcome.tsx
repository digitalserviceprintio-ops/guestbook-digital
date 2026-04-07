import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Calendar, Clock, Volume2, VolumeX, LogIn } from "lucide-react";
import { useWeddingSettings } from "@/hooks/useWeddingSettings";
import { useTokenAuth } from "@/hooks/useTokenAuth";
import { LoginModal } from "@/components/LoginModal";
import defaultHero from "@/assets/wedding-hero.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }),
};

const Welcome = () => {
  const navigate = useNavigate();
  const { settings, loading } = useWeddingSettings();
  const { isAuthenticated, hasSavedToken, quickLogin, tokenLabel } = useTokenAuth();
  const [quickLoading, setQuickLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const images = settings.heroImages && settings.heroImages.length > 0
    ? settings.heroImages
    : (settings.heroImageUrl ? [settings.heroImageUrl] : [defaultHero]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const musicUrl = settings.backgroundMusic?.url;

  useEffect(() => {
    if (!musicUrl) return;
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [musicUrl]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="h-10 w-10 rounded-full gradient-hero animate-pulse" />
          <p className="text-muted-foreground font-body text-sm">Memuat...</p>
        </motion.div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Ambient background blobs */}
      <div className="bg-blob-purple top-[-100px] left-[-100px]" />
      <div className="bg-blob-blue bottom-[20%] right-[-80px]" />
      <div className="bg-blob-pink top-[40%] left-[10%]" />

      {/* Hero Section with Carousel */}
      <div className="relative h-[70vh] min-h-[480px] lg:h-[60vh]">
        <AnimatePresence mode="wait">
          {images.map((img, idx) =>
            idx === currentSlide ? (
              <motion.img
                key={idx}
                src={img}
                alt={`Foto Pengantin ${idx + 1}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : null
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-foreground/10 to-background" />

        <div className="relative z-10 h-full flex flex-col items-center justify-end pb-10 px-5 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="space-y-3">
            <p className="text-xs md:text-sm font-body tracking-[0.3em] uppercase text-primary-foreground/80 font-medium">The Wedding of</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight tracking-tight">
              {settings.groomName} & {settings.brideName}
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-10 bg-primary-foreground/40" />
              <Heart className="h-4 w-4 text-primary-foreground/60 fill-primary-foreground/60" />
              <div className="h-px w-10 bg-primary-foreground/40" />
            </div>
          </motion.div>

          {images.length > 1 && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="flex items-center gap-2 mt-4">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`rounded-full transition-all duration-500 ${
                    idx === currentSlide
                      ? "w-7 h-2 gradient-hero"
                      : "w-2 h-2 bg-primary-foreground/40"
                  }`}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-md md:max-w-xl lg:max-w-2xl mx-auto px-5 py-8 space-y-6">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="text-center space-y-1">
          <p className="text-lg md:text-xl font-display font-bold text-foreground">
            {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <p className="text-2xl md:text-3xl font-display font-bold text-gradient tabular-nums tracking-wide">
            {now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="text-center space-y-2">
          <p className="text-xs md:text-sm font-body text-muted-foreground tracking-widest uppercase font-medium">Bismillahirrahmanirrahim</p>
          <p className="text-sm md:text-base font-body text-muted-foreground leading-relaxed">{settings.invitationText}</p>
        </motion.div>

        {/* Event Details - Glassmorphism Card */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="rounded-2xl glass-strong p-6 md:p-8 shadow-elevated space-y-4">
          <h2 className="font-display text-lg md:text-xl font-bold text-card-foreground text-center">Detail Acara</h2>
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl gradient-hero flex items-center justify-center shrink-0 shadow-glow">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm md:text-base font-body font-semibold text-card-foreground">{formatDate(settings.eventDate)}</p>
                <p className="text-xs md:text-sm font-body text-muted-foreground">Akad & Resepsi</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl gradient-hero flex items-center justify-center shrink-0 shadow-glow">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm md:text-base font-body font-semibold text-card-foreground">{settings.akadTime} - {settings.endTime} WIB</p>
                <p className="text-xs md:text-sm font-body text-muted-foreground">Akad: {settings.akadTime} · Resepsi: {settings.resepsiTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl gradient-hero flex items-center justify-center shrink-0 shadow-glow">
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
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5} className="space-y-3 max-w-md mx-auto">
          {settings.rsvpOpen ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/rsvp")}
              className="w-full gradient-hero text-primary-foreground font-body font-semibold py-4 rounded-xl shadow-elevated hover:shadow-glow transition-all text-sm md:text-base"
            >
              Konfirmasi Kehadiran (RSVP)
            </motion.button>
          ) : (
            <div className="w-full glass text-muted-foreground font-body font-medium py-4 rounded-xl text-center text-sm md:text-base">
              RSVP Sudah Ditutup
            </div>
          )}
        </motion.div>

        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={6} className="text-center text-[11px] md:text-xs font-body text-muted-foreground">
          {settings.closingText}
        </motion.p>
      </main>

      {/* Music toggle */}
      {musicUrl && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMusic}
          className="fixed top-5 right-5 z-40 h-10 w-10 rounded-full glass shadow-elevated flex items-center justify-center text-foreground"
        >
          {musicPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </motion.button>
      )}

      {/* Floating login buttons */}
      {isAuthenticated ? (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/dashboard")}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 gradient-hero text-primary-foreground font-body font-semibold px-5 py-3 rounded-full shadow-elevated hover:shadow-glow transition-all text-sm"
        >
          <LogIn className="h-4 w-4" />
          Masuk Dashboard
        </motion.button>
      ) : hasSavedToken ? (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={quickLoading}
          onClick={async () => {
            setQuickLoading(true);
            const ok = await quickLogin();
            if (ok) navigate("/dashboard");
            setQuickLoading(false);
          }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 gradient-hero text-primary-foreground font-body font-semibold px-5 py-3 rounded-full shadow-elevated hover:shadow-glow transition-all text-sm disabled:opacity-50"
        >
          <LogIn className="h-4 w-4" />
          {quickLoading ? "Masuk..." : "Masuk Kembali"}
        </motion.button>
      ) : (
        <LoginModal />
      )}
    </div>
  );
};

export default Welcome;

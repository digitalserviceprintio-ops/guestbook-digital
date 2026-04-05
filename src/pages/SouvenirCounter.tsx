import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Gift, CheckCircle2, ChevronLeft, ChevronRight, Search, Undo2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGuests } from "@/hooks/useGuests";

const SouvenirCounter = () => {
  const navigate = useNavigate();
  const { allGuests } = useGuests();

  const souvenirStats = {
    total: allGuests.filter((g) => g.status === "hadir").length,
    pickedUp: allGuests.filter((g) => g.souvenirPickedUp).length,
    remaining: allGuests.filter((g) => g.status === "hadir" && !g.souvenirPickedUp).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-5 py-4"
      >
        <div className="flex items-center gap-3 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-lg md:text-xl font-bold text-foreground">Counter Souvenir</h1>
            <p className="text-[11px] md:text-xs font-body text-muted-foreground">Kelola pengambilan souvenir tamu</p>
          </div>
        </div>
      </motion.header>

      <main className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-5 py-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-card p-3 md:p-4 shadow-card text-center">
            <p className="text-[10px] md:text-xs font-body text-muted-foreground">Tamu Hadir</p>
            <p className="text-xl md:text-2xl font-display font-bold text-card-foreground">{souvenirStats.total}</p>
          </div>
          <div className="rounded-xl bg-card p-3 md:p-4 shadow-card text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <CheckCircle2 className="h-3 w-3 text-success" />
              <p className="text-[10px] md:text-xs font-body text-muted-foreground">Sudah Ambil</p>
            </div>
            <p className="text-xl md:text-2xl font-display font-bold text-success">{souvenirStats.pickedUp}</p>
          </div>
          <div className="rounded-xl bg-card p-3 md:p-4 shadow-card text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Gift className="h-3 w-3 text-primary" />
              <p className="text-[10px] md:text-xs font-body text-muted-foreground">Belum Ambil</p>
            </div>
            <p className="text-xl md:text-2xl font-display font-bold text-primary">{souvenirStats.remaining}</p>
          </div>
        </div>

        {/* Guest list with souvenir status */}
        <div>
          <h2 className="font-display text-base md:text-lg font-bold text-foreground mb-3">Daftar Pengambilan</h2>
          <div className="space-y-2">
            {allGuests
              .filter((g) => g.status === "hadir")
              .map((guest) => (
                <motion.div
                  key={guest.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl bg-card p-3 shadow-card flex items-center justify-between"
                >
                  <div>
                    <p className="font-body font-semibold text-sm text-card-foreground">{guest.name}</p>
                    <p className="text-[11px] font-body text-muted-foreground">{guest.numberOfGuests} orang</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {guest.souvenirPickedUp ? (
                      <span className="flex items-center gap-1 text-success text-xs font-body font-medium">
                        <CheckCircle2 className="h-4 w-4" /> Sudah
                      </span>
                    ) : (
                      <button
                        onClick={() => navigate(`/souvenir-scan/${guest.id}`)}
                        className="text-xs font-body font-medium text-primary hover:underline"
                      >
                        Proses
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            {allGuests.filter((g) => g.status === "hadir").length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-6 font-body">Belum ada tamu yang hadir</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SouvenirCounter;

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, QrCode, Gift, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGuests } from "@/hooks/useGuests";
import { Html5Qrcode } from "html5-qrcode";

const SouvenirCounter = () => {
  const navigate = useNavigate();
  const { allGuests } = useGuests();
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  const souvenirStats = {
    total: allGuests.filter((g) => g.status === "hadir").length,
    pickedUp: allGuests.filter((g) => g.souvenirPickedUp).length,
    remaining: allGuests.filter((g) => g.status === "hadir" && !g.souvenirPickedUp).length,
  };

  const startScan = async () => {
    if (!readerRef.current) return;
    setScanning(true);
    try {
      const html5Qr = new Html5Qrcode("qr-reader");
      scannerRef.current = html5Qr;
      await html5Qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Extract guest ID from URL
          const match = decodedText.match(/souvenir-scan\/([a-f0-9-]+)/i);
          if (match) {
            html5Qr.stop().then(() => {
              setScanning(false);
              navigate(`/souvenir-scan/${match[1]}`);
            });
          }
        },
        () => {}
      );
    } catch {
      setScanning(false);
    }
  };

  const stopScan = () => {
    scannerRef.current?.stop().then(() => setScanning(false)).catch(() => setScanning(false));
  };

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-5 py-4"
      >
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate("/")} className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Counter Souvenir</h1>
            <p className="text-[11px] font-body text-muted-foreground">Scan QR tamu untuk pengambilan</p>
          </div>
        </div>
      </motion.header>

      <main className="max-w-lg mx-auto px-5 py-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-card p-3 shadow-card text-center">
            <p className="text-[10px] font-body text-muted-foreground">Tamu Hadir</p>
            <p className="text-xl font-display font-bold text-card-foreground">{souvenirStats.total}</p>
          </div>
          <div className="rounded-xl bg-card p-3 shadow-card text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <CheckCircle2 className="h-3 w-3 text-success" />
              <p className="text-[10px] font-body text-muted-foreground">Sudah Ambil</p>
            </div>
            <p className="text-xl font-display font-bold text-success">{souvenirStats.pickedUp}</p>
          </div>
          <div className="rounded-xl bg-card p-3 shadow-card text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Gift className="h-3 w-3 text-primary" />
              <p className="text-[10px] font-body text-muted-foreground">Belum Ambil</p>
            </div>
            <p className="text-xl font-display font-bold text-primary">{souvenirStats.remaining}</p>
          </div>
        </div>

        {/* Scanner */}
        <div className="rounded-2xl bg-card p-5 shadow-elevated space-y-4">
          <div id="qr-reader" ref={readerRef} className="rounded-xl overflow-hidden" />

          {!scanning ? (
            <button
              onClick={startScan}
              className="w-full gradient-gold text-primary-foreground font-body font-semibold py-3.5 rounded-xl shadow-elevated hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
            >
              <QrCode className="h-5 w-5" />
              Mulai Scan QR
            </button>
          ) : (
            <button
              onClick={stopScan}
              className="w-full bg-destructive text-destructive-foreground font-body font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              Berhenti Scan
            </button>
          )}
        </div>

        {/* Guest list with souvenir status */}
        <div>
          <h2 className="font-display text-base font-bold text-foreground mb-3">Daftar Pengambilan</h2>
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
                    <button
                      onClick={() => navigate(`/guest-qr/${guest.id}`)}
                      className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                    >
                      <QrCode className="h-4 w-4" />
                    </button>
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

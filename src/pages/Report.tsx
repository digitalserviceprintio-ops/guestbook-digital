import { motion } from "framer-motion";
import { ArrowLeft, FileSpreadsheet, Users, UserCheck, UserX, Clock, Banknote, Heart, Users2 } from "lucide-react";
import { useGuests } from "@/hooks/useGuests";
import { formatRupiah, categoryLabels } from "@/types/guest";
import { exportGuestsToExcel } from "@/lib/exportExcel";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Report = () => {
  const { allGuests } = useGuests();
  const { toast } = useToast();
  const navigate = useNavigate();

  const pengantin = allGuests.filter((g) => g.category === "pengantin");
  const orangTua = allGuests.filter((g) => g.category === "orang_tua");

  const makeStats = (list: typeof allGuests) => ({
    total: list.length,
    hadir: list.filter((g) => g.status === "hadir").length,
    tidakHadir: list.filter((g) => g.status === "tidak_hadir").length,
    belum: list.filter((g) => g.status === "belum_konfirmasi").length,
    totalTamu: list.reduce((s, g) => s + g.numberOfGuests, 0),
    totalAmplop: list.reduce((s, g) => s + g.envelopeAmount, 0),
  });

  const global = makeStats(allGuests);
  const statsPengantin = makeStats(pengantin);
  const statsOrangTua = makeStats(orangTua);

  const handleExport = () => {
    if (allGuests.length === 0) {
      toast({ title: "Data kosong", description: "Belum ada data tamu untuk diekspor.", variant: "destructive" });
      return;
    }
    exportGuestsToExcel(allGuests);
    toast({ title: "Berhasil", description: "Laporan berhasil diekspor ke Excel." });
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-5 py-4"
      >
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">Laporan</h1>
        </div>
      </motion.header>

      <main className="max-w-lg mx-auto px-5 py-5 pb-10 space-y-5">
        {/* Export Button */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleExport}
          className="w-full gradient-gold text-primary-foreground font-body font-semibold py-4 rounded-xl shadow-elevated hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
        >
          <FileSpreadsheet className="h-5 w-5" />
          Ekspor ke Excel (.xlsx)
        </motion.button>

        {/* Global Summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <h2 className="font-display text-base font-bold text-foreground mb-3">Ringkasan Keseluruhan</h2>
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard icon={Users} label="Total Undangan" value={global.total.toString()} />
            <SummaryCard icon={UserCheck} label="Hadir" value={global.hadir.toString()} color="text-success" />
            <SummaryCard icon={UserX} label="Tidak Hadir" value={global.tidakHadir.toString()} color="text-destructive" />
            <SummaryCard icon={Clock} label="Belum Konfirmasi" value={global.belum.toString()} color="text-pending" />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="rounded-xl gradient-gold p-4 shadow-elevated">
              <p className="text-[10px] font-body text-primary-foreground/80">Total Tamu</p>
              <p className="text-2xl font-display font-bold text-primary-foreground">{global.totalTamu}</p>
            </div>
            <div className="rounded-xl gradient-gold p-4 shadow-elevated">
              <p className="text-[10px] font-body text-primary-foreground/80">Total Amplop</p>
              <p className="text-lg font-display font-bold text-primary-foreground">{formatRupiah(global.totalAmplop)}</p>
            </div>
          </div>
        </motion.div>

        {/* Per Category */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <CategorySection icon={Heart} title="Tamu Pengantin" stats={statsPengantin} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <CategorySection icon={Users2} title="Tamu Orang Tua" stats={statsOrangTua} />
        </motion.div>
      </main>
    </div>
  );
};

function SummaryCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl bg-card p-3.5 shadow-card">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${color || "text-primary"}`} />
        <span className="text-[11px] font-body text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-display font-bold text-card-foreground">{value}</p>
    </div>
  );
}

function CategorySection({ icon: Icon, title, stats }: { icon: any; title: string; stats: ReturnType<any> }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="font-display text-base font-bold text-foreground">{title}</h2>
      </div>
      <div className="rounded-xl bg-card p-4 shadow-card space-y-2.5">
        <Row label="Undangan" value={stats.total} />
        <Row label="Total Tamu" value={stats.totalTamu} />
        <Row label="Hadir" value={stats.hadir} color="text-success" />
        <Row label="Tidak Hadir" value={stats.tidakHadir} color="text-destructive" />
        <Row label="Belum Konfirmasi" value={stats.belum} color="text-pending" />
        <div className="border-t border-border pt-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-body text-muted-foreground flex items-center gap-1.5">
              <Banknote className="h-3.5 w-3.5" /> Total Amplop
            </span>
            <span className="text-sm font-display font-bold text-primary">{formatRupiah(stats.totalAmplop)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-body text-muted-foreground">{label}</span>
      <span className={`text-sm font-body font-semibold ${color || "text-card-foreground"}`}>{value}</span>
    </div>
  );
}

export default Report;

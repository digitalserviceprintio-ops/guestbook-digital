import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileSpreadsheet, Users, UserCheck, UserX, Clock, Banknote, Heart, Users2, Gift, ChevronDown, ChevronUp, Printer } from "lucide-react";
import { useGuests } from "@/hooks/useGuests";
import { Guest, formatRupiah, categoryLabels, statusLabels, genderLabels } from "@/types/guest";
import { exportGuestsToExcel } from "@/lib/exportExcel";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type FilterCategory = "semua" | "pengantin" | "orang_tua";

const Report = () => {
  const { allGuests } = useGuests();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("semua");
  const [showDetail, setShowDetail] = useState(true);

  const filteredGuests = activeFilter === "semua" ? allGuests : allGuests.filter((g) => g.category === activeFilter);

  const makeStats = (list: Guest[]) => ({
    total: list.length,
    hadir: list.filter((g) => g.status === "hadir").length,
    tidakHadir: list.filter((g) => g.status === "tidak_hadir").length,
    belum: list.filter((g) => g.status === "belum_konfirmasi").length,
    totalTamu: list.reduce((s, g) => s + g.numberOfGuests, 0),
    totalAmplop: list.reduce((s, g) => s + g.envelopeAmount, 0),
    lakiLaki: list.filter((g) => g.gender === "laki_laki").length,
    perempuan: list.filter((g) => g.gender === "perempuan").length,
    souvenirPickedUp: list.filter((g) => g.souvenirPickedUp).length,
  });

  const stats = makeStats(filteredGuests);

  const handleExport = () => {
    if (allGuests.length === 0) {
      toast({ title: "Data kosong", description: "Belum ada data tamu untuk diekspor.", variant: "destructive" });
      return;
    }
    exportGuestsToExcel(allGuests);
    toast({ title: "Berhasil", description: "Laporan berhasil diekspor ke Excel." });
  };

  const handlePrint = () => {
    if (filteredGuests.length === 0) {
      toast({ title: "Data kosong", description: "Tidak ada data untuk dicetak.", variant: "destructive" });
      return;
    }

    const filterLabel = activeFilter === "semua" ? "Semua Kategori" : categoryLabels[activeFilter];

    const rows = filteredGuests.map((g, i) =>
      `<tr style="background:${i % 2 === 0 ? '#fff' : '#f8f9fa'}">
        <td style="padding:6px 8px;border:1px solid #dee2e6;text-align:center">${i + 1}</td>
        <td style="padding:6px 8px;border:1px solid #dee2e6">${g.name}</td>
        <td style="padding:6px 8px;border:1px solid #dee2e6;text-align:center">${g.gender === "laki_laki" ? "L" : "P"}</td>
        <td style="padding:6px 8px;border:1px solid #dee2e6;text-align:center">${g.numberOfGuests}</td>
        <td style="padding:6px 8px;border:1px solid #dee2e6">${g.address || "-"}</td>
        <td style="padding:6px 8px;border:1px solid #dee2e6;text-align:center">${statusLabels[g.status]}</td>
        <td style="padding:6px 8px;border:1px solid #dee2e6;text-align:right">${g.envelopeAmount > 0 ? formatRupiah(g.envelopeAmount) : "-"}</td>
        <td style="padding:6px 8px;border:1px solid #dee2e6;text-align:center">${g.souvenirPickedUp ? "✓" : g.status === "hadir" ? "Belum" : "-"}</td>
      </tr>`
    ).join("");

    const html = `<!DOCTYPE html><html><head><title>Rekap Laporan Buku Tamu</title>
      <style>
        body{font-family:'Segoe UI',Arial,sans-serif;padding:30px;color:#1a2744}
        h1{font-size:20px;margin-bottom:4px}
        h2{font-size:14px;color:#666;font-weight:normal;margin-bottom:20px}
        table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:20px}
        th{background:#1a2744;color:#fff;padding:8px;border:1px solid #1a2744;text-align:left}
        .stats{display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap}
        .stat-box{background:#f8f9fa;border-radius:8px;padding:12px 16px;min-width:120px}
        .stat-box .label{font-size:10px;color:#666;margin-bottom:2px}
        .stat-box .value{font-size:18px;font-weight:bold}
        .footer{margin-top:30px;display:flex;justify-content:space-between;font-size:11px;color:#666}
        @media print{body{padding:15px}@page{margin:15mm}}
      </style></head><body>
      <h1>Rekap Laporan Buku Tamu</h1>
      <h2>Filter: ${filterLabel} — Dicetak: ${new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</h2>
      <div class="stats">
        <div class="stat-box"><div class="label">Total Undangan</div><div class="value">${stats.total}</div></div>
        <div class="stat-box"><div class="label">Hadir</div><div class="value" style="color:#22a86b">${stats.hadir}</div></div>
        <div class="stat-box"><div class="label">Tidak Hadir</div><div class="value" style="color:#dc3545">${stats.tidakHadir}</div></div>
        <div class="stat-box"><div class="label">Belum Konfirmasi</div><div class="value" style="color:#6b8ab5">${stats.belum}</div></div>
        <div class="stat-box"><div class="label">Total Tamu</div><div class="value">${stats.totalTamu}</div></div>
        <div class="stat-box"><div class="label">Total Amplop</div><div class="value" style="color:#e8650a">${formatRupiah(stats.totalAmplop)}</div></div>
      </div>
      <table>
        <thead><tr>
          <th style="text-align:center">No</th><th>Nama</th><th style="text-align:center">JK</th>
          <th style="text-align:center">Jml</th><th>Alamat</th><th style="text-align:center">Status</th>
          <th style="text-align:right">Amplop</th><th style="text-align:center">Souvenir</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr style="background:#1a2744;color:#fff;font-weight:bold">
          <td style="padding:8px;border:1px solid #1a2744"></td>
          <td style="padding:8px;border:1px solid #1a2744">Total: ${stats.total} undangan</td>
          <td style="padding:8px;border:1px solid #1a2744;text-align:center">L:${stats.lakiLaki} P:${stats.perempuan}</td>
          <td style="padding:8px;border:1px solid #1a2744;text-align:center">${stats.totalTamu}</td>
          <td style="padding:8px;border:1px solid #1a2744"></td>
          <td style="padding:8px;border:1px solid #1a2744;text-align:center">${stats.hadir} hadir</td>
          <td style="padding:8px;border:1px solid #1a2744;text-align:right">${formatRupiah(stats.totalAmplop)}</td>
          <td style="padding:8px;border:1px solid #1a2744;text-align:center">${stats.souvenirPickedUp}/${stats.hadir}</td>
        </tr></tfoot>
      </table>
      <div class="footer"><span>Buku Tamu Digital</span><span>Halaman 1</span></div>
      <script>window.onload=function(){window.print()}<\/script>
    </body></html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const filterTabs: { value: FilterCategory; label: string; icon: typeof Users }[] = [
    { value: "semua", label: "Semua", icon: Users },
    { value: "pengantin", label: "Pengantin", icon: Heart },
    { value: "orang_tua", label: "Orang Tua", icon: Users2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-5 py-4"
      >
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-foreground">Laporan</h1>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 gradient-gold text-accent-foreground font-body font-semibold px-3.5 py-2 rounded-xl shadow-card hover:opacity-90 transition-opacity text-xs"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </button>
        </div>
      </motion.header>

      <main className="max-w-lg mx-auto px-5 py-5 pb-10 space-y-5">
        {/* Category Filter */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex rounded-xl bg-card p-1 shadow-card">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-body font-medium transition-all ${
                activeFilter === tab.value
                  ? "gradient-gold text-accent-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Summary Stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 className="font-display text-base font-bold text-foreground mb-3">
            Ringkasan {activeFilter === "semua" ? "Keseluruhan" : categoryLabels[activeFilter]}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard icon={Users} label="Total Undangan" value={stats.total.toString()} />
            <SummaryCard icon={UserCheck} label="Hadir" value={stats.hadir.toString()} color="text-success" />
            <SummaryCard icon={UserX} label="Tidak Hadir" value={stats.tidakHadir.toString()} color="text-destructive" />
            <SummaryCard icon={Clock} label="Belum Konfirmasi" value={stats.belum.toString()} color="text-pending" />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="rounded-xl gradient-navy p-4 shadow-elevated">
              <p className="text-[10px] font-body text-primary-foreground/80">Total Tamu</p>
              <p className="text-2xl font-display font-bold text-primary-foreground">{stats.totalTamu}</p>
            </div>
            <div className="rounded-xl gradient-gold p-4 shadow-elevated">
              <p className="text-[10px] font-body text-accent-foreground/80">Total Amplop</p>
              <p className="text-lg font-display font-bold text-accent-foreground">{formatRupiah(stats.totalAmplop)}</p>
            </div>
          </div>
        </motion.div>

        {/* Gender & Souvenir Stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-xl bg-card p-4 shadow-card space-y-2.5">
            <Row label="Laki-laki" value={stats.lakiLaki} />
            <Row label="Perempuan" value={stats.perempuan} />
            <div className="border-t border-border pt-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-body text-muted-foreground flex items-center gap-1.5">
                  <Gift className="h-3.5 w-3.5" /> Souvenir Diambil
                </span>
                <span className="text-sm font-body font-semibold text-success">{stats.souvenirPickedUp} / {stats.hadir}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detail Table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h2 className="font-display text-base font-bold text-foreground">Detail Tamu</h2>
            {showDetail ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
          </button>

          {showDetail && (
            <div className="space-y-2">
              {filteredGuests.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6 font-body">Belum ada data tamu</p>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="rounded-xl bg-primary px-3 py-2.5 grid grid-cols-12 gap-1 text-[10px] font-body font-semibold text-primary-foreground">
                    <div className="col-span-1">No</div>
                    <div className="col-span-3">Nama</div>
                    <div className="col-span-1">JK</div>
                    <div className="col-span-1 text-center">Org</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Amplop</div>
                    <div className="col-span-2 text-center">Souvenir</div>
                  </div>

                  {filteredGuests.map((guest, idx) => (
                    <div
                      key={guest.id}
                      className={`rounded-xl px-3 py-2.5 grid grid-cols-12 gap-1 text-[10px] font-body ${
                        idx % 2 === 0 ? "bg-card" : "bg-muted"
                      }`}
                    >
                      <div className="col-span-1 text-muted-foreground">{idx + 1}</div>
                      <div className="col-span-3 font-medium text-card-foreground truncate">{guest.name}</div>
                      <div className="col-span-1 text-muted-foreground">{guest.gender === "laki_laki" ? "L" : "P"}</div>
                      <div className="col-span-1 text-center text-muted-foreground">{guest.numberOfGuests}</div>
                      <div className="col-span-2">
                        <span className={`${
                          guest.status === "hadir" ? "text-success" :
                          guest.status === "tidak_hadir" ? "text-destructive" : "text-pending"
                        } font-medium`}>
                          {statusLabels[guest.status]}
                        </span>
                      </div>
                      <div className="col-span-2 text-right text-muted-foreground">
                        {guest.envelopeAmount > 0 ? formatRupiah(guest.envelopeAmount) : "-"}
                      </div>
                      <div className="col-span-2 text-center">
                        {guest.souvenirPickedUp ? (
                          <span className="text-success font-medium">✓</span>
                        ) : guest.status === "hadir" ? (
                          <span className="text-warning font-medium">Belum</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Table Footer / Summary */}
                  <div className="rounded-xl bg-primary px-3 py-2.5 grid grid-cols-12 gap-1 text-[10px] font-body font-bold text-primary-foreground">
                    <div className="col-span-1"></div>
                    <div className="col-span-3">Total</div>
                    <div className="col-span-1"></div>
                    <div className="col-span-1 text-center">{stats.totalTamu}</div>
                    <div className="col-span-2">{stats.hadir} hadir</div>
                    <div className="col-span-2 text-right">{formatRupiah(stats.totalAmplop)}</div>
                    <div className="col-span-2 text-center">{stats.souvenirPickedUp}/{stats.hadir}</div>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

function SummaryCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl bg-card p-3.5 shadow-card">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${color || "text-accent"}`} />
        <span className="text-[11px] font-body text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-display font-bold text-card-foreground">{value}</p>
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

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, FileSpreadsheet, FileText, FileJson, Database, Users, Settings2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGuests } from "@/hooks/useGuests";
import { useWeddingSettings } from "@/hooks/useWeddingSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Guest, formatRupiah, statusLabels, categoryLabels, genderLabels } from "@/types/guest";
import * as XLSX from "xlsx";

const Backup = () => {
  const navigate = useNavigate();
  const { allGuests } = useGuests();
  const { settings } = useWeddingSettings();
  const { toast } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);

  // Fetch access tokens for backup
  const fetchTokens = async () => {
    const { data } = await supabase.from("access_tokens").select("*");
    return data || [];
  };

  // === EXCEL EXPORT (full backup) ===
  const exportExcel = async () => {
    setExporting("excel");
    try {
      const tokens = await fetchTokens();
      const wb = XLSX.utils.book_new();

      // Sheet 1: Semua Tamu
      const guestRows = allGuests.map((g, i) => ({
        No: i + 1,
        Nama: g.name,
        "Jenis Kelamin": genderLabels[g.gender],
        Kategori: categoryLabels[g.category],
        "Jumlah Tamu": g.numberOfGuests,
        Alamat: g.address,
        "Nominal Amplop": g.envelopeAmount,
        Status: statusLabels[g.status],
        Catatan: g.notes,
        "Souvenir Diambil": g.souvenirPickedUp ? "Ya" : "Belum",
        "Tanggal Dibuat": g.createdAt.toLocaleDateString("id-ID"),
      }));
      const wsGuests = XLSX.utils.json_to_sheet(guestRows);
      wsGuests["!cols"] = [
        { wch: 5 }, { wch: 25 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
        { wch: 30 }, { wch: 16 }, { wch: 18 }, { wch: 25 }, { wch: 14 }, { wch: 16 },
      ];
      XLSX.utils.book_append_sheet(wb, wsGuests, "Data Tamu");

      // Sheet 2: Pengaturan
      const settingsRows = [
        { Pengaturan: "Nama Pengantin Pria", Nilai: settings.groomName },
        { Pengaturan: "Nama Pengantin Wanita", Nilai: settings.brideName },
        { Pengaturan: "Tanggal Acara", Nilai: settings.eventDate },
        { Pengaturan: "Jam Akad", Nilai: settings.akadTime },
        { Pengaturan: "Jam Resepsi", Nilai: settings.resepsiTime },
        { Pengaturan: "Jam Selesai", Nilai: settings.endTime },
        { Pengaturan: "Nama Venue", Nilai: settings.venueName },
        { Pengaturan: "Alamat Venue", Nilai: settings.venueAddress },
        { Pengaturan: "Teks Undangan", Nilai: settings.invitationText },
        { Pengaturan: "Teks Penutup", Nilai: settings.closingText },
        { Pengaturan: "RSVP Aktif", Nilai: settings.rsvpOpen ? "Ya" : "Tidak" },
        { Pengaturan: "Musik Latar", Nilai: settings.backgroundMusic?.title || "Tidak ada" },
        { Pengaturan: "Jumlah Foto Hero", Nilai: String(settings.heroImages?.length || 0) },
      ];
      const wsSettings = XLSX.utils.json_to_sheet(settingsRows);
      wsSettings["!cols"] = [{ wch: 25 }, { wch: 60 }];
      XLSX.utils.book_append_sheet(wb, wsSettings, "Pengaturan");

      // Sheet 3: Ringkasan Statistik
      const pengantinGuests = allGuests.filter((g) => g.category === "pengantin");
      const orangTuaGuests = allGuests.filter((g) => g.category === "orang_tua");
      const summaryRows = [
        { Keterangan: "Total Undangan", Pengantin: pengantinGuests.length, "Orang Tua": orangTuaGuests.length, Total: allGuests.length },
        { Keterangan: "Total Tamu (Orang)", Pengantin: pengantinGuests.reduce((s, g) => s + g.numberOfGuests, 0), "Orang Tua": orangTuaGuests.reduce((s, g) => s + g.numberOfGuests, 0), Total: allGuests.reduce((s, g) => s + g.numberOfGuests, 0) },
        { Keterangan: "Hadir", Pengantin: pengantinGuests.filter((g) => g.status === "hadir").length, "Orang Tua": orangTuaGuests.filter((g) => g.status === "hadir").length, Total: allGuests.filter((g) => g.status === "hadir").length },
        { Keterangan: "Tidak Hadir", Pengantin: pengantinGuests.filter((g) => g.status === "tidak_hadir").length, "Orang Tua": orangTuaGuests.filter((g) => g.status === "tidak_hadir").length, Total: allGuests.filter((g) => g.status === "tidak_hadir").length },
        { Keterangan: "Belum Konfirmasi", Pengantin: pengantinGuests.filter((g) => g.status === "belum_konfirmasi").length, "Orang Tua": orangTuaGuests.filter((g) => g.status === "belum_konfirmasi").length, Total: allGuests.filter((g) => g.status === "belum_konfirmasi").length },
        { Keterangan: "Total Amplop", Pengantin: pengantinGuests.reduce((s, g) => s + g.envelopeAmount, 0), "Orang Tua": orangTuaGuests.reduce((s, g) => s + g.envelopeAmount, 0), Total: allGuests.reduce((s, g) => s + g.envelopeAmount, 0) },
        { Keterangan: "Souvenir Diambil", Pengantin: pengantinGuests.filter((g) => g.souvenirPickedUp).length, "Orang Tua": orangTuaGuests.filter((g) => g.souvenirPickedUp).length, Total: allGuests.filter((g) => g.souvenirPickedUp).length },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      wsSummary["!cols"] = [{ wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

      // Sheet 4: Token Akses
      if (tokens.length > 0) {
        const tokenRows = tokens.map((t: any, i: number) => ({
          No: i + 1,
          Label: t.label || "",
          Token: t.token,
          Aktif: t.is_active ? "Ya" : "Tidak",
          "Terakhir Digunakan": t.last_used_at ? new Date(t.last_used_at).toLocaleString("id-ID") : "-",
        }));
        const wsTokens = XLSX.utils.json_to_sheet(tokenRows);
        wsTokens["!cols"] = [{ wch: 5 }, { wch: 20 }, { wch: 16 }, { wch: 8 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, wsTokens, "Token Akses");
      }

      XLSX.writeFile(wb, `backup-lengkap-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast({ title: "Berhasil", description: "Backup Excel berhasil diunduh." });
    } catch (err) {
      toast({ title: "Gagal", description: "Terjadi kesalahan saat export.", variant: "destructive" });
    }
    setExporting(null);
  };

  // === CSV EXPORT ===
  const exportCSV = () => {
    setExporting("csv");
    try {
      const headers = ["No", "Nama", "Jenis Kelamin", "Kategori", "Jumlah Tamu", "Alamat", "Nominal Amplop", "Status", "Catatan", "Souvenir", "Tanggal"];
      const rows = allGuests.map((g, i) => [
        i + 1, g.name, genderLabels[g.gender], categoryLabels[g.category],
        g.numberOfGuests, g.address, g.envelopeAmount,
        statusLabels[g.status], g.notes, g.souvenirPickedUp ? "Ya" : "Belum",
        g.createdAt.toLocaleDateString("id-ID"),
      ]);

      const escape = (val: unknown) => {
        const str = String(val ?? "");
        return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str.replace(/"/g, '""')}"` : str;
      };

      const csv = [headers.join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-tamu-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Berhasil", description: "Backup CSV berhasil diunduh." });
    } catch {
      toast({ title: "Gagal", description: "Terjadi kesalahan saat export.", variant: "destructive" });
    }
    setExporting(null);
  };

  // === JSON EXPORT (full backup) ===
  const exportJSON = async () => {
    setExporting("json");
    try {
      const tokens = await fetchTokens();
      const backup = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        settings: {
          groomName: settings.groomName,
          brideName: settings.brideName,
          eventDate: settings.eventDate,
          akadTime: settings.akadTime,
          resepsiTime: settings.resepsiTime,
          endTime: settings.endTime,
          venueName: settings.venueName,
          venueAddress: settings.venueAddress,
          invitationText: settings.invitationText,
          closingText: settings.closingText,
          rsvpOpen: settings.rsvpOpen,
          backgroundMusic: settings.backgroundMusic,
          heroImages: settings.heroImages,
          heroImageUrl: settings.heroImageUrl,
        },
        guests: allGuests.map((g) => ({
          id: g.id,
          name: g.name,
          gender: g.gender,
          category: g.category,
          numberOfGuests: g.numberOfGuests,
          address: g.address,
          envelopeAmount: g.envelopeAmount,
          status: g.status,
          notes: g.notes,
          souvenirPickedUp: g.souvenirPickedUp,
          createdAt: g.createdAt.toISOString(),
        })),
        accessTokens: tokens.map((t: any) => ({
          token: t.token,
          label: t.label,
          isActive: t.is_active,
          lastUsedAt: t.last_used_at,
        })),
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-lengkap-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Berhasil", description: "Backup JSON berhasil diunduh." });
    } catch {
      toast({ title: "Gagal", description: "Terjadi kesalahan saat export.", variant: "destructive" });
    }
    setExporting(null);
  };

  const exportOptions = [
    {
      id: "excel",
      label: "Excel (.xlsx)",
      desc: "Backup lengkap dengan sheet terpisah: Data Tamu, Pengaturan, Ringkasan, dan Token Akses.",
      icon: FileSpreadsheet,
      color: "text-green-600",
      bg: "bg-green-600/10",
      action: exportExcel,
    },
    {
      id: "csv",
      label: "CSV (.csv)",
      desc: "Data tamu dalam format CSV. Cocok untuk import ke spreadsheet atau database lain.",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-600/10",
      action: exportCSV,
    },
    {
      id: "json",
      label: "JSON (.json)",
      desc: "Backup lengkap semua data dalam format JSON. Cocok untuk restore atau migrasi.",
      icon: FileJson,
      color: "text-amber-600",
      bg: "bg-amber-600/10",
      action: exportJSON,
    },
  ];

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
            <h1 className="font-display text-lg md:text-xl font-bold text-foreground">Backup & Export</h1>
            <p className="text-xs font-body text-muted-foreground">Download semua data aplikasi</p>
          </div>
        </div>
      </motion.header>

      <main className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-5 py-5 space-y-5">
        {/* Data Summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card p-5 shadow-elevated">
          <h2 className="font-display text-base font-bold text-card-foreground mb-3 flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Data yang Akan Di-backup
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl bg-secondary p-3 text-center">
              <Users className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-display font-bold text-foreground">{allGuests.length}</p>
              <p className="text-[10px] font-body text-muted-foreground">Tamu</p>
            </div>
            <div className="rounded-xl bg-secondary p-3 text-center">
              <Settings2 className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-display font-bold text-foreground">13</p>
              <p className="text-[10px] font-body text-muted-foreground">Pengaturan</p>
            </div>
            <div className="rounded-xl bg-secondary p-3 text-center">
              <FileSpreadsheet className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-display font-bold text-foreground">{formatRupiah(allGuests.reduce((s, g) => s + g.envelopeAmount, 0))}</p>
              <p className="text-[10px] font-body text-muted-foreground">Total Amplop</p>
            </div>
            <div className="rounded-xl bg-secondary p-3 text-center">
              <CheckCircle2 className="h-5 w-5 text-success mx-auto mb-1" />
              <p className="text-xl font-display font-bold text-foreground">{allGuests.filter((g) => g.status === "hadir").length}</p>
              <p className="text-[10px] font-body text-muted-foreground">Hadir</p>
            </div>
          </div>
        </motion.div>

        {/* Export Options */}
        <div className="space-y-3">
          {exportOptions.map((opt, idx) => (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * (idx + 1) }}
              className="rounded-2xl bg-card p-5 shadow-elevated"
            >
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-xl ${opt.bg} flex items-center justify-center shrink-0`}>
                  <opt.icon className={`h-6 w-6 ${opt.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm md:text-base font-bold text-card-foreground">{opt.label}</h3>
                  <p className="text-xs font-body text-muted-foreground mt-0.5">{opt.desc}</p>
                </div>
                <button
                  onClick={opt.action}
                  disabled={exporting !== null}
                  className="flex items-center gap-1.5 gradient-gold text-primary-foreground font-body font-semibold px-4 py-2.5 rounded-xl shadow-card hover:opacity-90 transition-opacity text-xs md:text-sm disabled:opacity-50 shrink-0"
                >
                  <Download className="h-4 w-4" />
                  {exporting === opt.id ? "..." : "Download"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl bg-muted p-4 text-center">
          <p className="text-xs font-body text-muted-foreground">
            💡 Untuk backup paling lengkap, gunakan format <strong>Excel</strong> atau <strong>JSON</strong>. Format CSV hanya berisi data tamu.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Backup;

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Upload, ToggleLeft, ToggleRight, X, ImagePlus, Music, Link2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useWeddingSettings } from "@/hooks/useWeddingSettings";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { settings, loading, updateSettings } = useWeddingSettings();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const ok = await updateSettings(form);
    if (ok) {
      toast({ title: "Tersimpan", description: "Pengaturan berhasil disimpan." });
    }
    setSaving(false);
  };

  const inputClass =
    "w-full rounded-xl bg-card px-4 py-3 text-sm md:text-base font-body text-card-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-ring";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body text-sm">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-5 py-4"
      >
        <div className="flex items-center justify-between max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg md:text-xl font-bold text-foreground">Pengaturan RSVP</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 gradient-gold text-primary-foreground font-body font-semibold px-4 py-2 rounded-xl shadow-card hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "..." : "Simpan"}
          </button>
        </div>
      </motion.header>

      <main className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-5 py-5 space-y-6">
        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* RSVP Toggle */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card p-5 shadow-elevated">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base md:text-lg font-bold text-card-foreground">Status RSVP</h2>
                  <p className="text-xs md:text-sm font-body text-muted-foreground mt-0.5">
                    {form.rsvpOpen ? "Form RSVP sedang dibuka" : "Form RSVP ditutup"}
                  </p>
                </div>
                <button
                  onClick={() => setForm({ ...form, rsvpOpen: !form.rsvpOpen })}
                  className="text-primary"
                >
                  {form.rsvpOpen ? <ToggleRight className="h-10 w-10" /> : <ToggleLeft className="h-10 w-10 text-muted-foreground" />}
                </button>
              </div>
            </motion.div>

            {/* Couple Info */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-3">
              <h2 className="font-display text-base md:text-lg font-bold text-foreground">Info Pengantin</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs md:text-sm font-body font-medium text-muted-foreground mb-1 block">Nama Pengantin Pria</label>
                  <input value={form.groomName} onChange={(e) => setForm({ ...form, groomName: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs md:text-sm font-body font-medium text-muted-foreground mb-1 block">Nama Pengantin Wanita</label>
                  <input value={form.brideName} onChange={(e) => setForm({ ...form, brideName: e.target.value })} className={inputClass} />
                </div>
              </div>
            </motion.div>

            {/* Event Details */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
              <h2 className="font-display text-base md:text-lg font-bold text-foreground">Detail Acara</h2>
              <div>
                <label className="text-xs md:text-sm font-body font-medium text-muted-foreground mb-1 block">Tanggal Acara</label>
                <input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className={inputClass} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs md:text-sm font-body font-medium text-muted-foreground mb-1 block">Akad</label>
                  <input type="time" value={form.akadTime} onChange={(e) => setForm({ ...form, akadTime: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs md:text-sm font-body font-medium text-muted-foreground mb-1 block">Resepsi</label>
                  <input type="time" value={form.resepsiTime} onChange={(e) => setForm({ ...form, resepsiTime: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs md:text-sm font-body font-medium text-muted-foreground mb-1 block">Selesai</label>
                  <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-xs md:text-sm font-body font-medium text-muted-foreground mb-1 block">Nama Tempat</label>
                <input value={form.venueName} onChange={(e) => setForm({ ...form, venueName: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="text-xs md:text-sm font-body font-medium text-muted-foreground mb-1 block">Alamat Tempat</label>
                <input value={form.venueAddress} onChange={(e) => setForm({ ...form, venueAddress: e.target.value })} className={inputClass} />
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            {/* Hero Images (3-5 photos) */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
              <h2 className="font-display text-base md:text-lg font-bold text-foreground">Foto Pengantin</h2>
              <p className="text-xs md:text-sm font-body text-muted-foreground">Upload 3-5 foto untuk carousel di halaman utama.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(form.heroImages || []).map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt={`Foto ${idx + 1}`} className="rounded-xl h-28 md:h-36 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...(form.heroImages || [])];
                        updated.splice(idx, 1);
                        setForm({ ...form, heroImages: updated });
                      }}
                      className="absolute top-1.5 right-1.5 bg-destructive text-destructive-foreground p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 bg-foreground/60 text-background text-[10px] font-body font-medium px-1.5 py-0.5 rounded">{idx + 1}</span>
                  </div>
                ))}

                {(form.heroImages || []).length < 5 && (
                  <label className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border h-28 md:h-36 cursor-pointer hover:bg-secondary/50 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-[10px] font-body text-muted-foreground">
                      {uploading ? "Uploading..." : `Foto ${(form.heroImages || []).length + 1}`}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        const ext = file.name.split(".").pop();
                        const path = `hero-${Date.now()}.${ext}`;
                        const { error } = await supabase.storage.from("wedding-photos").upload(path, file, { upsert: true });
                        if (error) {
                          toast({ title: "Gagal upload", description: error.message, variant: "destructive" });
                        } else {
                          const { data: urlData } = supabase.storage.from("wedding-photos").getPublicUrl(path);
                          const current = form.heroImages || [];
                          setForm({ ...form, heroImages: [...current, urlData.publicUrl] });
                          toast({ title: "Berhasil", description: "Foto berhasil diupload. Jangan lupa klik Simpan." });
                        }
                        setUploading(false);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>

              {(form.heroImages || []).length < 3 && (
                <p className="text-[11px] font-body text-warning">Minimal 3 foto diperlukan untuk carousel.</p>
              )}
            </motion.div>

            {/* Invitation Text */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
              <h2 className="font-display text-base md:text-lg font-bold text-foreground">Teks Undangan</h2>
              <div>
                <label className="text-xs md:text-sm font-body font-medium text-muted-foreground mb-1 block">Teks Pembuka</label>
                <textarea
                  value={form.invitationText}
                  onChange={(e) => setForm({ ...form, invitationText: e.target.value })}
                  rows={3}
                  maxLength={500}
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div>
                <label className="text-xs md:text-sm font-body font-medium text-muted-foreground mb-1 block">Teks Penutup</label>
                <textarea
                  value={form.closingText}
                  onChange={(e) => setForm({ ...form, closingText: e.target.value })}
                  rows={2}
                  maxLength={300}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </motion.div>

            {/* Reset Data */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl bg-card p-5 shadow-elevated space-y-3">
              <h2 className="font-display text-base md:text-lg font-bold text-destructive">Reset Data</h2>
              <p className="text-xs md:text-sm font-body text-muted-foreground">Hapus semua data tamu dan reset souvenir. Pengaturan acara tidak akan dihapus.</p>
              <button
                onClick={async () => {
                  if (!window.confirm("Apakah Anda yakin ingin menghapus SEMUA data tamu? Tindakan ini tidak dapat dibatalkan.")) return;
                  const { error } = await supabase.from("guests").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                  if (error) {
                    toast({ title: "Error", description: "Gagal mereset data.", variant: "destructive" });
                  } else {
                    toast({ title: "Berhasil", description: "Semua data tamu telah dihapus." });
                  }
                }}
                className="w-full bg-destructive text-destructive-foreground font-body font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
              >
                Hapus Semua Data Tamu
              </button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;

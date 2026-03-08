import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Image, Upload, ToggleLeft, ToggleRight } from "lucide-react";
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
    "w-full rounded-xl bg-card px-4 py-3 text-sm font-body text-card-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-ring";

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
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-foreground">Pengaturan RSVP</h1>
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

      <main className="max-w-lg mx-auto px-5 py-5 space-y-6">
        {/* RSVP Toggle */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card p-5 shadow-elevated">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-card-foreground">Status RSVP</h2>
              <p className="text-xs font-body text-muted-foreground mt-0.5">
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
          <h2 className="font-display text-base font-bold text-foreground">Info Pengantin</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Nama Pengantin Pria</label>
              <input value={form.groomName} onChange={(e) => setForm({ ...form, groomName: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Nama Pengantin Wanita</label>
              <input value={form.brideName} onChange={(e) => setForm({ ...form, brideName: e.target.value })} className={inputClass} />
            </div>
          </div>
        </motion.div>

        {/* Event Details */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
          <h2 className="font-display text-base font-bold text-foreground">Detail Acara</h2>
          <div>
            <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Tanggal Acara</label>
            <input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className={inputClass} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Akad</label>
              <input type="time" value={form.akadTime} onChange={(e) => setForm({ ...form, akadTime: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Resepsi</label>
              <input type="time" value={form.resepsiTime} onChange={(e) => setForm({ ...form, resepsiTime: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Selesai</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Nama Tempat</label>
            <input value={form.venueName} onChange={(e) => setForm({ ...form, venueName: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Alamat Tempat</label>
            <input value={form.venueAddress} onChange={(e) => setForm({ ...form, venueAddress: e.target.value })} className={inputClass} />
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
          <h2 className="font-display text-base font-bold text-foreground">Foto Pengantin</h2>
          <div className="space-y-3">
            {/* Upload */}
            <div>
              <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Upload Foto</label>
              <label className={`flex items-center justify-center gap-2 rounded-xl bg-card py-3 px-4 shadow-card cursor-pointer hover:bg-secondary transition-colors text-sm font-body font-medium text-muted-foreground ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                <Upload className="h-4 w-4" />
                {uploading ? "Mengupload..." : "Pilih Foto dari Perangkat"}
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
                      setForm({ ...form, heroImageUrl: urlData.publicUrl });
                      toast({ title: "Berhasil", description: "Foto berhasil diupload. Jangan lupa klik Simpan." });
                    }
                    setUploading(false);
                  }}
                />
              </label>
            </div>

            {/* URL */}
            <div>
              <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Atau masukkan URL foto</label>
              <input
                value={form.heroImageUrl}
                onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
                placeholder="https://..."
                className={inputClass}
              />
            </div>

            {/* Preview */}
            {form.heroImageUrl && (
              <div className="relative">
                <img src={form.heroImageUrl} alt="Preview" className="rounded-xl h-40 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, heroImageUrl: "" })}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-body font-medium px-2 py-1 rounded-lg"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Invitation Text */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
          <h2 className="font-display text-base font-bold text-foreground">Teks Undangan</h2>
          <div>
            <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Teks Pembuka</label>
            <textarea
              value={form.invitationText}
              onChange={(e) => setForm({ ...form, invitationText: e.target.value })}
              rows={3}
              maxLength={500}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div>
            <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Teks Penutup</label>
            <textarea
              value={form.closingText}
              onChange={(e) => setForm({ ...form, closingText: e.target.value })}
              rows={2}
              maxLength={300}
              className={`${inputClass} resize-none`}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;

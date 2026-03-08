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

            {/* Background Music */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="space-y-3">
              <h2 className="font-display text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                <Music className="h-5 w-5 text-primary" />
                Musik Latar
              </h2>
              <p className="text-xs md:text-sm font-body text-muted-foreground">Pilih musik latar untuk halaman undangan digital.</p>

              {/* Preset songs */}
              {[
                {
                  category: "Instrumental Piano/Akustik",
                  songs: [
                    { title: "Instrumental Piano Romantis", url: "" },
                    { title: "Akustik Guitar Wedding", url: "" },
                  ],
                },
                {
                  category: "Lagu Romantis Indonesia",
                  songs: [
                    { title: "Menikahimu - Kahitna", url: "" },
                    { title: "Janji Suci - Yovie & Nuno", url: "" },
                    { title: "Teman Hidup - Tulus", url: "" },
                  ],
                },
                {
                  category: "Lagu Romantis Barat",
                  songs: [
                    { title: "Perfect - Ed Sheeran", url: "" },
                    { title: "All of Me - John Legend", url: "" },
                    { title: "I'm Yours - Jason Mraz", url: "" },
                  ],
                },
                {
                  category: "Musik Islami",
                  songs: [
                    { title: "Barakallahu Lakuma - Maher Zain", url: "" },
                    { title: "Kupinang Kau dengan Bismillah - Ungu", url: "" },
                  ],
                },
              ].map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <h3 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wide">{cat.category}</h3>
                  <div className="space-y-1">
                    {cat.songs.map((song) => {
                      const isSelected = form.backgroundMusic?.title === song.title && form.backgroundMusic?.category === cat.category;
                      return (
                        <button
                          key={song.title}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setForm({ ...form, backgroundMusic: null });
                            } else {
                              setForm({
                                ...form,
                                backgroundMusic: {
                                  title: song.title,
                                  url: form.backgroundMusic?.title === song.title ? (form.backgroundMusic?.url || "") : "",
                                  category: cat.category,
                                },
                              });
                            }
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-body transition-all ${
                            isSelected
                              ? "gradient-gold text-primary-foreground shadow-card"
                              : "bg-card text-card-foreground hover:bg-secondary"
                          }`}
                        >
                          🎵 {song.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* URL input for selected song */}
              {form.backgroundMusic && (
                <div className="rounded-xl bg-card p-4 shadow-card space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-body font-semibold text-card-foreground">
                      🎶 {form.backgroundMusic.title}
                    </p>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, backgroundMusic: null })}
                      className="p-1 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      value={form.backgroundMusic.url}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          backgroundMusic: { ...form.backgroundMusic!, url: e.target.value },
                        })
                      }
                      placeholder="Paste URL MP3 atau link musik..."
                      className={inputClass}
                    />
                  </div>
                  <p className="text-[10px] font-body text-muted-foreground">
                    Masukkan URL langsung ke file MP3 atau link audio yang bisa diputar.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Spreadsheet Integration */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }} className="rounded-2xl bg-card p-5 shadow-elevated space-y-3">
              <h2 className="font-display text-base md:text-lg font-bold text-card-foreground flex items-center gap-2">
                <Sheet className="h-5 w-5 text-green-600" />
                Integrasi Google Sheets
              </h2>
              <p className="text-xs md:text-sm font-body text-muted-foreground">
                Sinkronisasi data tamu otomatis ke Google Spreadsheet setiap ada perubahan data.
              </p>

              <div className="space-y-2">
                <label className="text-xs md:text-sm font-body font-medium text-muted-foreground block">URL Webhook Google Apps Script</label>
                <input
                  value={form.spreadsheetWebhookUrl}
                  onChange={(e) => setForm({ ...form, spreadsheetWebhookUrl: e.target.value })}
                  placeholder="https://script.google.com/macros/s/xxxxx/exec"
                  className={inputClass}
                />
              </div>

              {form.spreadsheetWebhookUrl && (
                <button
                  type="button"
                  onClick={async () => {
                    toast({ title: "Sinkronisasi...", description: "Mengirim semua data tamu ke spreadsheet." });
                    const { data } = await supabase.from("guests").select("*").order("created_at", { ascending: false });
                    if (data) {
                      const guests = data.map((g: any) => ({
                        id: g.id, name: g.name, gender: g.gender,
                        numberOfGuests: g.number_of_guests, address: g.address || "",
                        envelopeAmount: g.envelope_amount || 0, status: g.status,
                        category: g.category, notes: g.notes || "",
                        souvenirPickedUp: g.souvenir_picked_up, createdAt: new Date(g.created_at),
                      }));
                      await syncAllGuestsToSpreadsheet(guests as any);
                      toast({ title: "Terkirim", description: "Data tamu telah dikirim ke spreadsheet." });
                    }
                  }}
                  className="flex items-center gap-2 bg-green-600 text-white font-body font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Sync Semua Data Sekarang
                </button>
              )}

              {/* Setup Guide */}
              <details className="text-xs font-body text-muted-foreground">
                <summary className="cursor-pointer flex items-center gap-1 font-semibold text-foreground">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Cara Setup Google Apps Script
                </summary>
                <ol className="mt-2 space-y-1.5 pl-4 list-decimal">
                  <li>Buka <strong>Google Sheets</strong> baru</li>
                  <li>Buat header di baris 1: <code>ID, Nama, Gender, Jumlah Tamu, Alamat, Amplop, Status, Kategori, Catatan, Souvenir, Aksi, Timestamp</code></li>
                  <li>Klik <strong>Extensions → Apps Script</strong></li>
                  <li>Hapus kode yang ada, lalu paste kode berikut:</li>
                </ol>
                <pre className="mt-2 bg-secondary rounded-lg p-3 text-[10px] overflow-x-auto whitespace-pre leading-relaxed">{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  if (data.action === "sync_all") {
    // Clear all data except header
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, 12).clear();
    }
    data.guests.forEach(function(g) {
      sheet.appendRow([
        g.id, g.name, g.gender, g.numberOfGuests,
        g.address, g.envelopeAmount, g.status,
        g.category, g.notes, g.souvenirPickedUp,
        "sync_all", data.timestamp
      ]);
    });
  } else if (data.action === "add") {
    var g = data.guest;
    sheet.appendRow([
      g.id, g.name, g.gender, g.numberOfGuests,
      g.address, g.envelopeAmount, g.status,
      g.category, g.notes, g.souvenirPickedUp,
      "add", data.timestamp
    ]);
  } else if (data.action === "update") {
    var g = data.guest;
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === g.id) {
        sheet.getRange(i+1,1,1,12).setValues([[
          g.id, g.name, g.gender, g.numberOfGuests,
          g.address, g.envelopeAmount, g.status,
          g.category, g.notes, g.souvenirPickedUp,
          "update", data.timestamp
        ]]);
        break;
      }
    }
  } else if (data.action === "delete") {
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.guest.id) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({status:"ok"}))
    .setMimeType(ContentService.MimeType.JSON);
}`}</pre>
                <ol className="mt-2 space-y-1.5 pl-4 list-decimal" start={5}>
                  <li>Klik <strong>Deploy → New deployment</strong></li>
                  <li>Pilih type: <strong>Web app</strong></li>
                  <li>Set "Who has access" ke <strong>Anyone</strong></li>
                  <li>Klik <strong>Deploy</strong>, salin URL-nya</li>
                  <li>Paste URL di field di atas, lalu <strong>Simpan</strong></li>
                </ol>
              </details>
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

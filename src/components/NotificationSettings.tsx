import { Bell, BellOff, MessageCircle, UserCheck, CalendarClock } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { motion } from "framer-motion";

export const NotificationSettings = () => {
  const { prefs, permissionState, isSupported, requestPermission, updatePrefs } = usePushNotifications();

  if (!isSupported) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card p-5 shadow-elevated">
        <div className="flex items-center gap-3 mb-2">
          <BellOff className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-display text-base md:text-lg font-bold text-card-foreground">Notifikasi</h2>
        </div>
        <p className="text-xs md:text-sm font-body text-muted-foreground">
          Browser ini tidak mendukung notifikasi push.
        </p>
      </motion.div>
    );
  }

  const isEnabled = prefs.enabled && permissionState === "granted";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card p-5 shadow-elevated space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-display text-base md:text-lg font-bold text-card-foreground">Push Notifikasi</h2>
            <p className="text-[11px] md:text-xs font-body text-muted-foreground">
              {isEnabled ? "Aktif — Anda akan menerima notifikasi" : "Nonaktif"}
            </p>
          </div>
        </div>
        <button
          onClick={async () => {
            if (!isEnabled) {
              if (permissionState === "default") {
                await requestPermission();
              } else if (permissionState === "denied") {
                // Can't programmatically re-request — inform user
                alert("Notifikasi diblokir oleh browser. Silakan aktifkan di pengaturan browser Anda.");
              } else {
                await updatePrefs({ enabled: true });
              }
            } else {
              await updatePrefs({ enabled: false });
            }
          }}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            isEnabled ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-primary-foreground shadow transition-transform ${
              isEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {permissionState === "denied" && (
        <p className="text-xs font-body text-destructive bg-destructive/10 rounded-xl px-3 py-2">
          ⚠️ Notifikasi diblokir oleh browser. Buka pengaturan browser → Izinkan notifikasi untuk situs ini.
        </p>
      )}

      {isEnabled && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wide">Jenis Notifikasi</p>

          {[
            { key: "notifyRsvp" as const, label: "RSVP Baru", desc: "Saat ada tamu yang mengisi RSVP", icon: MessageCircle },
            { key: "notifyCheckin" as const, label: "Tamu Check-in", desc: "Saat tamu hadir & ambil souvenir", icon: UserCheck },
            { key: "notifyReminder" as const, label: "Pengingat Acara", desc: "Pengingat H-3, H-1 sebelum acara", icon: CalendarClock },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => updatePrefs({ [item.key]: !prefs[item.key] })}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                prefs[item.key]
                  ? "bg-primary/10 text-foreground"
                  : "bg-muted/50 text-muted-foreground"
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${prefs[item.key] ? "text-primary" : ""}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-medium">{item.label}</p>
                <p className="text-[11px] font-body text-muted-foreground">{item.desc}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  prefs[item.key] ? "bg-primary border-primary" : "border-muted-foreground/30"
                }`}
              >
                {prefs[item.key] && (
                  <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

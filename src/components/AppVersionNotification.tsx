import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, AlertTriangle, Wrench, Bug, Star, ArrowUpCircle } from "lucide-react";
import { useAppVersion } from "@/hooks/useAppVersion";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const typeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  feature: { icon: <Sparkles className="h-3.5 w-3.5" />, label: "Fitur Baru", color: "text-primary" },
  fix: { icon: <Bug className="h-3.5 w-3.5" />, label: "Perbaikan", color: "text-success" },
  improvement: { icon: <Star className="h-3.5 w-3.5" />, label: "Peningkatan", color: "text-warning" },
  maintenance: { icon: <Wrench className="h-3.5 w-3.5" />, label: "Pemeliharaan", color: "text-muted-foreground" },
};

export function AppVersionNotification() {
  const { latestVersion, hasUpdate, isMaintenance, dismissUpdate, dismissMaintenance } = useAppVersion();

  if (!latestVersion) return null;

  return (
    <AnimatePresence>
      {/* Maintenance Banner */}
      {isMaintenance && (
        <motion.div
          key="maintenance"
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          className="fixed top-0 left-0 right-0 z-[60] bg-warning text-warning-foreground px-4 py-3"
        >
          <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-body font-semibold">Sedang Dalam Pemeliharaan</p>
                <p className="text-xs font-body opacity-90">
                  {latestVersion.maintenance_message || "Aplikasi sedang dalam proses pemeliharaan. Beberapa fitur mungkin tidak berfungsi sementara."}
                </p>
              </div>
            </div>
            <button onClick={dismissMaintenance} className="p-1 rounded-lg hover:bg-warning-foreground/10 shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Update Notification Popup */}
      {hasUpdate && !isMaintenance && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-[55]"
            onClick={dismissUpdate}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="fixed inset-x-4 top-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-[55]"
          >
            <div className="rounded-2xl bg-background shadow-elevated overflow-hidden">
              {/* Header */}
              <div className="gradient-navy p-5 text-primary-foreground relative">
                <button
                  onClick={dismissUpdate}
                  className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-primary-foreground/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                    <ArrowUpCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold">Update Tersedia!</h2>
                    <p className="text-xs font-body opacity-80">
                      Versi {latestVersion.version} · {format(new Date(latestVersion.published_at), "d MMMM yyyy", { locale: id })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4 max-h-[50vh] overflow-y-auto">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">{latestVersion.title}</h3>
                  <p className="text-xs font-body text-muted-foreground mt-1">{latestVersion.description}</p>
                </div>

                {/* Changelog */}
                {latestVersion.changelog.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wide">Detail Perubahan</h4>
                    <div className="space-y-1.5">
                      {latestVersion.changelog.map((item, idx) => {
                        const config = typeConfig[item.type] || typeConfig.feature;
                        return (
                          <div key={idx} className="flex items-start gap-2.5 rounded-xl bg-card p-2.5">
                            <div className={`mt-0.5 ${config.color}`}>
                              {config.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className={`text-[10px] font-body font-semibold uppercase tracking-wide ${config.color}`}>
                                {config.label}
                              </span>
                              <p className="text-xs font-body text-card-foreground">{item.text}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border">
                <button
                  onClick={dismissUpdate}
                  className="w-full gradient-gold text-primary-foreground font-body font-semibold py-3 rounded-xl shadow-card hover:opacity-90 transition-opacity text-sm"
                >
                  Mengerti, Terima Kasih!
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

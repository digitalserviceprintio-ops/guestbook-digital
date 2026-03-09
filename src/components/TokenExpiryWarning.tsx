import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, Download, X, RefreshCw } from "lucide-react";
import { useTokenAuth } from "@/hooks/useTokenAuth";

export function TokenExpiryWarning() {
  const { expiryInfo, tokenLabel } = useTokenAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!expiryInfo.isExpiringSoon || dismissed) return null;

  const days = expiryInfo.daysRemaining ?? 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-lg"
      >
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 backdrop-blur-xl p-4 shadow-elevated">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-display text-sm font-bold text-foreground">
                Token Akan Kadaluarsa
              </h3>
              <p className="text-xs font-body text-muted-foreground">
                Token <span className="font-semibold text-foreground">"{tokenLabel}"</span> akan 
                kadaluarsa dalam <span className="font-bold text-destructive">{days} hari</span>. 
                Segera perpanjang kode akses dan backup data Anda.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href="/backup"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/20 px-3 py-1.5 text-xs font-body font-semibold text-destructive hover:bg-destructive/30 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Backup Data
                </a>
                <button
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-body font-semibold text-primary hover:bg-primary/30 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Perpanjang Token
                </button>
              </div>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-full hover:bg-secondary transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, (days / 14) * 100))}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${days <= 3 ? 'bg-destructive' : days <= 7 ? 'bg-yellow-500' : 'bg-primary'}`}
              />
            </div>
            <span className="text-[10px] font-body text-muted-foreground font-medium">{days}d</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

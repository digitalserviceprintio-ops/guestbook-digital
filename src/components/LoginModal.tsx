import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, X, LogIn } from "lucide-react";
import { useTokenAuth } from "@/hooks/useTokenAuth";
import { useNavigate } from "react-router-dom";

export function LoginModal() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useTokenAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setError("");
    setLoading(true);

    const result = await login(token);
    if (result.ok) {
      setOpen(false);
      setToken("");
      navigate("/dashboard");
    } else {
      setError(result.error || "Token tidak valid atau sudah dinonaktifkan.");
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating Login Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 gradient-hero text-primary-foreground font-body font-semibold px-5 py-3 rounded-full shadow-elevated hover:shadow-glow transition-all text-sm"
      >
        <LogIn className="h-4 w-4" />
        Login Admin
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-md z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-5"
            >
              <div className="w-full max-w-sm rounded-2xl glass-strong p-6 shadow-elevated space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
                      <KeyRound className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <h2 className="font-display text-lg font-bold text-foreground">Login Admin</h2>
                  </div>
                  <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-secondary/80 transition-colors">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>

                <p className="text-xs font-body text-muted-foreground">
                  Masukkan token akses untuk mengelola buku tamu dan dashboard.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => { setToken(e.target.value); setError(""); }}
                    placeholder="Masukkan token akses..."
                    className="w-full rounded-xl bg-background/60 backdrop-blur-sm px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground border border-border/50 outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                    autoFocus
                  />
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-body text-destructive"
                    >
                      {error}
                    </motion.p>
                  )}
                  <motion.button
                    type="submit"
                    disabled={loading || !token.trim()}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full gradient-hero text-primary-foreground font-body font-semibold py-3 rounded-xl shadow-elevated hover:shadow-glow transition-all text-sm disabled:opacity-50"
                  >
                    {loading ? "Memverifikasi..." : "Masuk"}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

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
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 gradient-navy text-primary-foreground font-body font-semibold px-5 py-3 rounded-full shadow-elevated hover:opacity-90 transition-opacity text-sm"
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
              className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-5"
            >
              <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-elevated space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl gradient-gold flex items-center justify-center">
                      <KeyRound className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <h2 className="font-display text-lg font-bold text-foreground">Login Admin</h2>
                  </div>
                  <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-secondary transition-colors">
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
                    className="w-full rounded-xl bg-card px-4 py-3 text-sm font-body text-card-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                  />
                  {error && (
                    <p className="text-xs font-body text-destructive">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading || !token.trim()}
                    className="w-full gradient-gold text-primary-foreground font-body font-semibold py-3 rounded-xl shadow-elevated hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
                  >
                    {loading ? "Memverifikasi..." : "Masuk"}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

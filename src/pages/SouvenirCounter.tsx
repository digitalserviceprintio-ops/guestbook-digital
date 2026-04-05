import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Gift, CheckCircle2, ChevronLeft, ChevronRight, Search, Undo2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGuests } from "@/hooks/useGuests";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 20;

const SouvenirCounter = () => {
  const navigate = useNavigate();
  const { allGuests, updateGuest } = useGuests();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const hadirGuests = useMemo(
    () => allGuests.filter((g) => g.status === "hadir"),
    [allGuests]
  );

  const filteredGuests = useMemo(() => {
    if (!searchQuery) return hadirGuests;
    const q = searchQuery.toLowerCase();
    return hadirGuests.filter(
      (g) => g.name.toLowerCase().includes(q) || g.address.toLowerCase().includes(q)
    );
  }, [hadirGuests, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedGuests = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredGuests.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGuests, safePage]);

  const souvenirStats = {
    total: hadirGuests.length,
    pickedUp: allGuests.filter((g) => g.souvenirPickedUp).length,
    remaining: hadirGuests.filter((g) => !g.souvenirPickedUp).length,
  };

  const handleToggleSouvenir = async (guestId: string, currentStatus: boolean) => {
    await updateGuest(guestId, { souvenirPickedUp: !currentStatus });
    toast.success(currentStatus ? "Status souvenir dibatalkan" : "Souvenir berhasil diambil!");
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

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
            <h1 className="font-display text-lg md:text-xl font-bold text-foreground">Counter Souvenir</h1>
            <p className="text-[11px] md:text-xs font-body text-muted-foreground">Kelola pengambilan souvenir tamu</p>
          </div>
        </div>
      </motion.header>

      <main className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-5 py-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-card p-3 md:p-4 shadow-card text-center">
            <p className="text-[10px] md:text-xs font-body text-muted-foreground">Tamu Hadir</p>
            <p className="text-xl md:text-2xl font-display font-bold text-card-foreground">{souvenirStats.total}</p>
          </div>
          <div className="rounded-xl bg-card p-3 md:p-4 shadow-card text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <CheckCircle2 className="h-3 w-3 text-success" />
              <p className="text-[10px] md:text-xs font-body text-muted-foreground">Sudah Ambil</p>
            </div>
            <p className="text-xl md:text-2xl font-display font-bold text-success">{souvenirStats.pickedUp}</p>
          </div>
          <div className="rounded-xl bg-card p-3 md:p-4 shadow-card text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Gift className="h-3 w-3 text-primary" />
              <p className="text-[10px] md:text-xs font-body text-muted-foreground">Belum Ambil</p>
            </div>
            <p className="text-xl md:text-2xl font-display font-bold text-primary">{souvenirStats.remaining}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama tamu..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full rounded-xl bg-card pl-10 pr-4 py-3 text-sm font-body text-card-foreground placeholder:text-muted-foreground shadow-card border-0 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Guest list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base md:text-lg font-bold text-foreground">Daftar Pengambilan</h2>
            {filteredGuests.length > 0 && (
              <span className="text-xs font-body text-muted-foreground">
                {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredGuests.length)} dari {filteredGuests.length}
              </span>
            )}
          </div>
          <div className="space-y-2">
            {paginatedGuests.map((guest) => (
              <motion.div
                key={guest.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl bg-card p-3 md:p-4 shadow-card flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-body font-semibold text-sm text-card-foreground truncate">{guest.name}</p>
                  <p className="text-[11px] font-body text-muted-foreground">{guest.numberOfGuests} orang</p>
                </div>
                <div className="shrink-0">
                  {guest.souvenirPickedUp ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 bg-success/10 text-success text-xs font-body font-semibold px-3 py-1.5 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Sudah
                      </span>
                      <button
                        onClick={() => handleToggleSouvenir(guest.id, true)}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                        title="Batalkan"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleToggleSouvenir(guest.id, false)}
                      className="flex items-center gap-1.5 gradient-gold text-primary-foreground text-xs font-body font-semibold px-4 py-2 rounded-full shadow-card hover:opacity-90 transition-opacity active:scale-95"
                    >
                      <Gift className="h-3.5 w-3.5" />
                      Ambil
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            {filteredGuests.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-6 font-body">
                {searchQuery ? "Tidak ada tamu ditemukan" : "Belum ada tamu yang hadir"}
              </p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} className="px-2 text-xs text-muted-foreground">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`min-w-[32px] h-8 rounded-lg text-xs font-body font-medium transition-all ${
                      safePage === p
                        ? "gradient-gold text-primary-foreground shadow-card"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SouvenirCounter;

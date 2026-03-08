import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen, FileBarChart, Heart, Users2, Gift, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGuests } from "@/hooks/useGuests";
import { StatsCards } from "@/components/StatsCards";
import { GuestList } from "@/components/GuestList";
import { GuestForm } from "@/components/GuestForm";
import { Guest, GuestCategory, categoryLabels } from "@/types/guest";
import { useToast } from "@/hooks/use-toast";

const categoryTabs: { value: GuestCategory; label: string; icon: typeof Heart }[] = [
  { value: "pengantin", label: "Pengantin", icon: Heart },
  { value: "orang_tua", label: "Orang Tua", icon: Users2 },
];

const Index = () => {
  const {
    guests,
    allGuests,
    stats,
    globalStats,
    filter,
    setFilter,
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    addGuest,
    updateGuest,
    deleteGuest,
  } = useGuests();

  const [formOpen, setFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteGuest(id);
    toast({ title: "Tamu dihapus", description: "Data tamu berhasil dihapus." });
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingGuest(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-5 py-4"
      >
        <div className="flex items-center justify-between max-w-lg md:max-w-2xl lg:max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl gradient-gold flex items-center justify-center shadow-card">
              <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
                Buku Tamu
              </h1>
              <p className="text-[11px] md:text-xs font-body text-muted-foreground">
                Manajemen Undangan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/souvenir")}
              className="p-2.5 rounded-xl bg-card shadow-card hover:bg-secondary transition-colors text-muted-foreground"
              title="Souvenir"
            >
              <Gift className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/laporan")}
              className="p-2.5 rounded-xl bg-card shadow-card hover:bg-secondary transition-colors text-muted-foreground"
              title="Laporan"
            >
              <FileBarChart className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="p-2.5 rounded-xl bg-card shadow-card hover:bg-secondary transition-colors text-muted-foreground"
              title="Pengaturan"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="max-w-lg md:max-w-2xl lg:max-w-5xl mx-auto px-5 py-5 pb-24 space-y-5">
        {/* Category Tabs */}
        <div className="flex rounded-xl bg-card p-1 shadow-card max-w-md">
          {categoryTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveCategory(tab.value);
                setFilter("all");
                setSearch("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-body font-medium transition-all ${
                activeCategory === tab.value
                  ? "gradient-gold text-primary-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <StatsCards {...stats} />

        <div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground mb-3">
            Tamu {categoryLabels[activeCategory]}
          </h2>
          <GuestList
            guests={guests}
            filter={filter}
            search={search}
            onFilterChange={setFilter}
            onSearchChange={setSearch}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onShowQR={(guest) => navigate(`/guest-qr/${guest.id}`)}
          />
        </div>
      </main>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
        onClick={() => {
          setEditingGuest(null);
          setFormOpen(true);
        }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 h-14 w-14 rounded-full gradient-gold shadow-elevated flex items-center justify-center z-30 hover:opacity-90 transition-opacity"
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </motion.button>

      {/* Form Sheet */}
      <GuestForm
        open={formOpen}
        guest={editingGuest}
        category={activeCategory}
        onClose={handleCloseForm}
        onSave={(data) => {
          addGuest(data);
          toast({ title: "Tamu ditambahkan", description: `${data.name} berhasil ditambahkan.` });
        }}
        onUpdate={updateGuest}
      />
    </div>
  );
};

export default Index;

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen, Download } from "lucide-react";
import { exportGuestsToCSV } from "@/lib/exportCSV";
import { useGuests } from "@/hooks/useGuests";
import { StatsCards } from "@/components/StatsCards";
import { GuestList } from "@/components/GuestList";
import { GuestForm } from "@/components/GuestForm";
import { Guest } from "@/types/guest";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const {
    guests,
    allGuests,
    stats,
    filter,
    setFilter,
    search,
    setSearch,
    addGuest,
    updateGuest,
    deleteGuest,
  } = useGuests();

  const [formOpen, setFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const { toast } = useToast();

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
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="h-9 w-9 rounded-xl gradient-gold flex items-center justify-center shadow-card">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground leading-tight">
              Buku Tamu
            </h1>
            <p className="text-[11px] font-body text-muted-foreground">
              Manajemen Undangan
            </p>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-5 py-5 pb-24 space-y-6">
        <StatsCards {...stats} />
        <div>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">
            Daftar Tamu
          </h2>
          <GuestList
            guests={guests}
            filter={filter}
            search={search}
            onFilterChange={setFilter}
            onSearchChange={setSearch}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full gradient-gold shadow-elevated flex items-center justify-center z-30 hover:opacity-90 transition-opacity"
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </motion.button>

      {/* Form Sheet */}
      <GuestForm
        open={formOpen}
        guest={editingGuest}
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

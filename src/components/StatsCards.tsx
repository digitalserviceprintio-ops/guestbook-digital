import { motion } from "framer-motion";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

interface StatsProps {
  total: number;
  hadir: number;
  tidakHadir: number;
  belum: number;
  totalTamu: number;
}

const cards = [
  { key: "total", label: "Total Undangan", icon: Users, colorClass: "text-primary" },
  { key: "hadir", label: "Hadir", icon: UserCheck, colorClass: "text-success" },
  { key: "tidakHadir", label: "Tidak Hadir", icon: UserX, colorClass: "text-destructive" },
  { key: "belum", label: "Belum Konfirmasi", icon: Clock, colorClass: "text-pending" },
] as const;

export function StatsCards({ total, hadir, tidakHadir, belum, totalTamu }: StatsProps) {
  const values = { total, hadir, tidakHadir, belum };

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-xl bg-card p-4 shadow-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <card.icon className={`h-4 w-4 ${card.colorClass}`} />
            <span className="text-xs font-body text-muted-foreground">{card.label}</span>
          </div>
          <p className="text-2xl font-display font-bold text-card-foreground">
            {values[card.key]}
          </p>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="col-span-2 rounded-xl gradient-gold p-4 shadow-elevated"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-body text-primary-foreground/80">Total Tamu (termasuk pendamping)</p>
            <p className="text-3xl font-display font-bold text-primary-foreground">{totalTamu}</p>
          </div>
          <Users className="h-8 w-8 text-primary-foreground/60" />
        </div>
      </motion.div>
    </div>
  );
}

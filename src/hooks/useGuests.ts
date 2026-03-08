import { useState, useCallback, useMemo, useEffect } from "react";
import { Guest, AttendanceStatus } from "@/types/guest";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useGuests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AttendanceStatus | "all">("all");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  // Fetch guests from database
  const fetchGuests = useCallback(async () => {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Gagal memuat data tamu.", variant: "destructive" });
      return;
    }

    setGuests(
      (data || []).map((g) => ({
        id: g.id,
        name: g.name,
        phone: g.phone || "",
        numberOfGuests: g.number_of_guests,
        status: g.status as AttendanceStatus,
        notes: g.notes || "",
        createdAt: new Date(g.created_at),
      }))
    );
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchGuests();

    // Realtime subscription
    const channel = supabase
      .channel("guests-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, () => {
        fetchGuests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchGuests]);

  const addGuest = useCallback(
    async (guest: Omit<Guest, "id" | "createdAt">) => {
      const { error } = await supabase.from("guests").insert({
        name: guest.name,
        phone: guest.phone,
        number_of_guests: guest.numberOfGuests,
        status: guest.status,
        notes: guest.notes,
      });

      if (error) {
        toast({ title: "Error", description: "Gagal menambahkan tamu.", variant: "destructive" });
      } else {
        await fetchGuests();
      }
    },
    [toast, fetchGuests]
  );

  const updateGuest = useCallback(
    async (id: string, data: Partial<Guest>) => {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.numberOfGuests !== undefined) updateData.number_of_guests = data.numberOfGuests;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const { error } = await supabase.from("guests").update(updateData).eq("id", id);

      if (error) {
        toast({ title: "Error", description: "Gagal mengupdate tamu.", variant: "destructive" });
      }
    },
    [toast]
  );

  const deleteGuest = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("guests").delete().eq("id", id);

      if (error) {
        toast({ title: "Error", description: "Gagal menghapus tamu.", variant: "destructive" });
      }
    },
    [toast]
  );

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchesFilter = filter === "all" || g.status === filter;
      const matchesSearch =
        search === "" ||
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.phone.includes(search);
      return matchesFilter && matchesSearch;
    });
  }, [guests, filter, search]);

  const stats = useMemo(() => {
    const total = guests.length;
    const hadir = guests.filter((g) => g.status === "hadir").length;
    const tidakHadir = guests.filter((g) => g.status === "tidak_hadir").length;
    const belum = guests.filter((g) => g.status === "belum_konfirmasi").length;
    const totalTamu = guests.reduce((sum, g) => sum + g.numberOfGuests, 0);
    return { total, hadir, tidakHadir, belum, totalTamu };
  }, [guests]);

  return {
    guests: filteredGuests,
    allGuests: guests,
    stats,
    filter,
    setFilter,
    search,
    setSearch,
    addGuest,
    updateGuest,
    deleteGuest,
    loading,
  };
}

import { useState, useCallback, useMemo, useEffect } from "react";
import { Guest, AttendanceStatus, GuestCategory } from "@/types/guest";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { syncGuestToSpreadsheet } from "@/lib/syncSpreadsheet";
import { useTokenAuth } from "@/hooks/useTokenAuth";

export function useGuests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AttendanceStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<GuestCategory>("pengantin");
  const { toast } = useToast();
  const { tokenRole, isAuthenticated } = useTokenAuth();

  // Get current token from localStorage
  const getCurrentToken = useCallback(() => localStorage.getItem("access_token") || "", []);
  const fetchGuests = useCallback(async () => {
    let query = supabase
      .from("guests")
      .select("*")
      .order("created_at", { ascending: false });

    // Operator only sees their own data; admin sees all
    const currentToken = getCurrentToken();
    if (isAuthenticated && tokenRole === "operator" && currentToken) {
      query = query.eq("owner_token", currentToken);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: "Error", description: "Gagal memuat data tamu.", variant: "destructive" });
      return;
    }

    setGuests(
      (data || []).map((g) => ({
        id: g.id,
        name: g.name,
        gender: (g.gender || "laki_laki") as "laki_laki" | "perempuan",
        numberOfGuests: g.number_of_guests,
        address: g.address || "",
        envelopeAmount: g.envelope_amount || 0,
        status: g.status as AttendanceStatus,
        category: g.category as GuestCategory,
        notes: g.notes || "",
        souvenirPickedUp: g.souvenir_picked_up ?? false,
        createdAt: new Date(g.created_at),
      }))
    );
    setLoading(false);
  }, [toast, tokenRole, isAuthenticated, getCurrentToken]);

  useEffect(() => {
    fetchGuests();
    const channel = supabase
      .channel("guests-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, () => {
        fetchGuests();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchGuests]);

  const addGuest = useCallback(
    async (guest: Omit<Guest, "id" | "createdAt">) => {
      const currentToken = getCurrentToken();
      const insertData: Record<string, unknown> = {
        name: guest.name,
        gender: guest.gender,
        number_of_guests: guest.numberOfGuests,
        address: guest.address,
        envelope_amount: guest.envelopeAmount,
        status: guest.status,
        category: guest.category,
        notes: guest.notes,
      };
      if (currentToken) {
        insertData.owner_token = currentToken;
      }
      const { error } = await supabase.from("guests").insert(insertData as any);
      if (error) {
        toast({ title: "Error", description: "Gagal menambahkan tamu.", variant: "destructive" });
      } else {
        await fetchGuests();
        // Sync to spreadsheet (non-blocking)
        syncGuestToSpreadsheet("add", { id: "", ...guest });
      }
    },
    [toast, fetchGuests]
  );

  const updateGuest = useCallback(
    async (id: string, data: Partial<Guest>) => {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.gender !== undefined) updateData.gender = data.gender;
      if (data.numberOfGuests !== undefined) updateData.number_of_guests = data.numberOfGuests;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.envelopeAmount !== undefined) updateData.envelope_amount = data.envelopeAmount;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const { error } = await supabase.from("guests").update(updateData).eq("id", id);
      if (error) {
        toast({ title: "Error", description: "Gagal mengupdate tamu.", variant: "destructive" });
      } else {
        await fetchGuests();
        syncGuestToSpreadsheet("update", { id, ...data });
      }
    },
    [toast, fetchGuests]
  );

  const deleteGuest = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("guests").delete().eq("id", id);
      if (error) {
        toast({ title: "Error", description: "Gagal menghapus tamu.", variant: "destructive" });
      } else {
        await fetchGuests();
        syncGuestToSpreadsheet("delete", { id, name: "" });
      }
    },
    [toast, fetchGuests]
  );

  const categoryGuests = useMemo(() => {
    return guests.filter((g) => g.category === activeCategory);
  }, [guests, activeCategory]);

  const filteredGuests = useMemo(() => {
    return categoryGuests.filter((g) => {
      const matchesFilter = filter === "all" || g.status === filter;
      const matchesSearch =
        search === "" ||
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.address.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [categoryGuests, filter, search]);

  const statsForCategory = useCallback(
    (cat: GuestCategory) => {
      const catGuests = guests.filter((g) => g.category === cat);
      const total = catGuests.length;
      const hadir = catGuests.filter((g) => g.status === "hadir").length;
      const tidakHadir = catGuests.filter((g) => g.status === "tidak_hadir").length;
      const belum = catGuests.filter((g) => g.status === "belum_konfirmasi").length;
      const totalTamu = catGuests.reduce((sum, g) => sum + g.numberOfGuests, 0);
      const totalAmplop = catGuests.reduce((sum, g) => sum + g.envelopeAmount, 0);
      return { total, hadir, tidakHadir, belum, totalTamu, totalAmplop };
    },
    [guests]
  );

  const stats = useMemo(() => statsForCategory(activeCategory), [statsForCategory, activeCategory]);

  const globalStats = useMemo(() => {
    const total = guests.length;
    const totalTamu = guests.reduce((sum, g) => sum + g.numberOfGuests, 0);
    const totalAmplop = guests.reduce((sum, g) => sum + g.envelopeAmount, 0);
    return { total, totalTamu, totalAmplop };
  }, [guests]);

  return {
    guests: filteredGuests,
    allGuests: guests,
    categoryGuests,
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
    loading,
  };
}

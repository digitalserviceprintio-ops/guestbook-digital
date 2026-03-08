import { useState, useCallback, useMemo } from "react";
import { Guest, AttendanceStatus } from "@/types/guest";

const STORAGE_KEY = "guest-book-data";

function loadGuests(): Guest[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data).map((g: any) => ({
        ...g,
        createdAt: new Date(g.createdAt),
      }));
    }
  } catch {}
  return [];
}

function saveGuests(guests: Guest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
}

export function useGuests() {
  const [guests, setGuests] = useState<Guest[]>(loadGuests);
  const [filter, setFilter] = useState<AttendanceStatus | "all">("all");
  const [search, setSearch] = useState("");

  const updateGuests = useCallback((updater: (prev: Guest[]) => Guest[]) => {
    setGuests((prev) => {
      const next = updater(prev);
      saveGuests(next);
      return next;
    });
  }, []);

  const addGuest = useCallback(
    (guest: Omit<Guest, "id" | "createdAt">) => {
      updateGuests((prev) => [
        ...prev,
        { ...guest, id: crypto.randomUUID(), createdAt: new Date() },
      ]);
    },
    [updateGuests]
  );

  const updateGuest = useCallback(
    (id: string, data: Partial<Guest>) => {
      updateGuests((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...data } : g))
      );
    },
    [updateGuests]
  );

  const deleteGuest = useCallback(
    (id: string) => {
      updateGuests((prev) => prev.filter((g) => g.id !== id));
    },
    [updateGuests]
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
  };
}

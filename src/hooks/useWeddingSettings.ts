import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WeddingSettings {
  id: string;
  groomName: string;
  brideName: string;
  eventDate: string;
  akadTime: string;
  resepsiTime: string;
  endTime: string;
  venueName: string;
  venueAddress: string;
  invitationText: string;
  closingText: string;
  heroImageUrl: string;
  rsvpOpen: boolean;
}

const defaultSettings: WeddingSettings = {
  id: "",
  groomName: "Ahmad",
  brideName: "Siti",
  eventDate: "2026-06-15",
  akadTime: "08:00",
  resepsiTime: "10:00",
  endTime: "14:00",
  venueName: "Gedung Serbaguna Mawar",
  venueAddress: "Jl. Mawar No. 123, Jakarta Selatan",
  invitationText: "Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.",
  closingText: "Merupakan suatu kehormatan dan kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir.",
  heroImageUrl: "",
  rsvpOpen: true,
};

export function useWeddingSettings() {
  const [settings, setSettings] = useState<WeddingSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from("wedding_settings")
      .select("*")
      .limit(1)
      .single();

    if (!error && data) {
      setSettings({
        id: data.id,
        groomName: data.groom_name,
        brideName: data.bride_name,
        eventDate: data.event_date,
        akadTime: data.akad_time,
        resepsiTime: data.resepsi_time,
        endTime: data.end_time,
        venueName: data.venue_name,
        venueAddress: data.venue_address,
        invitationText: data.invitation_text,
        closingText: data.closing_text,
        heroImageUrl: data.hero_image_url || "",
        rsvpOpen: data.rsvp_open,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(
    async (updates: Partial<WeddingSettings>) => {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.groomName !== undefined) dbUpdates.groom_name = updates.groomName;
      if (updates.brideName !== undefined) dbUpdates.bride_name = updates.brideName;
      if (updates.eventDate !== undefined) dbUpdates.event_date = updates.eventDate;
      if (updates.akadTime !== undefined) dbUpdates.akad_time = updates.akadTime;
      if (updates.resepsiTime !== undefined) dbUpdates.resepsi_time = updates.resepsiTime;
      if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
      if (updates.venueName !== undefined) dbUpdates.venue_name = updates.venueName;
      if (updates.venueAddress !== undefined) dbUpdates.venue_address = updates.venueAddress;
      if (updates.invitationText !== undefined) dbUpdates.invitation_text = updates.invitationText;
      if (updates.closingText !== undefined) dbUpdates.closing_text = updates.closingText;
      if (updates.heroImageUrl !== undefined) dbUpdates.hero_image_url = updates.heroImageUrl;
      if (updates.rsvpOpen !== undefined) dbUpdates.rsvp_open = updates.rsvpOpen;

      const { error } = await supabase
        .from("wedding_settings")
        .update(dbUpdates)
        .eq("id", settings.id);

      if (error) {
        toast({ title: "Error", description: "Gagal menyimpan pengaturan.", variant: "destructive" });
        return false;
      }

      setSettings((prev) => ({ ...prev, ...updates }));
      return true;
    },
    [settings.id, toast]
  );

  return { settings, loading, updateSettings, refetch: fetchSettings };
}

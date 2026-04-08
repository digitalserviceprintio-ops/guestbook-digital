import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BackgroundMusic {
  title: string;
  url: string;
  category: string;
}

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
  heroImages: string[];
  backgroundMusic: BackgroundMusic | null;
  spreadsheetWebhookUrl: string;
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
  heroImages: [],
  backgroundMusic: null,
  spreadsheetWebhookUrl: "",
  rsvpOpen: true,
};

function mapRow(data: any): WeddingSettings {
  const rawImages = data.hero_images;
  const heroImages: string[] = Array.isArray(rawImages) ? rawImages : [];
  const rawMusic = data.background_music;
  return {
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
    heroImages,
    backgroundMusic: rawMusic && typeof rawMusic === "object" && !Array.isArray(rawMusic) ? rawMusic as BackgroundMusic : null,
    spreadsheetWebhookUrl: data.spreadsheet_webhook_url || "",
    rsvpOpen: data.rsvp_open,
  };
}

/**
 * Hook for wedding settings. 
 * - If ownerToken is provided, loads/creates settings for that token (operator isolation).
 * - If no ownerToken, loads the shared default settings (owner_token IS NULL).
 */
export function useWeddingSettings(ownerToken?: string | null) {
  const [settings, setSettings] = useState<WeddingSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Resolve token: explicit param > localStorage (if logged in)
  const resolvedToken = ownerToken !== undefined
    ? ownerToken
    : (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);

    if (resolvedToken) {
      // Try to get operator-specific settings
      const { data: tokenData } = await (supabase
        .from("wedding_settings")
        .select("*") as any)
        .eq("owner_token", resolvedToken)
        .maybeSingle();

      if (tokenData) {
        setSettings(mapRow(tokenData));
        setLoading(false);
        return;
      }

      // No operator-specific settings yet — load default and auto-create a copy
      const { data: defaultData } = await (supabase
        .from("wedding_settings")
        .select("*") as any)
        .is("owner_token", null)
        .limit(1)
        .single();

      if (defaultData) {
        // Create a copy for this operator (with empty hero images so they upload their own)
        const { data: newRow, error: insertErr } = await supabase
          .from("wedding_settings")
          .insert({
            groom_name: defaultData.groom_name,
            bride_name: defaultData.bride_name,
            event_date: defaultData.event_date,
            akad_time: defaultData.akad_time,
            resepsi_time: defaultData.resepsi_time,
            end_time: defaultData.end_time,
            venue_name: defaultData.venue_name,
            venue_address: defaultData.venue_address,
            invitation_text: defaultData.invitation_text,
            closing_text: defaultData.closing_text,
            hero_image_url: "",
            hero_images: [] as any,
            background_music: defaultData.background_music,
            spreadsheet_webhook_url: defaultData.spreadsheet_webhook_url,
            rsvp_open: defaultData.rsvp_open,
            owner_token: resolvedToken,
          } as any)
          .select()
          .single();

        if (!insertErr && newRow) {
          setSettings(mapRow(newRow));
        } else {
          // Fallback to default
          setSettings(mapRow(defaultData));
        }
      }
    } else {
      // Public/admin: load shared default (owner_token IS NULL)
      const { data } = await supabase
        .from("wedding_settings")
        .select("*")
        .is("owner_token" as any, null)
        .limit(1)
        .single();

      if (data) {
        setSettings(mapRow(data));
      }
    }

    setLoading(false);
  }, [resolvedToken]);

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
      if (updates.heroImages !== undefined) dbUpdates.hero_images = updates.heroImages;
      if (updates.backgroundMusic !== undefined) dbUpdates.background_music = updates.backgroundMusic;
      if (updates.spreadsheetWebhookUrl !== undefined) dbUpdates.spreadsheet_webhook_url = updates.spreadsheetWebhookUrl;
      if (updates.rsvpOpen !== undefined) dbUpdates.rsvp_open = updates.rsvpOpen;

      const { error } = await supabase
        .from("wedding_settings")
        .update(dbUpdates as any)
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

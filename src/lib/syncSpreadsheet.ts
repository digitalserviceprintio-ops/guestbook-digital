import { supabase } from "@/integrations/supabase/client";
import { Guest } from "@/types/guest";

async function getWebhookUrl(): Promise<string | null> {
  const { data } = await supabase
    .from("wedding_settings")
    .select("spreadsheet_webhook_url")
    .limit(1)
    .single();
  const url = (data as any)?.spreadsheet_webhook_url;
  return url && url.trim() ? url.trim() : null;
}

export async function syncGuestToSpreadsheet(
  action: "add" | "update" | "delete",
  guest: Partial<Guest> & { id: string; name?: string }
) {
  try {
    const webhookUrl = await getWebhookUrl();
    if (!webhookUrl) return;

    await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        timestamp: new Date().toISOString(),
        guest: {
          id: guest.id,
          name: guest.name || "",
          gender: guest.gender || "",
          numberOfGuests: guest.numberOfGuests ?? 1,
          address: guest.address || "",
          envelopeAmount: guest.envelopeAmount ?? 0,
          status: guest.status || "",
          category: guest.category || "",
          notes: guest.notes || "",
          souvenirPickedUp: guest.souvenirPickedUp ?? false,
        },
      }),
    });
  } catch (err) {
    console.warn("Spreadsheet sync failed (non-blocking):", err);
  }
}

export async function syncAllGuestsToSpreadsheet(guests: Guest[]) {
  try {
    const webhookUrl = await getWebhookUrl();
    if (!webhookUrl) return;

    await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sync_all",
        timestamp: new Date().toISOString(),
        guests: guests.map((g) => ({
          id: g.id,
          name: g.name,
          gender: g.gender,
          numberOfGuests: g.numberOfGuests,
          address: g.address,
          envelopeAmount: g.envelopeAmount,
          status: g.status,
          category: g.category,
          notes: g.notes,
          souvenirPickedUp: g.souvenirPickedUp,
        })),
      }),
    });
  } catch (err) {
    console.warn("Spreadsheet full sync failed (non-blocking):", err);
  }
}

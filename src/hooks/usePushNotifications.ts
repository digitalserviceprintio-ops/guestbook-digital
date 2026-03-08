import { useEffect, useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceFingerprint } from "@/lib/deviceFingerprint";

interface NotificationPrefs {
  enabled: boolean;
  notifyRsvp: boolean;
  notifyCheckin: boolean;
  notifyReminder: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  enabled: false,
  notifyRsvp: true,
  notifyCheckin: true,
  notifyReminder: true,
};

function getLocalPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem("notification_prefs");
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

function saveLocalPrefs(prefs: NotificationPrefs) {
  localStorage.setItem("notification_prefs", JSON.stringify(prefs));
}

export function showNotification(title: string, body: string, icon?: string) {
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: icon || "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: `buku-tamu-${Date.now()}`,
    });
  } catch {
    // SW fallback
    navigator.serviceWorker?.ready.then((reg) => {
      reg.showNotification(title, {
        body,
        icon: icon || "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        tag: `buku-tamu-${Date.now()}`,
      });
    });
  }
}

export function usePushNotifications() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(getLocalPrefs);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "denied" as NotificationPermission;
    const result = await Notification.requestPermission();
    setPermissionState(result);
    if (result === "granted") {
      const newPrefs = { ...prefs, enabled: true };
      setPrefs(newPrefs);
      saveLocalPrefs(newPrefs);
      // Save to DB
      const fp = getDeviceFingerprint();
      await supabase.from("notification_subscriptions").upsert(
        { device_fingerprint: fp, enabled: true, notify_rsvp: true, notify_checkin: true, notify_reminder: true },
        { onConflict: "device_fingerprint" }
      );
    }
    return result;
  }, [prefs]);

  const updatePrefs = useCallback(async (updates: Partial<NotificationPrefs>) => {
    const newPrefs = { ...prefs, ...updates };
    setPrefs(newPrefs);
    saveLocalPrefs(newPrefs);
    const fp = getDeviceFingerprint();
    await supabase.from("notification_subscriptions").upsert(
      {
        device_fingerprint: fp,
        enabled: newPrefs.enabled,
        notify_rsvp: newPrefs.notifyRsvp,
        notify_checkin: newPrefs.notifyCheckin,
        notify_reminder: newPrefs.notifyReminder,
      },
      { onConflict: "device_fingerprint" }
    );
  }, [prefs]);

  // Listen for guest changes and show notifications
  useEffect(() => {
    if (!prefs.enabled || permissionState !== "granted") return;

    channelRef.current = supabase
      .channel("notification-listener")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "guests" },
        (payload) => {
          if (prefs.notifyRsvp) {
            const guest = payload.new as { name: string; status: string; number_of_guests: number };
            const statusLabel = guest.status === "hadir" ? "akan hadir" : guest.status === "tidak_hadir" ? "tidak hadir" : "belum konfirmasi";
            showNotification(
              "📩 RSVP Baru!",
              `${guest.name} (${guest.number_of_guests} orang) - ${statusLabel}`
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "guests" },
        (payload) => {
          const oldGuest = payload.old as { status?: string; souvenir_picked_up?: boolean };
          const newGuest = payload.new as { name: string; status: string; souvenir_picked_up: boolean; number_of_guests: number };

          // Check-in notification
          if (prefs.notifyCheckin && oldGuest.status !== "hadir" && newGuest.status === "hadir") {
            showNotification(
              "✅ Tamu Check-in!",
              `${newGuest.name} (${newGuest.number_of_guests} orang) telah hadir`
            );
          }

          // Souvenir notification
          if (prefs.notifyCheckin && !oldGuest.souvenir_picked_up && newGuest.souvenir_picked_up) {
            showNotification(
              "🎁 Souvenir Diambil",
              `${newGuest.name} telah mengambil souvenir`
            );
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [prefs.enabled, prefs.notifyRsvp, prefs.notifyCheckin, permissionState]);

  // Event reminder check
  useEffect(() => {
    if (!prefs.enabled || !prefs.notifyReminder || permissionState !== "granted") return;

    const checkReminder = async () => {
      const { data } = await supabase.from("wedding_settings").select("event_date, groom_name, bride_name").limit(1).single();
      if (!data?.event_date) return;

      const eventDate = new Date(data.event_date);
      const now = new Date();
      const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const lastReminder = localStorage.getItem("last_reminder_day");
      const todayStr = now.toISOString().slice(0, 10);

      if (lastReminder === todayStr) return; // Already reminded today

      if (diffDays === 3) {
        showNotification("📅 Pengingat H-3", `Pernikahan ${data.groom_name} & ${data.bride_name} tinggal 3 hari lagi!`);
        localStorage.setItem("last_reminder_day", todayStr);
      } else if (diffDays === 1) {
        showNotification("📅 Pengingat H-1", `Pernikahan ${data.groom_name} & ${data.bride_name} besok! Persiapkan semuanya.`);
        localStorage.setItem("last_reminder_day", todayStr);
      } else if (diffDays === 0) {
        showNotification("🎉 Hari Pernikahan!", `Selamat menempuh hidup baru, ${data.groom_name} & ${data.bride_name}!`);
        localStorage.setItem("last_reminder_day", todayStr);
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, [prefs.enabled, prefs.notifyReminder, permissionState]);

  return {
    prefs,
    permissionState,
    isSupported: typeof Notification !== "undefined",
    requestPermission,
    updatePrefs,
  };
}

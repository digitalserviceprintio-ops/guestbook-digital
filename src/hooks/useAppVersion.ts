import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AppVersion {
  id: string;
  version: string;
  title: string;
  description: string;
  changelog: { type: string; text: string }[];
  is_maintenance: boolean;
  maintenance_message: string;
  published_at: string;
}

const SEEN_VERSION_KEY = "app_seen_version";
const DISMISSED_MAINTENANCE_KEY = "app_dismissed_maintenance";

export function useAppVersion() {
  const [latestVersion, setLatestVersion] = useState<AppVersion | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLatest = useCallback(async () => {
    const { data } = await supabase
      .from("app_versions")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      const version: AppVersion = {
        id: data.id,
        version: data.version,
        title: data.title,
        description: data.description,
        changelog: (data.changelog as any) || [],
        is_maintenance: data.is_maintenance,
        maintenance_message: data.maintenance_message || "",
        published_at: data.published_at,
      };
      setLatestVersion(version);

      const seenVersion = localStorage.getItem(SEEN_VERSION_KEY);
      setHasUpdate(seenVersion !== version.version);

      const dismissedMaintenance = localStorage.getItem(DISMISSED_MAINTENANCE_KEY);
      setIsMaintenance(version.is_maintenance && dismissedMaintenance !== version.id);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLatest();

    const channelName = `app-versions-changes-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "app_versions" }, () => {
        fetchLatest();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLatest]);

  const dismissUpdate = () => {
    if (latestVersion) {
      localStorage.setItem(SEEN_VERSION_KEY, latestVersion.version);
      setHasUpdate(false);
    }
  };

  const dismissMaintenance = () => {
    if (latestVersion) {
      localStorage.setItem(DISMISSED_MAINTENANCE_KEY, latestVersion.id);
      setIsMaintenance(false);
    }
  };

  return {
    latestVersion,
    hasUpdate,
    isMaintenance,
    loading,
    dismissUpdate,
    dismissMaintenance,
  };
}

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { generateDeviceFingerprint, getDeviceLabel } from "@/lib/deviceFingerprint";

const MAX_DEVICES = 2;

interface TokenAuthContextType {
  isAuthenticated: boolean;
  tokenLabel: string;
  hasSavedToken: boolean;
  login: (token: string) => Promise<{ ok: boolean; error?: string }>;
  quickLogin: () => Promise<boolean>;
  logout: () => void;
  fullLogout: () => void;
}

const TokenAuthContext = createContext<TokenAuthContextType>({
  isAuthenticated: false,
  tokenLabel: "",
  hasSavedToken: false,
  login: async () => ({ ok: false }),
  quickLogin: async () => false,
  logout: () => {},
  fullLogout: () => {},
});

export const useTokenAuth = () => useContext(TokenAuthContext);

async function registerDevice(supabase: any, token: string): Promise<{ allowed: boolean; error?: string }> {
  const fingerprint = generateDeviceFingerprint();
  const deviceLabel = getDeviceLabel();
  const userAgent = navigator.userAgent.slice(0, 200);

  // Check if this device is already registered
  const { data: existing } = await supabase
    .from("token_devices")
    .select("id")
    .eq("token", token)
    .eq("device_fingerprint", fingerprint)
    .maybeSingle();

  if (existing) {
    // Device already registered, update last_seen
    await supabase
      .from("token_devices")
      .update({ last_seen_at: new Date().toISOString(), user_agent: userAgent } as any)
      .eq("id", existing.id);
    return { allowed: true };
  }

  // Count existing devices for this token
  const { data: devices, error } = await supabase
    .from("token_devices")
    .select("id, device_label, last_seen_at")
    .eq("token", token)
    .order("last_seen_at", { ascending: false });

  if (error) return { allowed: false, error: "Gagal memeriksa perangkat." };

  if ((devices || []).length >= MAX_DEVICES) {
    const deviceNames = (devices || []).map((d: any) => d.device_label || "Unknown").join(", ");
    return {
      allowed: false,
      error: `Token ini sudah digunakan di ${MAX_DEVICES} perangkat (${deviceNames}). Hubungi admin untuk mereset perangkat.`,
    };
  }

  // Register new device
  const { error: insertError } = await supabase.from("token_devices").insert({
    token,
    device_fingerprint: fingerprint,
    device_label: deviceLabel,
    user_agent: userAgent,
    ip_address: "",
  } as any);

  if (insertError) return { allowed: false, error: "Gagal mendaftarkan perangkat." };
  return { allowed: true };
}

export function TokenAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokenLabel, setTokenLabel] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("access_token");
    const savedLabel = localStorage.getItem("access_token_label");
    if (saved) {
      setTokenLabel(savedLabel || "");
      import("@/integrations/supabase/client").then(({ supabase }) => {
        supabase
          .from("access_tokens")
          .select("token, label, is_active")
          .eq("token", saved)
          .eq("is_active", true)
          .maybeSingle()
          .then(async ({ data }) => {
            if (data) {
              const result = await registerDevice(supabase, saved);
              if (result.allowed) {
                setIsAuthenticated(true);
                setTokenLabel(data.label);
              } else {
                localStorage.removeItem("access_token");
                localStorage.removeItem("access_token_label");
              }
            } else {
              localStorage.removeItem("access_token");
              localStorage.removeItem("access_token_label");
            }
          });
      });
    }
  }, []);

  const login = async (token: string): Promise<{ ok: boolean; error?: string }> => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase
      .from("access_tokens")
      .select("token, label, is_active")
      .eq("token", token.trim())
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) return { ok: false, error: "Token tidak valid atau sudah dinonaktifkan." };

    // Check device limit
    const deviceResult = await registerDevice(supabase, token.trim());
    if (!deviceResult.allowed) {
      return { ok: false, error: deviceResult.error };
    }

    // Update last_used_at
    await supabase
      .from("access_tokens")
      .update({ last_used_at: new Date().toISOString() } as any)
      .eq("token", token.trim());

    localStorage.setItem("access_token", token.trim());
    localStorage.setItem("access_token_label", data.label);
    setIsAuthenticated(true);
    setTokenLabel(data.label);
    return { ok: true };
  };

  const quickLogin = async (): Promise<boolean> => {
    const saved = localStorage.getItem("access_token");
    if (!saved) return false;
    const result = await login(saved);
    return result.ok;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const fullLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("access_token_label");
    setIsAuthenticated(false);
    setTokenLabel("");
  };

  return (
    <TokenAuthContext.Provider value={{ isAuthenticated, tokenLabel, hasSavedToken: !!localStorage.getItem("access_token"), login, quickLogin, logout, fullLogout }}>
      {children}
    </TokenAuthContext.Provider>
  );
}

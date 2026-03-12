import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { generateDeviceFingerprint, getDeviceLabel } from "@/lib/deviceFingerprint";

interface TokenExpiryInfo {
  expiresAt: string | null;
  daysRemaining: number | null;
  isExpiringSoon: boolean; // < 14 days
  isExpired: boolean;
}

type TokenRole = "admin" | "operator";

interface TokenAuthContextType {
  isAuthenticated: boolean;
  tokenLabel: string;
  tokenRole: TokenRole;
  hasSavedToken: boolean;
  expiryInfo: TokenExpiryInfo;
  login: (token: string) => Promise<{ ok: boolean; error?: string }>;
  quickLogin: () => Promise<boolean>;
  logout: () => void;
  fullLogout: () => void;
}

const defaultExpiry: TokenExpiryInfo = { expiresAt: null, daysRemaining: null, isExpiringSoon: false, isExpired: false };

const TokenAuthContext = createContext<TokenAuthContextType>({
  isAuthenticated: false,
  tokenLabel: "",
  hasSavedToken: false,
  expiryInfo: defaultExpiry,
  login: async () => ({ ok: false }),
  quickLogin: async () => false,
  logout: () => {},
  fullLogout: () => {},
});

export const useTokenAuth = () => useContext(TokenAuthContext);

function calcExpiry(expiresAt: string | null): TokenExpiryInfo {
  if (!expiresAt) return defaultExpiry;
  const now = new Date();
  const exp = new Date(expiresAt);
  const diff = exp.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return {
    expiresAt,
    daysRemaining: days,
    isExpiringSoon: days <= 14 && days > 0,
    isExpired: days <= 0,
  };
}

async function registerDevice(supabase: any, token: string): Promise<{ allowed: boolean; error?: string }> {
  const fingerprint = generateDeviceFingerprint();
  const deviceLabel = getDeviceLabel();
  const userAgent = navigator.userAgent.slice(0, 200);

  const { data: existing } = await supabase
    .from("token_devices")
    .select("id")
    .eq("token", token)
    .eq("device_fingerprint", fingerprint)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("token_devices")
      .update({ last_seen_at: new Date().toISOString(), user_agent: userAgent } as any)
      .eq("id", existing.id);
    return { allowed: true };
  }

  // No device limit - unlimited devices allowed
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
  const [expiryInfo, setExpiryInfo] = useState<TokenExpiryInfo>(defaultExpiry);

  useEffect(() => {
    const saved = localStorage.getItem("access_token");
    const savedLabel = localStorage.getItem("access_token_label");
    if (saved) {
      setTokenLabel(savedLabel || "");
      import("@/integrations/supabase/client").then(({ supabase }) => {
        supabase
          .from("access_tokens")
          .select("token, label, is_active, expires_at")
          .eq("token", saved)
          .eq("is_active", true)
          .maybeSingle()
          .then(async ({ data }: any) => {
            if (data) {
              const expiry = calcExpiry(data.expires_at);
              if (expiry.isExpired) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("access_token_label");
                return;
              }
              const result = await registerDevice(supabase, saved);
              if (result.allowed) {
                setIsAuthenticated(true);
                setTokenLabel(data.label);
                setExpiryInfo(expiry);
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
      .select("token, label, is_active, expires_at")
      .eq("token", token.trim())
      .eq("is_active", true)
      .maybeSingle() as any;

    if (error || !data) return { ok: false, error: "Token tidak valid atau sudah dinonaktifkan." };

    let expiry = calcExpiry(data.expires_at);
    if (expiry.isExpired) {
      return { ok: false, error: "Token sudah kadaluarsa. Hubungi admin untuk perpanjangan." };
    }

    const deviceResult = await registerDevice(supabase, token.trim());
    if (!deviceResult.allowed) {
      return { ok: false, error: deviceResult.error };
    }

    // Set expires_at on first use (6 months from now), update last_used_at
    const updatePayload: any = { last_used_at: new Date().toISOString() };
    if (!data.expires_at) {
      const sixMonths = new Date();
      sixMonths.setMonth(sixMonths.getMonth() + 6);
      updatePayload.expires_at = sixMonths.toISOString();
      expiry = calcExpiry(updatePayload.expires_at);
    }

    await supabase
      .from("access_tokens")
      .update(updatePayload)
      .eq("token", token.trim());

    localStorage.setItem("access_token", token.trim());
    localStorage.setItem("access_token_label", data.label);
    setIsAuthenticated(true);
    setTokenLabel(data.label);
    setExpiryInfo(expiry);
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
    setExpiryInfo(defaultExpiry);
  };

  return (
    <TokenAuthContext.Provider value={{ isAuthenticated, tokenLabel, hasSavedToken: !!localStorage.getItem("access_token"), expiryInfo, login, quickLogin, logout, fullLogout }}>
      {children}
    </TokenAuthContext.Provider>
  );
}

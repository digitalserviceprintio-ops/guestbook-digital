import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface TokenAuthContextType {
  isAuthenticated: boolean;
  tokenLabel: string;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
}

const TokenAuthContext = createContext<TokenAuthContextType>({
  isAuthenticated: false,
  tokenLabel: "",
  login: async () => false,
  logout: () => {},
});

export const useTokenAuth = () => useContext(TokenAuthContext);

export function TokenAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokenLabel, setTokenLabel] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("access_token");
    const savedLabel = sessionStorage.getItem("access_token_label");
    if (saved) {
      setIsAuthenticated(true);
      setTokenLabel(savedLabel || "");
    }
  }, []);

  const login = async (token: string): Promise<boolean> => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase
      .from("access_tokens")
      .select("token, label, is_active")
      .eq("token", token.trim())
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) return false;

    // Update last_used_at
    await supabase
      .from("access_tokens")
      .update({ last_used_at: new Date().toISOString() } as any)
      .eq("token", token.trim());

    sessionStorage.setItem("access_token", token.trim());
    sessionStorage.setItem("access_token_label", data.label);
    setIsAuthenticated(true);
    setTokenLabel(data.label);
    return true;
  };

  const logout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("access_token_label");
    setIsAuthenticated(false);
    setTokenLabel("");
  };

  return (
    <TokenAuthContext.Provider value={{ isAuthenticated, tokenLabel, login, logout }}>
      {children}
    </TokenAuthContext.Provider>
  );
}

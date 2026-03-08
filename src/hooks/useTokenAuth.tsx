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
    const saved = localStorage.getItem("access_token");
    const savedLabel = localStorage.getItem("access_token_label");
    if (saved) {
      setTokenLabel(savedLabel || "");
      // Auto-validate token is still active
      import("@/integrations/supabase/client").then(({ supabase }) => {
        supabase
          .from("access_tokens")
          .select("token, label, is_active")
          .eq("token", saved)
          .eq("is_active", true)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              setIsAuthenticated(true);
              setTokenLabel(data.label);
            } else {
              // Token no longer valid, clear it
              localStorage.removeItem("access_token");
              localStorage.removeItem("access_token_label");
            }
          });
      });
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

    localStorage.setItem("access_token", token.trim());
    localStorage.setItem("access_token_label", data.label);
    setIsAuthenticated(true);
    setTokenLabel(data.label);
    return true;
  };

  const quickLogin = async (): Promise<boolean> => {
    const saved = localStorage.getItem("access_token");
    if (!saved) return false;
    return login(saved);
  };

  const logout = () => {
    // Keep token in localStorage for quick re-login
    setIsAuthenticated(false);
  };

  const fullLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("access_token_label");
    setIsAuthenticated(false);
    setTokenLabel("");
  };

  return (
    <TokenAuthContext.Provider value={{ isAuthenticated, tokenLabel, login, logout }}>
      {children}
    </TokenAuthContext.Provider>
  );
}

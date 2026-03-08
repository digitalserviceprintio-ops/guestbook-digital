import { Navigate } from "react-router-dom";
import { useTokenAuth } from "@/hooks/useTokenAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useTokenAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

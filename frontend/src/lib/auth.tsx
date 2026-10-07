import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiGet, apiPost } from "@/lib/api";
import type { AdminUser } from "@/lib/types";

interface AuthContextValue {
  user: AdminUser | null | false;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null | false>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await apiGet<AdminUser>("/auth/me");
        if (!cancelled) setUser(me);
        return;
      } catch {
        // try refresh below
      }
      try {
        await apiPost("/auth/refresh");
        const me = await apiGet<AdminUser>("/auth/me");
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const me = await apiPost<AdminUser>("/auth/login", { email, password });
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout");
    } catch {
      // ignore
    }
    setUser(false);
  }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import { isTokenExpired } from "@car-platform/auth";
import type { AuthProfile } from "@car-platform/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "../lib/api";
import { adminTokenStorage } from "../lib/token-storage";
import { AdminAuthContext } from "./auth-context";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const token = await adminTokenStorage.getToken();
    if (!token || isTokenExpired(token)) {
      adminTokenStorage.setToken(null);
      setUser(null);
      return;
    }
    const { user: profile } = await authApi.getMe();
    if (profile.role !== "ADMIN")
      throw new Error("This portal is for business administrators only.");
    setUser(profile);
  }, []);

  useEffect(() => {
    // All state updates happen after the async token/profile check resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProfile()
      .catch(() => {
        adminTokenStorage.setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [loadProfile]);

  const acceptToken = useCallback(async (token: string) => {
    adminTokenStorage.setToken(token);
    try {
      const { user: profile } = await authApi.getMe();
      if (profile.role !== "ADMIN")
        throw new Error("This portal is for business administrators only.");
      setUser(profile);
    } catch (error) {
      adminTokenStorage.setToken(null);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    adminTokenStorage.setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, acceptToken, logout }),
    [user, isLoading, acceptToken, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

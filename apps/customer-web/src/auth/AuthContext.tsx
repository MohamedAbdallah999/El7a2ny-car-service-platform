import { isTokenExpired } from "@car-platform/auth";
import type { AuthProfile } from "@car-platform/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "../lib/api";
import { localStorageTokenStorage } from "../lib/token-storage";
import { AuthContext } from "./auth-context.js";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const token = await localStorageTokenStorage.getToken();
    if (!token || isTokenExpired(token)) {
      localStorageTokenStorage.setToken(null);
      setUser(null);
      return;
    }

    try {
      const { user: profile } = await authApi.getMe();
      setUser(profile);
    } catch {
      localStorageTokenStorage.setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Every setState call inside refreshProfile happens after its `await`,
    // so this never updates state synchronously during the effect itself —
    // it's the async-check-on-mount pattern, not the "setState then fetch"
    // anti-pattern the rule is guarding against.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshProfile().finally(() => setIsLoading(false));
  }, [refreshProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login({ email, password });
      if ("requiresTwoFactor" in result) {
        // The backend only challenges ADMIN/SUPER_ADMIN accounts — a
        // customer login should never land here.
        throw new Error("This account requires additional verification.");
      }
      localStorageTokenStorage.setToken(result.token);
      await refreshProfile();
    },
    [refreshProfile],
  );

  const logout = useCallback(() => {
    localStorageTokenStorage.setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, logout, refreshProfile }),
    [user, isLoading, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

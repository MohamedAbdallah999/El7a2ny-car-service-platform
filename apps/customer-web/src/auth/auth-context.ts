import { createContext } from "react";
import type { AuthProfile } from "@car-platform/types";

export interface AuthContextValue {
  user: AuthProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

// Kept in its own plain (non-component) module, separate from the
// AuthProvider component and the useAuth hook, so neither of those files
// mixes a component export with a non-component export — the combination
// breaks Fast Refresh (react-refresh/only-export-components).
export const AuthContext = createContext<AuthContextValue | null>(null);

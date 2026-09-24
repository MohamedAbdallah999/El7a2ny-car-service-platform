import { createContext } from "react";
import type { AuthProfile } from "@car-platform/types";

export interface AdminAuthContextValue {
  user: AuthProfile | null;
  isLoading: boolean;
  acceptToken: (token: string) => Promise<void>;
  logout: () => void;
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(
  null,
);

import type { TokenStorage } from "@car-platform/auth";

const STORAGE_KEY = "el7a2ny.admin.token";

export const adminTokenStorage: TokenStorage = {
  getToken: () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token) => {
    try {
      if (token) localStorage.setItem(STORAGE_KEY, token);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // A session can still continue in-memory when browser storage is blocked.
    }
  },
};

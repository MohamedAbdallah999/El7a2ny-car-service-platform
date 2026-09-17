import type { TokenStorage } from "@car-platform/auth";

const STORAGE_KEY = "el7a2ny.customer.token";

// A localStorage-backed TokenStorage for the browser. @car-platform/auth
// only ships the interface plus an in-memory default (it stays
// framework-independent), so each app provides its own persistent adapter.
export const localStorageTokenStorage: TokenStorage = {
  getToken: () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(STORAGE_KEY, token);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage can throw in private browsing / disabled-storage modes;
      // the session simply won't persist across reloads in that case.
    }
  },
};

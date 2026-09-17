export interface TokenStorage {
  getToken(): string | null | Promise<string | null>;
  setToken(token: string | null): void | Promise<void>;
}

// A minimal in-memory default for tests and for use before an app wires in
// its real storage. Persistent adapters (localStorage on web,
// AsyncStorage/Keychain on mobile) belong in each app, not here — this
// package stays framework-independent.
export const createMemoryTokenStorage = (): TokenStorage => {
  let token: string | null = null;

  return {
    getToken: () => token,
    setToken: (value) => {
      token = value;
    },
  };
};

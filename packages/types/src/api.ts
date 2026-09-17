// Matches backend/src/middleware/error.middleware.ts, the single error
// shape every backend/src/errors/app-error.ts failure is serialized to.
export interface ApiErrorResponse {
  error: string;
}

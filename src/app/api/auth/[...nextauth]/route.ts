import { handlers } from '@/auth'

// ---------------------------------------------------------------------------
// NextAuth route handler — delegates all /api/auth/* requests to Auth.js.
// Handles: sign-in, sign-out, callback, CSRF, session endpoints.
// ---------------------------------------------------------------------------

export const { GET, POST } = handlers

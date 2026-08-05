// Auth-token peek for the *marketing* shell.
//
// The public landing shell must not pull in the auth store: that store imports
// utils/api.js and owns the login/refresh/user-info network calls, and a
// logged-out visitor on `/` should make no session request at all. All the
// marketing navbar actually needs is "is there a token in localStorage" — a
// synchronous, network-free read — so it lives here instead.
//
// IMPORTANT: TOKEN_KEY must stay in sync with the constant of the same name in
// src/stores/auth.js, which is the only place that ever writes or clears it.
export const TOKEN_KEY = 'milliymock_token'

export function hasStoredSession() {
  try {
    return Boolean(localStorage.getItem(TOKEN_KEY))
  } catch {
    // Private-mode / storage-disabled browsers: treat as logged out.
    return false
  }
}

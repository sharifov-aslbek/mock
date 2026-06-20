// Premium marking now comes from the backend (single source of truth).
//
// The API returns, per test:
//   • isPremium  — whether the test must be purchased before it can be attempted
//   • price      — its cost in "tanga" (coins)
//   • isPurchased — per-user: true for free tests, admins, and tests the user
//                   has already bought
//
// We simply honour those flags. There is no longer any client-side list of
// "free" test ids, nor any simulated spend — purchasing and attempt-gating are
// enforced server-side.

// Fallback cost (in tanga) for a premium test whose backend price is missing/0.
export const TEST_TOKEN_COST = 2

export function isPremiumTest(test) {
  return Boolean(test?.isPremium)
}

// Free tests, admins, and already-bought premium tests come back purchased.
export function isTestPurchased(test) {
  return Boolean(test?.isPurchased)
}

export function testTokenCost(test) {
  const backendPrice = Number(test?.price)
  return backendPrice > 0 ? backendPrice : TEST_TOKEN_COST
}

export function getOriginalApiBaseUrl() {
  return import.meta.env.VITE_ORIGINAL_URL || import.meta.env.VITE_API_BASE_URL || ''
}

export function getTestApiBaseUrl() {
  return import.meta.env.VITE_TEST_URL || import.meta.env.VITE_API_BASE_URL || ''
}

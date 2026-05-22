const DEFAULT_API_BASE_URL = 'https://api.milliymock.uz/api'

function resolveApiBaseUrl() {
  return (
    import.meta.env.VITE_TEST_URL ||
    import.meta.env.VITE_ORIGINAL_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    DEFAULT_API_BASE_URL
  )
}

export function getOriginalApiBaseUrl() {
  return resolveApiBaseUrl()
}

export function getTestApiBaseUrl() {
  return resolveApiBaseUrl()
}

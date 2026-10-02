const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export async function api(path, { token, body, ...options } = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  } catch {
    throw new Error(`Could not reach the library API at ${API_URL}. Start the backend and check its connection.`)
  }
  const result = await response.json().catch(() => ({}))
  if (!response.ok) { const error = new Error(result.message || 'The request could not be completed.'); error.status = response.status; throw error }
  return result
}
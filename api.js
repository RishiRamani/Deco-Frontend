const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function api(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
    credentials: "include"
  })

  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { message: text } }

  if (!res.ok) {
    let errorMessage = data?.message || 'Request failed'
    if (res.status === 403) {
      if (token) {
        errorMessage = "Sorry, you're not in the allowed emails. Try registering if not logged in, otherwise it asks for login."
      } else {
        errorMessage = "Please log in to access this feature."
      }
    }
    throw Object.assign(new Error(errorMessage), { status: res.status, data })
  }
  return data
}

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

  if (!res.ok) throw Object.assign(new Error(data?.message || 'Request failed'), { status: res.status, data })
  return data
}

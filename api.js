const rawBase = import.meta.env.VITE_API_BASE_URL || ''
const normalizedBase = rawBase.trim().replace(/\/+$/, '')

if (!normalizedBase) {
  throw new Error('VITE_API_BASE_URL environment variable must be set to a single backend URL')
}

if (normalizedBase.includes(',')) {
  throw new Error('VITE_API_BASE_URL must contain exactly one backend URL; comma-separated lists are not allowed')
}

const BASE = normalizedBase

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

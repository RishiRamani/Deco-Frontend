import { useAuth } from '@clerk/clerk-react'
import { api } from '../../api'

export function useApi() {
  const { getToken } = useAuth()

  const call = async (method, path, body) => {
    const token = await getToken()
    return api(path, {
      method,
      ...(body ? { body: JSON.stringify(body) } : {}),
    }, token)
  }

  return {
    get: (path) => call('GET', path),
    post: (path, body) => call('POST', path, body),
    patch: (path, body) => call('PATCH', path, body),
    del: (path) => call('DELETE', path),
  }
}

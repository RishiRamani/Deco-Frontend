import { useAuth } from '@clerk/clerk-react'
import { useCallback, useMemo } from 'react'
import { api } from '../../api'

export function useApi() {
  const { getToken } = useAuth()

  const call = useCallback(async (method, path, body) => {
    let token = null
    try { token = await getToken() } catch {}
    return api(path, {
      method,
      ...(body ? { body: JSON.stringify(body) } : {}),
    }, token)
  }, [getToken])

  return useMemo(() => ({
    get: (path) => call('GET', path),
    post: (path, body) => call('POST', path, body),
    patch: (path, body) => call('PATCH', path, body),
    del: (path) => call('DELETE', path),
  }), [call])
}

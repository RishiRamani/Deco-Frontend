import { useAuth } from '../context/AuthContext'
import { useCallback, useMemo } from 'react'
import { api } from '../../api'

export function useApi() {
  const { user } = useAuth()

  const call = useCallback(async (method, path, body) => {
    return api(path, {
      method,
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  }, [])

  return useMemo(() => ({
    get: (path) => call('GET', path),
    post: (path, body) => call('POST', path, body),
    patch: (path, body) => call('PATCH', path, body),
    del: (path) => call('DELETE', path),
  }), [call])
}

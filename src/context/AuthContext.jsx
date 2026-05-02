// context/AuthContext.jsx
// Replaces @clerk/clerk-react — provides user/auth state from your own backend
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)   // null = not loaded yet
  const [loaded, setLoaded]   = useState(false)  // true once /api/auth/me resolves
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

  const fetchMe = useCallback(async () => {
    try {
      const url = backendUrl + '/api/auth/me'
      const res = await fetch(url, { 
        credentials: 'include',
      })
      if (res.ok) {
        const json = await res.json()
        setUser(json.user || null)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Failed to fetch user:', err)
      setUser(null)
    } finally {
      setLoaded(true)
    }
  }, [backendUrl])

  useEffect(() => { 
    fetchMe() 
  }, [backendUrl, fetchMe])

  const signOut = useCallback(async () => {
    try {
      const url = backendUrl + '/api/auth/logout'
      await fetch(url, { 
        method: 'POST', 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
    }
  }, [backendUrl])

  return (
    <AuthContext.Provider value={{ user, loaded, isSignedIn: !!user, signOut, refetch: fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Drop-in replacement for Clerk's useAuth() */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

/** Drop-in replacement for Clerk's useUser() */
export function useUser() {
  const { user, loaded } = useContext(AuthContext)
  return {
    isLoaded: loaded,
    isSignedIn: !!user,
    user: user
      ? {
          id: user._id,
          fullName: user.name,
          primaryEmailAddress: { emailAddress: user.email },
          imageUrl: user.avatar_url || null,
        }
      : null,
  }
}
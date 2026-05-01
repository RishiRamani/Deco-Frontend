import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { api } from '../api'

import Layout from './components/Layout'
import SignInPage from './pages/SignInPage'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import RegistrationPage from './pages/RegistrationPage'
import RoundPage from './pages/RoundPage'
import WaitingPage from './pages/WaitingPage'
import LeaderboardPage from './pages/LeaderboardPage'
import AdminPage from './pages/AdminPage'

const DEFAULT_PAGE = 'home'
const ROUTES = new Set(['home', 'about', 'registration', 'signin', 'round', 'waiting', 'leaderboard', 'admin'])

function pageFromPathname(pathname) {
  const page = pathname.replace(/^\/+|\/+$/g, '').split('/')[0] || DEFAULT_PAGE
  return ROUTES.has(page) ? page : DEFAULT_PAGE
}

function pathForPage(page) {
  return page === DEFAULT_PAGE ? '/' : `/${page}`
}

function getCurrentPage() {
  const hashPage = window.location.hash.replace('#', '').trim()
  if (hashPage) {
    return ROUTES.has(hashPage) ? hashPage : DEFAULT_PAGE
  }

  return pageFromPathname(window.location.pathname)
}

function AuthenticatedApp() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [page, setPage] = useState(getCurrentPage)
  const [userRole, setUserRole] = useState(null)
  const [authError, setAuthError] = useState(null)
  const [authSynced, setAuthSynced] = useState(false)
  const [userAllowed, setUserAllowed] = useState(false)

  useEffect(() => {
    const hashPage = window.location.hash.replace('#', '').trim()
    if (hashPage) {
      const normalizedPage = ROUTES.has(hashPage) ? hashPage : DEFAULT_PAGE
      window.history.replaceState({}, '', pathForPage(normalizedPage))
      setPage(normalizedPage)
    }

    const sync = () => setPage(pageFromPathname(window.location.pathname))
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  useEffect(() => {
    const fetchIsAllowed = async () => {
      if (!isLoaded) {
        return
      }

      if (!isSignedIn) {
        setUserRole(null)
        setAuthError(null)
        setAuthSynced(false)
        return
      }

      setAuthSynced(false)
      setAuthError(null)

      try {
        const token = await getToken()
        const data = await api('/api/allowed', {}, token)
        setUserAllowed(data.allowed);

        if (page === 'signin') {
          window.history.replaceState({}, '', pathForPage(DEFAULT_PAGE))
          setPage(DEFAULT_PAGE)
        }
      } catch (err) {
        setAuthError(err?.data?.message || err?.message || 'Could not fetch if user is allowed or not.')
        setAuthSynced(false)
      }
    }

    fetchIsAllowed()
  }, [getToken, isLoaded, isSignedIn, page])

  useEffect(() => {
    const fetchMe = async () => {
      if (!isLoaded) {
        return
      }

      if (!isSignedIn) {
        setUserRole(null)
        setAuthError(null)
        setAuthSynced(false)
        return
      }

      setAuthSynced(false)
      setAuthError(null)

      try {
        const token = await getToken()
        const data = await api('/api/auth/me', {}, token)
        setUserRole(data?.user?.role || null)
        setAuthSynced(true)

        if (page === 'signin') {
          window.history.replaceState({}, '', pathForPage(DEFAULT_PAGE))
          setPage(DEFAULT_PAGE)
        }
      } catch (err) {
        setAuthError(err?.data?.message || err?.message || 'Could not register your account with the backend.')
        setUserRole('PARTICIPANT')
        setAuthSynced(false)
      }
    }

    fetchMe()
  }, [getToken, isLoaded, isSignedIn, page])

  const navigate = useCallback((nextPage) => {
    const requiresSignIn = ['round', 'waiting', 'admin']
    if (requiresSignIn.includes(nextPage) && !isSignedIn) {
      window.history.pushState({}, '', pathForPage('signin'))
      setPage('signin')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (nextPage === 'admin' && userRole !== 'ORGANIZER') {
      return
    }

    const target = nextPage || DEFAULT_PAGE
    window.history.pushState({}, '', pathForPage(target))
    setPage(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [userRole, isSignedIn])

  const pages = useMemo(
    () => ({
      home: <HomePage onNav={navigate} userRole={userRole} />,
      about: <AboutPage onNav={navigate} />,
      registration: <RegistrationPage onNav={navigate} />,
      signin: <SignInPage authError={authError} authSynced={authSynced} />,
      round: <RoundPage onNav={navigate} userRole={userRole} />,
      waiting: <WaitingPage onNav={navigate} userRole={userRole} />,
      leaderboard: <LeaderboardPage />,
      admin:
        userRole === 'ORGANIZER' ? (
          <AdminPage />
        ) : (
          <WaitingPage onNav={navigate} userRole={userRole} forcedMessage="Organizer access is required for the admin panel." />
        ),
    }),
    [navigate, userRole, authError, authSynced],
  )

  return (
    <Layout page={page} onNav={navigate} userRole={userRole}>
      {pages[page] || pages.home}
    </Layout>
  )
}

export default function App() {
  return <AuthenticatedApp />
}

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

function getHashPage() {
  const hash = window.location.hash.replace('#', '').trim()
  return hash || DEFAULT_PAGE
}

function AuthenticatedApp() {
  const { getToken, isSignedIn } = useAuth()
  const [page, setPage] = useState(getHashPage)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const sync = () => setPage(getHashPage())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    const fetchMe = async () => {
      if (!isSignedIn) {
        setUserRole(null)
        return
      }
      try {
        const token = await getToken()
        const data = await api('/api/auth/me', {}, token)
        setUserRole(data?.user?.role || null)
      } catch {
        setUserRole('PARTICIPANT')
      }
    }

    fetchMe()
  }, [getToken, isSignedIn])

  const navigate = useCallback((nextPage) => {
    const requiresSignIn = ['round', 'waiting', 'admin']
    if (requiresSignIn.includes(nextPage) && !isSignedIn) {
      window.location.hash = 'signin'
      return
    }

    if (nextPage === 'admin' && userRole !== 'ORGANIZER') {
      return
    }

    const target = nextPage || DEFAULT_PAGE
    window.location.hash = target
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [userRole, isSignedIn])

  const pages = useMemo(
    () => ({
      home: <HomePage onNav={navigate} userRole={userRole} />,
      about: <AboutPage onNav={navigate} />,
      registration: <RegistrationPage onNav={navigate} />,
      signin: <SignInPage />,
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
    [navigate, userRole],
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

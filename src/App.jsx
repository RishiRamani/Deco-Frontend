import { useCallback, useEffect, useMemo, useState } from 'react'
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react'
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
  const { getToken } = useAuth()
  const [page, setPage] = useState(getHashPage)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const sync = () => setPage(getHashPage())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = await getToken()
        const data = await api('/api/auth/me', {}, token)
        setUserRole(data?.user?.role || null)
      } catch {
        setUserRole('PARTICIPANT')
      }
    }

    fetchMe()
  }, [getToken])

  const navigate = useCallback((nextPage) => {
    if (nextPage === 'admin' && userRole !== 'ORGANIZER') {
      return
    }

    const target = nextPage || DEFAULT_PAGE
    window.location.hash = target
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [userRole])

  const pages = useMemo(
    () => ({
      home: <HomePage onNav={navigate} />,
      about: <AboutPage onNav={navigate} />,
      registration: <RegistrationPage onNav={navigate} />,
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
  return (
    <>
      <SignedOut>
        <SignInPage />
      </SignedOut>
      <SignedIn>
        <AuthenticatedApp />
      </SignedIn>
    </>
  )
}

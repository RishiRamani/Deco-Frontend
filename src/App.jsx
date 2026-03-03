import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react'
import { api } from '../api'

import Layout from './components/Layout'
import SignInPage from './pages/SignInPage'
import HomePage from './pages/HomePage'
import RoundPage from './pages/RoundPage'
import QuizPage from './pages/QuizPage'
import LeaderboardPage from './pages/LeaderboardPage'
import AdminPage from './pages/AdminPage'

function AuthenticatedApp() {
  const { getToken } = useAuth()
  const [page, setPage] = useState('home')
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = await getToken()
        const data = await api('/api/auth/me', {}, token)
        setUserRole(data?.user?.role || null)
      } catch {
        setUserRole(null)
      }
    }
    fetchMe()
  }, [])

  const navigate = (p) => {
    // Guard: non-organizers can't access admin
    if (p === 'admin' && userRole !== 'ORGANIZER') return
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Layout page={page} onNav={navigate} userRole={userRole}>
      {page === 'home' && <HomePage onNav={navigate} userRole={userRole} />}
      {page === 'round' && <RoundPage onNav={navigate} />}
      {page === 'quiz' && <QuizPage onNav={navigate} />}
      {page === 'leaderboard' && <LeaderboardPage />}
      {page === 'admin' && userRole === 'ORGANIZER' && <AdminPage />}
      {page === 'admin' && userRole !== 'ORGANIZER' && (
        <div className="text-center py-20 text-[#6b6b7a]">Access denied</div>
      )}
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

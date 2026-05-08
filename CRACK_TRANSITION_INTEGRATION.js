/**
 * INTEGRATION EXAMPLE
 * 
 * This shows how to integrate the crack transition system into your React Router setup.
 * Update your main App.jsx file to match this structure.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PageTransitionWrapper from './components/PageTransitionWrapper'

// Import your pages
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import AdminPage from './pages/AdminPage'
import RoundPage from './pages/RoundPage'

export default function App() {
  return (
    <BrowserRouter>
      {/* Wrap all routes with PageTransitionWrapper for crack effect */}
      <PageTransitionWrapper>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/round/:roundId" element={<RoundPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </PageTransitionWrapper>
    </BrowserRouter>
  )
}

/**
 * BUTTON USAGE EXAMPLE
 * 
 * In any page component, import useCrackNavigate and use it:
 */

// Example: In HomePage.jsx
/*
import { useCrackNavigate } from '../hooks/useCrackNavigate'

export default function HomePage() {
  const { navigateWithCrack } = useCrackNavigate()

  return (
    <div>
      <h1>Welcome to Deco</h1>
      
      <button 
        onClick={() => navigateWithCrack('/game')}
        className="px-6 py-3 bg-green-600 rounded"
      >
        🎮 Start Game
      </button>

      <button 
        onClick={() => navigateWithCrack('/admin')}
        className="px-6 py-3 bg-blue-600 rounded"
      >
        ⚙️ Admin Panel
      </button>
    </div>
  )
}
*/

/**
 * QUICK CHECKLIST
 * 
 * ✅ 1. Ensure Framer Motion is installed:
 *      npm install framer-motion
 * 
 * ✅ 2. Copy all component files:
 *      - src/components/CrackTransitionOverlay.jsx
 *      - src/components/PageTransitionWrapper.jsx
 * 
 * ✅ 3. Copy all hook files:
 *      - src/hooks/useCrackNavigate.js
 *      - src/hooks/usePageTransition.js
 * 
 * ✅ 4. Update your App.jsx to match the structure above
 * 
 * ✅ 5. Replace navigation calls in your pages:
 *      OLD: navigate('/page')
 *      NEW: navigateWithCrack('/page')
 * 
 * ✅ 6. Test by clicking buttons that navigate to different pages
 * 
 * ✅ 7. Customize gridSize or animation timing as needed
 */

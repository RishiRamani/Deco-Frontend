import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add VITE_CLERK_PUBLISHABLE_KEY to your .env file')
}

function notifyRouteChange() {
  window.dispatchEvent(new Event('popstate'))
}

function routerPush(to) {
  window.history.pushState({}, '', to)
  notifyRouteChange()
}

function routerReplace(to) {
  window.history.replaceState({}, '', to)
  notifyRouteChange()
}

createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} routerPush={routerPush} routerReplace={routerReplace}>
    <App />
  </ClerkProvider>
)

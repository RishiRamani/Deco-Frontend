import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'


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
  <AuthProvider routerPush={routerPush} routerReplace={routerReplace}>
    <App />
  </AuthProvider>
)

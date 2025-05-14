import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onSuccess: () => console.log('Service Worker registered successfully.'),
  onUpdate: () => console.log('New version available. Please refresh the page.'),
})

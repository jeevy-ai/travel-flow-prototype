import { ClerkProvider } from '@clerk/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../tokens.css'
import './index.css'
import 'leaflet/dist/leaflet.css'
import App from './App.tsx'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={CLERK_KEY}>
      <App />
    </ClerkProvider>
  </StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import { InsforgeProvider } from '@insforge/react'
import App from '@/App.jsx'
import '@/index.css'
import { insforge } from '@/lib/insforge'

import ErrorBoundary from '@/components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <InsforgeProvider client={insforge}>
      <App />
    </InsforgeProvider>
  </ErrorBoundary>
)

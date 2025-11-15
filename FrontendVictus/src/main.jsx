import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AdminProviderWrapper } from './contexts/Admin.context.jsx'
import { PorteroProviderWrapper } from './contexts/Porteto.context.jsx'
import { CommonZoneProviderWrapper } from './contexts/CommonZone.context.jsx'
import { MsalProvider } from '@azure/msal-react'
import { msalInstance } from './authConfig'
import ErrorBoundary from './components/ErrorBoundary'
import { CatalogStreamsProvider } from './contexts/CatalogStreamsProvider.jsx'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element with id "root" was not found.')
}

const root = createRoot(rootElement)

async function bootstrap() {
  try {
    await msalInstance.initialize()
    console.log('[MSAL READY]', msalInstance)

    root.render(
      <StrictMode>
        <MsalProvider instance={msalInstance}>
          <ErrorBoundary>
            <PorteroProviderWrapper>
              <AdminProviderWrapper>
                <CommonZoneProviderWrapper>
                  <CatalogStreamsProvider>
                    <BrowserRouter>
                      <App />
                    </BrowserRouter>
                  </CatalogStreamsProvider>
                </CommonZoneProviderWrapper>
              </AdminProviderWrapper>
            </PorteroProviderWrapper>
          </ErrorBoundary>
        </MsalProvider>
      </StrictMode>
    )
  } catch (error) {
    console.error('No se pudo inicializar MSAL:', error)
  }
}

bootstrap()

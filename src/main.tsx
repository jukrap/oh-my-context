import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from './app/providers/AppProviders'
import { AppRouter } from './app/router/AppRouter'
import { useRuntimeStore } from './shared/model/runtime-store'
import { useAppStore } from './shared/model/store'
import './app/styles/global.css'

async function bootstrap() {
  try {
    await useAppStore.persist.rehydrate()
  } finally {
    useRuntimeStore.getState().setHydrated(true)

    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <AppProviders>
          <AppRouter />
        </AppProviders>
      </StrictMode>,
    )
  }
}

void bootstrap()

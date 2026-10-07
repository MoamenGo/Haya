import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyCachedAppearance } from '@/app/appearance'
import { PreferencesSync } from '@/app/PreferencesSync'
import { router } from '@/app/router'
import { SyncRunner } from '@/app/SyncRunner'
import '@/i18n'
import './index.css'

applyCachedAppearance()

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Missing #root element in index.html')

createRoot(rootElement).render(
  <StrictMode>
    <PreferencesSync />
    <SyncRunner />
    <RouterProvider router={router} />
  </StrictMode>,
)

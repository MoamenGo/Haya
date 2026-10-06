import { Outlet } from '@tanstack/react-router'
import { OfflineReadyNotice } from '@/app/OfflineReadyNotice'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

export function AppShell() {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      {/* Bottom padding keeps content above the phone nav bar. */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-24 sm:px-6 md:pb-10">
        <Outlet />
      </main>
      <BottomNav />
      <OfflineReadyNotice />
    </div>
  )
}

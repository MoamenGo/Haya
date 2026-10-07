import { Outlet } from '@tanstack/react-router'
import { OfflineReadyNotice } from '@/app/OfflineReadyNotice'
import { Capture } from '@/modules/inbox/components/Capture'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

export function AppShell() {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      {/*
        Side padding grows with the screen (clamp), and the reading column stays
        a comfortable width. Bottom padding keeps content above the phone nav bar.
      */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-[clamp(1rem,4vw,2.5rem)] pt-[clamp(1.25rem,4vw,2.75rem)] pb-28 md:pb-12 xl:max-w-4xl">
        <Outlet />
      </main>
      <BottomNav />
      <Capture />
      <OfflineReadyNotice />
    </div>
  )
}

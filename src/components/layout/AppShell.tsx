import { Outlet } from '@tanstack/react-router'
import { OfflineReadyNotice } from '@/app/OfflineReadyNotice'
import { Toaster } from '@/components/ui/toast'
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed'
import { Capture } from '@/modules/inbox/components/Capture'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  const [collapsed, setCollapsed] = useSidebarCollapsed()
  return (
    <div className="flex min-h-dvh">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        {/*
          Side padding grows with the screen (clamp), and the reading column stays
          a comfortable width. Bottom padding keeps content above the phone nav bar.
        */}
        <main className="mx-auto w-full max-w-3xl flex-1 px-[clamp(1rem,4vw,2.5rem)] pt-[clamp(1.25rem,3vw,2.25rem)] pb-40 md:pb-16 xl:max-w-4xl">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <Capture />
      <OfflineReadyNotice />
      <Toaster />
    </div>
  )
}

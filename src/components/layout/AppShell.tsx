import { Outlet } from '@tanstack/react-router'
import { OfflineReadyNotice } from '@/app/OfflineReadyNotice'
import { Toaster } from '@/components/ui/toast'
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed'
import { cn } from '@/lib/utils'
import { Capture } from '@/modules/inbox/components/Capture'
import { BottomNav } from './BottomNav'
import { usePageWidth } from './page-width'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  const [collapsed, setCollapsed] = useSidebarCollapsed()
  const width = usePageWidth()
  return (
    <div className="flex min-h-dvh">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        {/*
          Side padding grows with the screen (clamp), and the column stays a
          comfortable width (wider on two-column pages, see page-width.ts).
          Bottom padding keeps content above the phone nav bar.
        */}
        <main
          className={cn(
            'mx-auto w-full flex-1 px-[clamp(1rem,4vw,2.5rem)] pt-[clamp(1.25rem,3vw,2.25rem)] pb-40 md:pb-16',
            width,
          )}
        >
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

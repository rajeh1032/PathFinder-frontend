import React from "react"
import { Outlet } from "react-router"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { MaintenanceBanner } from "./MaintenanceBanner"
import { SessionExpiredModal } from "./SessionExpiredModal"

export function AdminLayout() {
  const [sessionExpired, setSessionExpired] = React.useState(false)
  const [maintenance] = React.useState(false)

  React.useEffect(() => {
    const expire = () => setSessionExpired(true)
    window.addEventListener("pathfinder:session-expired", expire)
    return () => window.removeEventListener("pathfinder:session-expired", expire)
  }, [])

  return (
    <div className="flex h-screen w-full bg-[var(--surface-variant)] text-[var(--foreground)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MaintenanceBanner enabled={maintenance} />
        <TopBar />
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
      <SessionExpiredModal open={sessionExpired} onOpenChange={setSessionExpired} />
    </div>
  )
}

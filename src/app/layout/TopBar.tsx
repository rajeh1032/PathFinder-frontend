import React from "react"
import { Search, Moon, Sun, LogOut, User } from "lucide-react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { useAuth } from "@/features/auth/application/useAuth"

export function TopBar() {
  const navigate = useNavigate()
  const { user, logout: clearSession } = useAuth()
  const [dark, setDark] = React.useState(false)

  const toggleTheme = () => {
    setDark(d => {
      const next = !d
      document.documentElement.classList.toggle("dark", next)
      return next
    })
  }

  const logout = () => {
    clearSession()
    toast.success("Signed out")
    navigate("/login")
  }

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-between px-6 shrink-0">
      <div className="w-[420px]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Search users, jobs, documents..."
            className="pl-10 h-9 bg-[var(--surface-variant)] border-transparent focus-visible:ring-1 focus-visible:bg-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme" className="text-[var(--muted-foreground)]">
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        <div className="flex items-center gap-3 pl-3 ml-1 border-l border-[var(--border)]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-tight">{user?.name || "Admin"}</p>
            <p className="text-xs text-[var(--muted-foreground)] leading-tight">{user?.email}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white">
            <User className="w-4 h-4" />
          </div>
          <Button variant="ghost" size="icon" onClick={logout} title="Sign out" className="text-[var(--muted-foreground)]">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

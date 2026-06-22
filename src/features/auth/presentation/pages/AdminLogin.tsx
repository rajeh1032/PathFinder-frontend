import React from "react"
import { useNavigate } from "react-router"
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { useAuth } from "../../application/useAuth"

export function AdminLogin() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [remember, setRemember] = React.useState(false)
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => { if (isAuthenticated) navigate("/", { replace: true }) }, [isAuthenticated, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login({ email, password }, remember)
      navigate("/", { replace: true })
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Sign in failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[var(--background)]">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--primary)] text-white font-bold text-xl mb-6 shadow-lg shadow-[var(--primary)]/30">
              P
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Admin Portal</h1>
            <p className="mt-2 text-[var(--muted-foreground)]">Sign in to manage PathFinder AI platform.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 mt-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
                  <Input 
                    type="email" 
                    placeholder="admin@pathfinder.ai" 
                    className="pl-10" 
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[var(--foreground)]">Password</label>
                  <a href="#" className="text-sm text-[var(--primary)] hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="pl-10 pr-10" 
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-3 top-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-sm"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--foreground)]">
                Remember me for 30 days
              </label>
            </div>

            {error && <p role="alert" className="text-sm text-[var(--destructive)]">{error}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Signing in..." : "Secure Sign In"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[var(--muted-foreground)]">
            <ShieldCheck className="h-4 w-4 text-[var(--success)]" />
            Secure Enterprise Connection
          </div>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex w-1/2 bg-[var(--surface-variant)] items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[var(--primary)]/10 to-[var(--tertiary)]/10" />
        
        <div className="relative z-10 max-w-lg text-center space-y-8">
          <div className="relative w-80 h-80 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary)] to-[var(--tertiary)] rounded-full blur-3xl opacity-20 animate-pulse" />
            <div className="relative w-full h-full bg-white dark:bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--border)] p-6 flex flex-col justify-between transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[var(--foreground)]">System Health</p>
                  <p className="text-xs text-[var(--success)]">All services operational</p>
                </div>
              </div>
              <div className="space-y-3 mt-4">
                <div className="h-2 w-full bg-[var(--muted)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--primary)] w-[85%]" />
                </div>
                <div className="h-2 w-full bg-[var(--muted)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--tertiary)] w-[62%]" />
                </div>
                <div className="h-2 w-full bg-[var(--muted)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--match)] w-[92%]" />
                </div>
              </div>
              <div className="mt-auto pt-6">
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <span>Active Users</span>
                  <span className="font-bold text-[var(--foreground)]">12,450</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">AI-Powered Career Intelligence</h2>
            <p className="mt-4 text-[var(--muted-foreground)] leading-relaxed">
              Manage user roadmaps, monitor API connections, and oversee AI-driven CV analysis from one centralized command center.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

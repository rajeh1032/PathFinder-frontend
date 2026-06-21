import React from "react"
import { useNavigate } from "react-router"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

export function NoPermission() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6">
      <div className="w-20 h-20 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mb-6">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">You don't have permission</h1>
      <p className="text-[var(--muted-foreground)] mt-2 max-w-md">
        Your current role doesn't grant access to this page. Contact a Super Admin if you believe this is a mistake.
      </p>
      <div className="flex gap-2 mt-6">
        <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
        <Button onClick={() => navigate("/")}>Return to dashboard</Button>
      </div>
    </div>
  )
}

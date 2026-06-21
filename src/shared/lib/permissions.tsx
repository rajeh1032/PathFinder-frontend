import React from "react"
import { Button } from "../components/ui/button"

// Single-admin build: RBAC is removed.
// These exports remain so any lingering imports keep compiling, but they all pass through.

export type Permission = string
export type Role = "Admin"

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function usePermissions() {
  return {
    role: "Admin" as const,
    setRole: () => {},
    permissions: ["*"] as Permission[],
    has: (_p: Permission | Permission[]) => true,
  }
}

export function PermissionGate({ children }: { permission?: Permission | Permission[]; fallback?: React.ReactNode; children: React.ReactNode }) {
  return <>{children}</>
}

export function ProtectedRoute({ children }: { permission?: Permission | Permission[]; children: React.ReactNode }) {
  return <>{children}</>
}

export function PermissionButton(
  { children, ...props }: React.ComponentProps<typeof Button> & { permission?: Permission | Permission[]; tooltip?: string }
) {
  return <Button {...props}>{children}</Button>
}

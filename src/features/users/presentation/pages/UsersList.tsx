import React, { useState } from "react"
import { useNavigate } from "react-router"
import { Search, Download, Eye, UserCheck, UserX } from "lucide-react"
import { exportCsv } from "@/shared/lib/csv"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { DataState, ConfirmDialog } from "@/shared/components/custom"
import { RowActions } from "@/shared/components/crud"
import { useUsers } from "../../application/useUsers"
import type { UserListItem } from "../../domain/users.types"

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
] as const

export function UsersList() {
  const navigate = useNavigate()
  const { items, pagination, params, isLoading, error, updateParams, refetch, toggleActive } = useUsers()
  const [searchInput, setSearchInput] = useState(params.search ?? "")
  const [pendingToggle, setPendingToggle] = useState<UserListItem | null>(null)

  // Debounce the search box into the server query.
  React.useEffect(() => {
    const handle = setTimeout(() => {
      if ((params.search ?? "") !== searchInput) {
        updateParams({ search: searchInput, page: 1 })
      }
    }, 400)
    return () => clearTimeout(handle)
  }, [searchInput, params.search, updateParams])

  const confirmToggle = async () => {
    if (!pendingToggle) return
    await toggleActive(pendingToggle.id, !pendingToggle.isActive)
    setPendingToggle(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Users</h1>
          <p className="text-[var(--muted-foreground)]">Manage students, graduates and career shifters.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => { exportCsv("users.csv", items); toast.success("Exported current page CSV") }}
          disabled={items.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />Export CSV
        </Button>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder="Search users by name or email..." className="pl-9" value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          </div>
          <div className="flex gap-1">
            {STATUS_OPTIONS.map(option => (
              <Button
                key={option.value}
                variant={(params.status ?? "") === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateParams({ status: option.value, page: 1 })}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <DataState
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          isEmpty={items.length === 0}
          loadingLabel="Loading users..."
          empty={{ title: params.search ? "No users match your search" : "No users found" }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Target Career</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-semibold text-xs">
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <p className="font-medium">{u.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell><Badge variant={u.isActive ? "success" : "secondary"}>{u.status}</Badge></TableCell>
                  <TableCell className="text-sm capitalize">{u.role}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{u.targetCareer}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">{u.experience}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">{u.location}</TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">{u.lastActiveAt}</TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">{u.createdAt}</TableCell>
                  <TableCell>
                    <RowActions
                      onView={() => navigate(`/users/${u.id}`)}
                      extra={[
                        u.isActive
                          ? { label: "Deactivate", onClick: () => setPendingToggle(u), icon: <UserX className="h-4 w-4" /> }
                          : { label: "Activate", onClick: () => setPendingToggle(u), icon: <UserCheck className="h-4 w-4" /> },
                        { label: "Open full profile", onClick: () => navigate(`/users/${u.id}`), icon: <Eye className="h-4 w-4" /> },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataState>

        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between text-sm text-[var(--muted-foreground)]">
          <div>
            {pagination
              ? `Page ${pagination.page} of ${pagination.totalPages} · ${pagination.totalItems} users`
              : `${items.length} users`}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination?.hasPreviousPage}
              onClick={() => updateParams({ page: (params.page ?? 1) - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination?.hasNextPage}
              onClick={() => updateParams({ page: (params.page ?? 1) + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingToggle)}
        onOpenChange={(v) => !v && setPendingToggle(null)}
        title={pendingToggle?.isActive ? `Deactivate ${pendingToggle?.name}?` : `Activate ${pendingToggle?.name}?`}
        description={
          pendingToggle?.isActive
            ? "The user will lose access until reactivated."
            : "The user will regain access to the platform."
        }
        confirmLabel={pendingToggle?.isActive ? "Deactivate" : "Activate"}
        onConfirm={confirmToggle}
      />
    </div>
  )
}

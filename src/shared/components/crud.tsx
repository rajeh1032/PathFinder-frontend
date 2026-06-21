import React from "react"
import { AlertTriangle, Inbox, Loader2, MoreVertical, Eye, Edit, Trash2 } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "./ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "./ui/alert-dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Button } from "./ui/button"

/* ---------- Form modal (Create / Edit) ---------- */
export function FormModal({
  open, onOpenChange, title, description, children, onSubmit, submitLabel = "Save", loading,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  onSubmit: () => void
  submitLabel?: string
  loading?: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit() }}
          className="space-y-4 py-2"
        >
          {children}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- Details modal (View) ---------- */
export function DetailsModal({
  open, onOpenChange, title, children,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  children: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-3">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- Confirm Delete ---------- */
export function ConfirmDeleteDialog({
  open, onOpenChange, title = "Delete this item?", description = "This action cannot be undone.", onConfirm, loading,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title?: string
  description?: string
  onConfirm: () => void
  loading?: boolean
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); onConfirm() }}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/* ---------- Row actions dropdown ---------- */
export function RowActions({
  onView, onEdit, onDelete, extra,
}: {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  extra?: { label: string; onClick: () => void; icon?: React.ReactNode; destructive?: boolean }[]
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {onView && (
          <DropdownMenuItem onClick={onView}><Eye className="h-4 w-4 mr-2" />View details</DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
        )}
        {extra?.map((e) => (
          <DropdownMenuItem key={e.label} onClick={e.onClick} className={e.destructive ? "text-red-600 focus:text-red-600" : ""}>
            {e.icon}<span className={e.icon ? "ml-2" : ""}>{e.label}</span>
          </DropdownMenuItem>
        ))}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ---------- Empty state ---------- */
export function EmptyState({
  title = "No results", description = "Try changing your filters or add a new item.", action,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-[var(--muted)] text-[var(--muted-foreground)] flex items-center justify-center mb-4">
        <Inbox className="h-7 w-7" />
      </div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/* ---------- Inline text/textarea field with label ---------- */
export function Field({
  label, error, hint, children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>
      ) : null}
    </div>
  )
}

/* ---------- Generic CRUD state hook ---------- */
export function useCrud<T>(initial: T[]) {
  const [items, setItems] = React.useState<T[]>(initial)
  const [mode, setMode] = React.useState<"none" | "create" | "edit" | "view" | "delete">("none")
  const [selected, setSelected] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)

  const open = (m: typeof mode, item?: T) => { setSelected(item ?? null); setMode(m) }
  const close = () => { setMode("none"); setSelected(null) }

  return { items, setItems, mode, selected, loading, setLoading, open, close }
}

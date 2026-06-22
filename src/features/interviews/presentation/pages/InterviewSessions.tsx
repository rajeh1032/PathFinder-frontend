import { useState } from "react"
import { useNavigate } from "react-router"
import { Search, Mic } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { StatCard } from "@/shared/components/custom"
import { DataState } from "@/shared/components/custom/DataState"
import { RowActions, ConfirmDeleteDialog } from "@/shared/components/crud"
import { ApiError } from "@/core/api/api-client"
import { useInterviews } from "../../application/useInterviews"
import type {
  InterviewListItem,
  InterviewStatus,
  InterviewType,
} from "../../domain/interviews.types"

const scoreColor = (s: number) =>
  s >= 85 ? "text-emerald-600" : s >= 70 ? "text-blue-600" : s >= 50 ? "text-amber-600" : "text-red-600"

const STATUS_LABELS: Record<InterviewStatus, string> = {
  started: "Started",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
}

const TYPE_LABELS: Record<InterviewType, string> = {
  technical: "Technical",
  behavioral: "Behavioral",
  mock_hr: "Mock HR",
}

const statusVariant = (status: InterviewStatus) =>
  status === "completed"
    ? "success"
    : status === "cancelled"
      ? "destructive"
      : "warning"

export function InterviewSessions() {
  const navigate = useNavigate()
  const {
    items,
    summary,
    pagination,
    isLoading,
    error,
    search,
    setSearch,
    status,
    setStatus,
    interviewType,
    setInterviewType,
    setPage,
    refetch,
    removeInterview,
  } = useInterviews()

  const [toDelete, setToDelete] = useState<InterviewListItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await removeInterview(toDelete.id)
      toast.success("Interview session deleted")
      setToDelete(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete interview session")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Interview Sessions</h1>
        <p className="text-[var(--muted-foreground)]">AI mock interview history and performance scores.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Interviews" value={summary.totalInterviews} />
        <StatCard label="Average Score" value={summary.averageScore === null ? "—" : `${summary.averageScore}%`} />
        <StatCard label="Best Score" value={summary.bestScore === null ? "—" : `${summary.bestScore}%`} />
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px] max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search by user, career path, or ID..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : (v as InterviewStatus))}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="started">Started</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={interviewType || "all"}
            onValueChange={(v) => setInterviewType(v === "all" ? "" : (v as InterviewType))}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="behavioral">Behavioral</SelectItem>
              <SelectItem value="mock_hr">Mock HR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataState
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          isEmpty={items.length === 0}
          loadingLabel="Loading interview sessions..."
          empty={{ title: "No interviews found", description: "No interview sessions match your filters yet." }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Career Path</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s) => (
                <TableRow
                  key={s.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/interview-sessions/${s.id}`)}
                >
                  <TableCell className="font-mono text-xs">{s.id.slice(0, 8)}</TableCell>
                  <TableCell className="font-medium">{s.userName}</TableCell>
                  <TableCell className="text-sm">{s.careerPath}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Mic className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                      {TYPE_LABELS[s.type]}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{s.totalQuestions}</TableCell>
                  <TableCell>
                    {s.status === "completed" && s.score !== null ? (
                      <span className={`font-bold ${scoreColor(s.score)}`}>{s.score}%</span>
                    ) : (
                      <span className="text-[var(--muted-foreground)] text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(s.status)}>{STATUS_LABELS[s.status]}</Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <RowActions
                      onView={() => navigate(`/interview-sessions/${s.id}`)}
                      onDelete={() => setToDelete(s)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataState>
      </div>

      {pagination.totalItems > 0 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-[var(--muted-foreground)]">
            Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} sessions
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPreviousPage}
              onClick={() => pagination.previousPage && setPage(pagination.previousPage)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => pagination.nextPage && setPage(pagination.nextPage)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={Boolean(toDelete)}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={toDelete ? `Delete session ${toDelete.id.slice(0, 8)}?` : "Delete this session?"}
        description="This permanently removes the interview session and its questions. This action cannot be undone."
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  )
}

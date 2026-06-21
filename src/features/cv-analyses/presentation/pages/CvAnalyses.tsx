import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { Search, FileText, Download } from "lucide-react"
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
import { DataState } from "@/shared/components/custom"
import { exportCsv } from "@/shared/lib/csv"
import { useCvAnalyses } from "../../application/useCvAnalyses"
import type { CvAnalysisStatus } from "../../domain/cv-analyses.types"

const scoreColor = (s: number) =>
  s >= 85 ? "text-emerald-600" : s >= 70 ? "text-blue-600" : s >= 50 ? "text-amber-600" : "text-red-600"

const statusVariant = (status: CvAnalysisStatus) =>
  status === "completed" ? "success" : status === "reviewed" ? "secondary" : "destructive"

const statusLabel = (status: CvAnalysisStatus) =>
  status.charAt(0).toUpperCase() + status.slice(1)

export function CvAnalyses() {
  const navigate = useNavigate()
  const { items, isLoading, error, refetch } = useCvAnalyses()
  const [q, setQ] = useState("")

  const filtered = useMemo(
    () =>
      items.filter(
        (a) =>
          !q ||
          a.userName.toLowerCase().includes(q.toLowerCase()) ||
          a.userEmail.toLowerCase().includes(q.toLowerCase()) ||
          a.id.toLowerCase().includes(q.toLowerCase()),
      ),
    [items, q],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CV Analyses</h1>
          <p className="text-[var(--muted-foreground)]">AI-driven CV scoring and feedback history.</p>
        </div>
        <Button
          variant="outline"
          disabled={items.length === 0}
          onClick={() => {
            exportCsv(
              "cv-analyses.csv",
              items.map((a) => ({
                id: a.id,
                user: a.userName,
                email: a.userEmail,
                file: a.fileName,
                score: a.score,
                status: a.status,
                date: a.createdAt,
              })),
            )
            toast.success("Exported CV analyses CSV")
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search by user, email, or ID..."
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <DataState
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          isEmpty={filtered.length === 0}
          loadingLabel="Loading CV analyses..."
          empty={{ title: "No analyses found", description: "No CV analyses match your search yet." }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow
                  key={a.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/cv-analyses/${a.id}`)}
                >
                  <TableCell className="font-mono text-xs">{a.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{a.userName}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{a.userEmail}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <FileText className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                      {a.fileName}
                    </div>
                  </TableCell>
                  <TableCell>
                    {a.status === "failed" ? (
                      <span className="text-[var(--muted-foreground)] text-sm">—</span>
                    ) : (
                      <span className={`font-bold ${scoreColor(a.score)}`}>{a.score}%</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(a.status)}>{statusLabel(a.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">{a.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataState>
      </div>
    </div>
  )
}

import { useState } from "react"
import { Search, ExternalLink, Video, Star, Users, Download, Plus } from "lucide-react"
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
import { DetailsModal, RowActions, ConfirmDeleteDialog } from "@/shared/components/crud"
import { exportCsv } from "@/shared/lib/csv"
import { useCourses } from "../../application/useCourses"
import { ImportCourseDialog } from "../components/ImportCourseDialog"
import { EditCourseDialog } from "../components/EditCourseDialog"
import { CourseImage } from "../components/CourseImage"
import type { CourseDto, CoursesSort } from "../../domain/courses.types"

const SORT_OPTIONS: { value: CoursesSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top rated" },
  { value: "popular", label: "Most popular" },
]

const formatDate = (value: string | null) => (value ? value.slice(0, 10) : "—")

export function Courses() {
  const { items, pagination, isLoading, error, search, setSearch, sort, setSort, setPage, refetch, updateCourse, removeCourse } =
    useCourses()
  const [selected, setSelected] = useState<CourseDto | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [editing, setEditing] = useState<CourseDto | null>(null)
  const [pendingDelete, setPendingDelete] = useState<CourseDto | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleSave = async (id: string, payload: Parameters<typeof updateCourse>[1]) => {
    try {
      await updateCourse(id, payload)
      toast.success("Course updated")
    } catch {
      toast.error("Failed to update course")
      throw new Error("update failed")
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await removeCourse(pendingDelete.id)
      toast.success("Course deleted")
      setPendingDelete(null)
    } catch {
      toast.error("Failed to delete course")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="text-[var(--muted-foreground)]">
            Approved learning resources available to students.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={items.length === 0}
            onClick={() => {
              exportCsv(
                "courses.csv",
                items.map((co) => ({
                  id: co.id,
                  title: co.title,
                  provider: co.provider,
                  category: co.category ?? "",
                  level: co.level ?? "",
                  duration: co.duration ?? "",
                  language: co.language ?? "",
                  is_free: co.isFree,
                  rating: co.rating ?? "",
                  enrollments: co.enrollmentCount,
                  url: co.url ?? "",
                })),
              )
              toast.success("Exported courses CSV")
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setImportOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Import Course
          </Button>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search courses..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value as CoursesSort)}
            aria-label="Sort courses"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <DataState
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          isEmpty={items.length === 0}
          loadingLabel="Loading courses..."
          empty={{
            title: "No courses found",
            description: search
              ? "Try a different search term."
              : "No approved courses are available yet.",
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Links</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((co) => (
                <TableRow
                  key={co.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(co)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <CourseImage
                        src={co.thumbnailUrl}
                        alt={co.title}
                        className="h-9 w-14 shrink-0 rounded-md"
                      />
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{co.title}</span>
                        {co.isFree && (
                          <Badge variant="success" className="text-[10px]">
                            Free
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{co.provider}</TableCell>
                  <TableCell>
                    {co.category ? (
                      <Badge variant="secondary">{co.category}</Badge>
                    ) : (
                      <span className="text-[var(--muted-foreground)] text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {co.level ? (
                      <Badge variant="outline">{co.level}</Badge>
                    ) : (
                      <span className="text-[var(--muted-foreground)] text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">
                    {co.duration || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {co.rating != null ? (
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500" />
                        {co.rating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-[var(--muted-foreground)]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {co.enrollmentCount}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-3">
                      {co.url ? (
                        <a
                          href={co.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline text-xs"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Link
                        </a>
                      ) : null}
                      {co.videoUrl ? (
                        <a
                          href={co.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline text-xs"
                        >
                          <Video className="h-3 w-3" />
                          Watch
                        </a>
                      ) : null}
                      {!co.url && !co.videoUrl ? (
                        <span className="text-[var(--muted-foreground)] text-xs">—</span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <RowActions
                      onView={() => setSelected(co)}
                      onEdit={() => setEditing(co)}
                      onDelete={() => setPendingDelete(co)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataState>

        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between text-sm text-[var(--muted-foreground)]">
          <div>
            {`Page ${pagination.page} of ${pagination.totalPages} · ${pagination.totalItems} courses`}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPage(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <DetailsModal
        open={Boolean(selected)}
        onOpenChange={(v) => !v && setSelected(null)}
        title="Course Details"
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <CourseImage
              src={selected.thumbnailUrl}
              alt={selected.title}
              className="h-40 w-full rounded-lg"
            />
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-lg">{selected.title}</p>
              {selected.isFree && <Badge variant="success">Free</Badge>}
            </div>

            {selected.description && (
              <p className="text-[var(--muted-foreground)]">{selected.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
              <div>
                Provider: <span className="font-medium">{selected.provider}</span>
              </div>
              <div>
                Category:{" "}
                {selected.category ? (
                  <Badge variant="secondary">{selected.category}</Badge>
                ) : (
                  "—"
                )}
              </div>
              <div>
                Level:{" "}
                {selected.level ? <Badge variant="outline">{selected.level}</Badge> : "—"}
              </div>
              <div>
                Duration: <span className="font-medium">{selected.duration || "—"}</span>
              </div>
              <div>
                Language: <span className="font-medium">{selected.language || "—"}</span>
              </div>
              <div>
                Rating:{" "}
                <span className="font-medium">
                  {selected.rating != null ? `${selected.rating.toFixed(1)} (${selected.reviewsCount})` : "—"}
                </span>
              </div>
              <div>
                Enrolled: <span className="font-medium">{selected.enrollmentCount}</span>
              </div>
              <div>
                Added: <span className="font-medium">{formatDate(selected.createdAt)}</span>
              </div>
            </div>

            {selected.skills.length > 0 && (
              <div className="pt-2 border-t border-[var(--border)]">
                <p className="font-medium mb-2">Skills taught</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.skills.map((skill) => (
                    <Badge key={`${skill.id ?? skill.name}`} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selected.learningOutcomes.length > 0 && (
              <div className="pt-2 border-t border-[var(--border)]">
                <p className="font-medium mb-2">Learning outcomes</p>
                <ul className="list-disc pl-5 space-y-1 text-[var(--muted-foreground)]">
                  {selected.learningOutcomes.map((outcome, index) => (
                    <li key={index}>{outcome}</li>
                  ))}
                </ul>
              </div>
            )}

            {selected.url && (
              <div className="pt-2 border-t border-[var(--border)]">
                <p className="font-medium mb-1">Course URL</p>
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline break-all"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  {selected.url}
                </a>
              </div>
            )}

            {selected.videoUrl && (
              <div className="pt-2 border-t border-[var(--border)]">
                <p className="font-medium mb-1">Video URL</p>
                <a
                  href={selected.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline break-all"
                >
                  <Video className="h-3.5 w-3.5 shrink-0" />
                  {selected.videoUrl}
                </a>
              </div>
            )}
          </div>
        )}
      </DetailsModal>

      <ImportCourseDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => {
          setPage(1)
          refetch()
        }}
      />

      <EditCourseDialog
        course={editing}
        open={Boolean(editing)}
        onOpenChange={(v) => !v && setEditing(null)}
        onSave={handleSave}
      />

      <ConfirmDeleteDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(v) => !v && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title}"?`}
        description="This permanently removes the course and its saved/enrollment links. This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}

import { useState } from "react"
import { Loader2, Sparkles, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Label } from "@/shared/components/ui/label"
import { Badge } from "@/shared/components/ui/badge"
import { Switch } from "@/shared/components/ui/switch"
import { ErrorState } from "@/shared/components/custom"
import { useCourseImport } from "../../application/useCourseImport"
import { CourseImage } from "./CourseImage"
import type { CourseImportMetadata } from "../../domain/courses.types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after a course is successfully imported, to refresh the list. */
  onImported: () => void
}

const outcomesToText = (outcomes: string[]) => outcomes.join("\n")
const textToOutcomes = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

/**
 * Admin MaharaTech import wizard: paste a course URL, let the backend fetch
 * metadata + run AI analysis, review/adjust, then confirm to create the course.
 */
export function ImportCourseDialog({ open, onOpenChange, onImported }: Props) {
  const importer = useCourseImport(onImported)
  const [url, setUrl] = useState("")

  const close = (next: boolean) => {
    if (importer.isSubmitting) return
    onOpenChange(next)
    if (!next) {
      setUrl("")
      importer.reset()
    }
  }

  const metadata = importer.metadata

  const setMeta = (patch: Partial<CourseImportMetadata>) => importer.updateMetadata(patch)

  const handleConfirm = async () => {
    const result = await importer.confirmImport()
    if (result) {
      toast.success(
        result.kind === "already_imported"
          ? "This course was already imported"
          : "Course imported successfully",
      )
      close(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import MaharaTech Course</DialogTitle>
          <DialogDescription>
            Paste a MaharaTech course URL. The system fetches its details, runs an AI analysis, and
            lets you review before saving.
          </DialogDescription>
        </DialogHeader>

        {importer.error && (
          <div className="py-2">
            <ErrorState message={importer.error} />
          </div>
        )}

        {/* Step 1 — URL */}
        {importer.step === "url" && (
          <form
            className="space-y-4 py-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (url.trim()) importer.runPreview(url.trim())
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="course-url">Course URL *</Label>
              <Input
                id="course-url"
                placeholder="https://maharatech.gov.eg/course/view.php?id=123"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                Only MaharaTech URLs (with an <code>id</code> parameter) are supported.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!url.trim() || importer.isSubmitting}>
                {importer.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Analyze
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Step 2 — Manual metadata (backend could not fetch enough) */}
        {importer.step === "manual_metadata" && metadata && (
          <form
            className="space-y-4 py-2"
            onSubmit={(e) => {
              e.preventDefault()
              importer.runPreview(metadata.url, {
                title: metadata.title ?? undefined,
                description: metadata.description ?? undefined,
                category: metadata.category,
                level: metadata.level,
                duration: metadata.duration,
                language: metadata.language ?? undefined,
                thumbnail_url: metadata.thumbnail_url,
                learning_outcomes: metadata.learning_outcomes,
              })
            }}
          >
            <div className="flex items-start gap-2 rounded-md border border-amber-300/50 bg-amber-50 dark:bg-amber-950/20 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
              <p>{importer.manualPrompt?.message}</p>
            </div>

            <MetadataFields metadata={metadata} setMeta={setMeta} requireCore />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={importer.isSubmitting || !metadata.title?.trim()}
              >
                {importer.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Run analysis
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Step 3 — Review AI analysis and confirm */}
        {importer.step === "review" && metadata && importer.preview && (
          <div className="space-y-5 py-2">
            <a
              href={metadata.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline text-xs break-all"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              {metadata.url}
            </a>

            <MetadataFields metadata={metadata} setMeta={setMeta} requireCore />

            <div className="rounded-lg border border-[var(--border)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                  AI analysis
                </p>
                {importer.preview.analysis.confidence != null && (
                  <Badge variant="secondary">
                    Confidence {Math.round(importer.preview.analysis.confidence * 100)}%
                  </Badge>
                )}
              </div>

              {importer.preview.analysis.summary && (
                <p className="text-sm text-[var(--muted-foreground)]">
                  {importer.preview.analysis.summary}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Category: <span className="font-medium">{importer.preview.analysis.category ?? "—"}</span></div>
                <div>Level: <span className="font-medium">{importer.preview.analysis.level ?? "—"}</span></div>
                <div>Duration: <span className="font-medium">{importer.preview.analysis.duration ?? "—"}</span></div>
                <div>Language: <span className="font-medium">{importer.preview.analysis.language ?? "—"}</span></div>
              </div>

              {importer.preview.matched_skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1.5">
                    Matched skills ({importer.preview.matched_skills.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {importer.preview.matched_skills.map((skill) => (
                      <Badge key={skill.skill_id ?? skill.id ?? skill.name} variant="success">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {importer.preview.unmatched_skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1.5">
                    Unmatched skills ({importer.preview.unmatched_skills.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {importer.preview.unmatched_skills.map((skill) => (
                      <Badge key={skill.name} variant="outline">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Unmatched skills are saved as suggestions but not linked to the skill catalog.
                  </p>
                </div>
              )}

              {importer.preview.analysis.prerequisites.length > 0 && (
                <div className="text-sm">
                  <span className="font-medium">Prerequisites: </span>
                  {importer.preview.analysis.prerequisites.join(", ")}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => close(false)} disabled={importer.isSubmitting}>
                Cancel
              </Button>
              <Button type="button" onClick={handleConfirm} disabled={importer.isSubmitting || !metadata.title?.trim()}>
                {importer.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Confirm import
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 4 — Done (already imported via preview) */}
        {importer.step === "done" && (
          <div className="space-y-4 py-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <p className="text-sm">{importer.resultMessage}</p>
            <DialogFooter className="sm:justify-center">
              <Button onClick={() => close(false)}>Close</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* Shared editable metadata fields used by the manual and review steps. */
function MetadataFields({
  metadata,
  setMeta,
  requireCore,
}: {
  metadata: CourseImportMetadata
  setMeta: (patch: Partial<CourseImportMetadata>) => void
  requireCore?: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="meta-title">Title{requireCore ? " *" : ""}</Label>
        <Input
          id="meta-title"
          value={metadata.title ?? ""}
          onChange={(e) => setMeta({ title: e.target.value })}
          placeholder="Course title"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="meta-description">Description</Label>
        <Textarea
          id="meta-description"
          rows={3}
          value={metadata.description ?? ""}
          onChange={(e) => setMeta({ description: e.target.value })}
          placeholder="At least 10 characters"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="meta-category">Category</Label>
          <Input
            id="meta-category"
            value={metadata.category ?? ""}
            onChange={(e) => setMeta({ category: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="meta-level">Level</Label>
          <Input
            id="meta-level"
            value={metadata.level ?? ""}
            onChange={(e) => setMeta({ level: e.target.value })}
            placeholder="Beginner / Intermediate / Advanced"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="meta-duration">Duration</Label>
          <Input
            id="meta-duration"
            value={metadata.duration ?? ""}
            onChange={(e) => setMeta({ duration: e.target.value })}
            placeholder="e.g. 24h"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="meta-language">Language</Label>
          <Input
            id="meta-language"
            value={metadata.language ?? ""}
            onChange={(e) => setMeta({ language: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="meta-thumbnail">Thumbnail URL</Label>
        <Input
          id="meta-thumbnail"
          value={metadata.thumbnail_url ?? ""}
          onChange={(e) => setMeta({ thumbnail_url: e.target.value })}
          placeholder="https://..."
        />
        {metadata.thumbnail_url?.trim() && (
          <CourseImage
            src={metadata.thumbnail_url}
            alt="Course thumbnail preview"
            className="mt-1 h-32 w-full rounded-md border border-[var(--border)]"
          />
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="meta-outcomes">Learning outcomes (one per line)</Label>
        <Textarea
          id="meta-outcomes"
          rows={3}
          value={outcomesToText(metadata.learning_outcomes ?? [])}
          onChange={(e) => setMeta({ learning_outcomes: textToOutcomes(e.target.value) })}
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Switch
          id="meta-free"
          checked={Boolean(metadata.is_free)}
          onCheckedChange={(v) => setMeta({ is_free: v })}
        />
        <Label htmlFor="meta-free">Free course</Label>
      </div>
    </div>
  )
}

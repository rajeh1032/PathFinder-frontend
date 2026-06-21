import { useCallback, useState } from "react"
import { ApiError } from "@/core/api/api-client"
import { buildConfirmMetadata, coursesApi } from "../data/courses.api"
import type {
  CourseImportMetadata,
  CourseImportPreview,
  CourseManualMetadata,
} from "../domain/courses.types"

type ImportStep = "url" | "manual_metadata" | "review" | "done"

type State = {
  step: ImportStep
  isSubmitting: boolean
  error: string | null
  preview: Extract<CourseImportPreview, { kind: "pending_review" }> | null
  /** Set when the backend asks for manual metadata before it can analyze. */
  manualPrompt:
    | (Extract<CourseImportPreview, { kind: "needs_manual_metadata" }> & { kind: "needs_manual_metadata" })
    | null
  /** Editable metadata bound to the review/manual forms. */
  metadata: CourseImportMetadata | null
  resultMessage: string | null
}

const INITIAL: State = {
  step: "url",
  isSubmitting: false,
  error: null,
  preview: null,
  manualPrompt: null,
  metadata: null,
  resultMessage: null,
}

const toMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback

/**
 * Drives the admin MaharaTech import wizard: URL -> (optional manual metadata)
 * -> AI review -> confirm. Keeps the multi-step, nested preview payload in
 * local component state (not Redux) and surfaces a small API to the dialog.
 */
export function useCourseImport(onImported?: () => void) {
  const [state, setState] = useState<State>(INITIAL)

  const reset = useCallback(() => setState(INITIAL), [])

  /** Run preview for a URL, optionally with admin-supplied manual metadata. */
  const runPreview = useCallback(
    async (url: string, manual?: CourseManualMetadata) => {
      setState((prev) => ({ ...prev, isSubmitting: true, error: null }))
      try {
        const preview = await coursesApi.previewImport(url, manual)
        if (preview.kind === "already_imported") {
          setState({ ...INITIAL, step: "done", resultMessage: preview.message })
          return preview
        }
        if (preview.kind === "needs_manual_metadata") {
          setState((prev) => ({
            ...prev,
            isSubmitting: false,
            step: "manual_metadata",
            manualPrompt: preview,
            metadata: preview.metadata,
            preview: null,
            error: null,
          }))
          return preview
        }
        setState((prev) => ({
          ...prev,
          isSubmitting: false,
          step: "review",
          preview,
          manualPrompt: null,
          metadata: preview.metadata,
          error: null,
        }))
        return preview
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isSubmitting: false,
          error: toMessage(error, "Failed to preview the course import"),
        }))
        return null
      }
    },
    [],
  )

  /** Patch the editable metadata bound to the forms. */
  const updateMetadata = useCallback((patch: Partial<CourseImportMetadata>) => {
    setState((prev) =>
      prev.metadata ? { ...prev, metadata: { ...prev.metadata, ...patch } } : prev,
    )
  }, [])

  /** Confirm the reviewed import and create the course. */
  const confirmImport = useCallback(async () => {
    const { preview, metadata } = state
    if (!preview || !metadata) return null
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }))
    try {
      const result = await coursesApi.confirmImport({
        provider: preview.provider,
        external_id: preview.external_id,
        url: metadata.url,
        metadata: buildConfirmMetadata(metadata),
        analysis: preview.analysis,
        matched_skills: preview.matched_skills,
        unmatched_skills: preview.unmatched_skills,
      })
      setState({
        ...INITIAL,
        step: "done",
        resultMessage:
          result.kind === "already_imported" ? result.message : "Course imported successfully",
      })
      onImported?.()
      return result
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: toMessage(error, "Failed to confirm the course import"),
      }))
      return null
    }
  }, [state, onImported])

  return {
    step: state.step,
    isSubmitting: state.isSubmitting,
    error: state.error,
    preview: state.preview,
    manualPrompt: state.manualPrompt,
    metadata: state.metadata,
    resultMessage: state.resultMessage,
    runPreview,
    updateMetadata,
    confirmImport,
    reset,
  }
}

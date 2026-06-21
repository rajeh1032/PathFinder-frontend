import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import type { UploadRagDocumentInput } from "../domain/rag.types"
import {
  deleteRagDocument,
  fetchRagDocuments,
  setRagDocumentActive,
  uploadRagDocument,
} from "./rag.slice"

/** Facade over the RAG documents slice. Fetches on mount. */
export function useRagDocuments() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.rag.items)
  const status = useAppSelector((state) => state.rag.status)
  const error = useAppSelector((state) => state.rag.error)

  useEffect(() => {
    if (status === "idle") dispatch(fetchRagDocuments())
  }, [dispatch, status])

  return {
    items,
    isLoading: status === "loading" || status === "idle",
    error,
    refetch: () => dispatch(fetchRagDocuments()),
    /** Returns the unwrapped result; throws on failure for caller handling. */
    upload: (input: UploadRagDocumentInput) =>
      dispatch(uploadRagDocument(input)).unwrap(),
    remove: (id: string) => dispatch(deleteRagDocument(id)).unwrap(),
    setActive: (id: string, isActive: boolean) =>
      dispatch(setRagDocumentActive({ id, isActive })).unwrap(),
  }
}

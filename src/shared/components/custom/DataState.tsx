import React from "react"
import { EmptyState, type EmptyStateProps } from "./EmptyState"
import { ErrorState } from "./ErrorState"
import { LoadingState } from "./LoadingState"

export type DataStateProps = {
  isLoading: boolean
  error?: string | null
  isEmpty?: boolean
  onRetry?: () => void
  loadingLabel?: string
  empty?: EmptyStateProps
  children: React.ReactNode
}

/**
 * Selects the right async UI: loading -> error -> empty -> content.
 * Keeps feature pages free of repetitive state branching.
 */
export function DataState({
  isLoading,
  error,
  isEmpty,
  onRetry,
  loadingLabel,
  empty,
  children,
}: DataStateProps) {
  if (isLoading) return <LoadingState label={loadingLabel} />
  if (error) return <ErrorState message={error} onRetry={onRetry} />
  if (isEmpty) return <EmptyState {...empty} />
  return <>{children}</>
}

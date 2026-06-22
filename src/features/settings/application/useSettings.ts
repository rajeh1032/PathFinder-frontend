import { useCallback, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { fetchSettings, saveSettings } from "./settings.slice"
import type { SystemSettingsUpdate } from "../domain/settings.types"

/**
 * Facade over the system settings slice. Loads the settings on mount and
 * exposes a save action that returns the updated server state.
 */
export function useSettings() {
  const dispatch = useAppDispatch()
  const data = useAppSelector((state) => state.settings.data)
  const status = useAppSelector((state) => state.settings.status)
  const error = useAppSelector((state) => state.settings.error)

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchSettings())
    }
  }, [dispatch, status])

  const refetch = useCallback(() => {
    dispatch(fetchSettings())
  }, [dispatch])

  const save = useCallback(
    async (payload: SystemSettingsUpdate) => {
      const result = await dispatch(saveSettings(payload))
      if (saveSettings.rejected.match(result)) {
        throw new Error(result.payload ?? "Failed to save settings")
      }
      return result.payload
    },
    [dispatch],
  )

  return {
    data,
    isLoading: status === "loading" || status === "idle",
    error,
    refetch,
    save,
  }
}

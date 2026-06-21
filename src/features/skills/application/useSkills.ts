import { useCallback, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { fetchSkills } from "./skills.slice"
import { skillsApi } from "../data/skills.api"
import type {
  SkillCreatePayload,
  SkillsSort,
  SkillUpdatePayload,
} from "../domain/skills.types"

const DEFAULT_LIMIT = 20

type SkillsQueryState = {
  page: number
  q: string
  category: string
  sort: SkillsSort
}

/**
 * Facade over the skills list slice. Owns the server query state (page,
 * search, category, sort) and refetches when it changes. Search is debounced
 * so the backend `q` filter is not hit on every keystroke. Mutations call the
 * data layer and refresh the current page.
 */
export function useSkills() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.skills.items)
  const pagination = useAppSelector((state) => state.skills.pagination)
  const status = useAppSelector((state) => state.skills.status)
  const error = useAppSelector((state) => state.skills.error)

  const [query, setQuery] = useState<SkillsQueryState>({
    page: 1,
    q: "",
    category: "",
    sort: "name",
  })
  const [searchInput, setSearchInput] = useState("")

  // Debounce the free-text search into the server query.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setQuery((prev) => (prev.q === searchInput ? prev : { ...prev, q: searchInput, page: 1 }))
    }, 350)
    return () => window.clearTimeout(handle)
  }, [searchInput])

  useEffect(() => {
    dispatch(
      fetchSkills({
        page: query.page,
        limit: DEFAULT_LIMIT,
        q: query.q,
        category: query.category || undefined,
        sort: query.sort,
      }),
    )
  }, [dispatch, query.page, query.q, query.category, query.sort])

  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }))
  }, [])

  const setCategory = useCallback((category: string) => {
    setQuery((prev) => ({ ...prev, category, page: 1 }))
  }, [])

  const setSort = useCallback((sort: SkillsSort) => {
    setQuery((prev) => ({ ...prev, sort, page: 1 }))
  }, [])

  const refetch = useCallback(() => {
    dispatch(
      fetchSkills({
        page: query.page,
        limit: DEFAULT_LIMIT,
        q: query.q,
        category: query.category || undefined,
        sort: query.sort,
      }),
    )
  }, [dispatch, query.page, query.q, query.category, query.sort])

  const createSkill = useCallback(
    async (payload: SkillCreatePayload) => {
      await skillsApi.create(payload)
      refetch()
    },
    [refetch],
  )

  const updateSkill = useCallback(
    async (id: string, payload: SkillUpdatePayload) => {
      await skillsApi.update(id, payload)
      refetch()
    },
    [refetch],
  )

  const removeSkill = useCallback(
    async (id: string) => {
      await skillsApi.remove(id)
      refetch()
    },
    [refetch],
  )

  return {
    items,
    pagination,
    isLoading: status === "loading" || status === "idle",
    error,
    search: searchInput,
    setSearch: setSearchInput,
    category: query.category,
    setCategory,
    sort: query.sort,
    setSort,
    setPage,
    refetch,
    createSkill,
    updateSkill,
    removeSkill,
  }
}

import { useCallback, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { fetchCourses } from "./courses.slice"
import { coursesApi } from "../data/courses.api"
import type { CoursesSort, CourseUpdatePayload } from "../domain/courses.types"

const DEFAULT_LIMIT = 20

type CoursesQueryState = {
  page: number
  q: string
  sort: CoursesSort
}

/**
 * Facade over the courses list slice. Owns the server query state (page,
 * search, sort) and refetches whenever it changes. Search is debounced so the
 * backend `q` filter is not hit on every keystroke.
 */
export function useCourses() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.courses.items)
  const pagination = useAppSelector((state) => state.courses.pagination)
  const status = useAppSelector((state) => state.courses.status)
  const error = useAppSelector((state) => state.courses.error)

  const [query, setQuery] = useState<CoursesQueryState>({ page: 1, q: "", sort: "newest" })
  const [searchInput, setSearchInput] = useState("")

  // Debounce the free-text search into the server query.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setQuery((prev) => (prev.q === searchInput ? prev : { ...prev, q: searchInput, page: 1 }))
    }, 350)
    return () => window.clearTimeout(handle)
  }, [searchInput])

  useEffect(() => {
    dispatch(fetchCourses({ page: query.page, limit: DEFAULT_LIMIT, q: query.q, sort: query.sort }))
  }, [dispatch, query.page, query.q, query.sort])

  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }))
  }, [])

  const setSort = useCallback((sort: CoursesSort) => {
    setQuery((prev) => ({ ...prev, sort, page: 1 }))
  }, [])

  const refetch = useCallback(() => {
    dispatch(fetchCourses({ page: query.page, limit: DEFAULT_LIMIT, q: query.q, sort: query.sort }))
  }, [dispatch, query.page, query.q, query.sort])

  /** Update a course, then refresh the current page. */
  const updateCourse = useCallback(
    async (id: string, payload: CourseUpdatePayload) => {
      await coursesApi.update(id, payload)
      refetch()
    },
    [refetch],
  )

  /** Delete a course, then refresh the current page. */
  const removeCourse = useCallback(
    async (id: string) => {
      await coursesApi.remove(id)
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
    sort: query.sort,
    setSort,
    setPage,
    refetch,
    updateCourse,
    removeCourse,
  }
}

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { ApiError } from "@/core/api/api-client"
import { coursesApi } from "../data/courses.api"
import type {
  CoursesListParams,
  CoursesListResult,
  Pagination,
} from "../domain/courses.types"

const INITIAL_PAGINATION: Pagination = {
  page: 1,
  limit: 20,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
  nextPage: null,
  previousPage: null,
}

export type CoursesState = {
  items: CoursesListResult["items"]
  pagination: Pagination
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: CoursesState = {
  items: [],
  pagination: INITIAL_PAGINATION,
  status: "idle",
  error: null,
}

export const fetchCourses = createAsyncThunk<
  CoursesListResult,
  CoursesListParams | undefined,
  { rejectValue: string }
>("courses/fetchList", async (params, { rejectWithValue }) => {
  try {
    return await coursesApi.list(params ?? {})
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to load courses")
  }
})

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Failed to load courses"
      })
  },
})

export const coursesReducer = coursesSlice.reducer

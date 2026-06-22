import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { ApiError } from "@/core/api/api-client"
import { interviewsApi } from "../data/interviews.api"
import type {
  InterviewsListParams,
  InterviewsListResult,
  InterviewSummary,
  Pagination,
} from "../domain/interviews.types"

const INITIAL_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
  nextPage: null,
  previousPage: null,
}

const INITIAL_SUMMARY: InterviewSummary = {
  totalInterviews: 0,
  averageScore: null,
  bestScore: null,
  latestScore: null,
}

export type InterviewsState = {
  items: InterviewsListResult["items"]
  pagination: Pagination
  summary: InterviewSummary
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: InterviewsState = {
  items: [],
  pagination: INITIAL_PAGINATION,
  summary: INITIAL_SUMMARY,
  status: "idle",
  error: null,
}

export const fetchInterviews = createAsyncThunk<
  InterviewsListResult,
  InterviewsListParams | undefined,
  { rejectValue: string }
>("interviews/fetchList", async (params, { rejectWithValue }) => {
  try {
    return await interviewsApi.list(params ?? {})
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to load interview sessions")
  }
})

const interviewsSlice = createSlice({
  name: "interviews",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInterviews.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchInterviews.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.items
        state.pagination = action.payload.pagination
        state.summary = action.payload.summary
      })
      .addCase(fetchInterviews.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Failed to load interview sessions"
      })
  },
})

export const interviewsReducer = interviewsSlice.reducer

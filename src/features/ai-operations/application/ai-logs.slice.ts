import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { ApiError } from "@/core/api/api-client"
import { aiLogsApi } from "../data/ai-logs.api"
import type {
  AiLogStats,
  AiLogsListParams,
  AiLogsListResult,
  Pagination,
} from "../domain/ai-logs.types"

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

export type AiLogsState = {
  items: AiLogsListResult["items"]
  pagination: Pagination
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  stats: AiLogStats | null
  statsStatus: "idle" | "loading" | "succeeded" | "failed"
}

const initialState: AiLogsState = {
  items: [],
  pagination: INITIAL_PAGINATION,
  status: "idle",
  error: null,
  stats: null,
  statsStatus: "idle",
}

export const fetchAiLogs = createAsyncThunk<
  AiLogsListResult,
  AiLogsListParams | undefined,
  { rejectValue: string }
>("aiLogs/fetchList", async (params, { rejectWithValue }) => {
  try {
    return await aiLogsApi.list(params ?? {})
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to load AI logs")
  }
})

export const fetchAiLogStats = createAsyncThunk<
  AiLogStats,
  number | undefined,
  { rejectValue: string }
>("aiLogs/fetchStats", async (days, { rejectWithValue }) => {
  try {
    return await aiLogsApi.stats(days ?? 1)
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to load AI log stats")
  }
})

const aiLogsSlice = createSlice({
  name: "aiLogs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAiLogs.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchAiLogs.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchAiLogs.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Failed to load AI logs"
      })
      .addCase(fetchAiLogStats.pending, (state) => {
        state.statsStatus = "loading"
      })
      .addCase(fetchAiLogStats.fulfilled, (state, action) => {
        state.statsStatus = "succeeded"
        state.stats = action.payload
      })
      .addCase(fetchAiLogStats.rejected, (state) => {
        state.statsStatus = "failed"
      })
  },
})

export const aiLogsReducer = aiLogsSlice.reducer

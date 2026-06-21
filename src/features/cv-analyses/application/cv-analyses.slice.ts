import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { ApiError } from "@/core/api/api-client"
import { cvAnalysesApi } from "../data/cv-analyses.api"
import type {
  CvAnalysesListParams,
  CvAnalysesListResult,
  Pagination,
} from "../domain/cv-analyses.types"

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

export type CvAnalysesState = {
  items: CvAnalysesListResult["items"]
  pagination: Pagination
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: CvAnalysesState = {
  items: [],
  pagination: INITIAL_PAGINATION,
  status: "idle",
  error: null,
}

export const fetchCvAnalyses = createAsyncThunk<
  CvAnalysesListResult,
  CvAnalysesListParams | undefined,
  { rejectValue: string }
>("cvAnalyses/fetchList", async (params, { rejectWithValue }) => {
  try {
    return await cvAnalysesApi.list(params ?? {})
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to load CV analyses")
  }
})

const cvAnalysesSlice = createSlice({
  name: "cvAnalyses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCvAnalyses.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchCvAnalyses.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchCvAnalyses.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Failed to load CV analyses"
      })
  },
})

export const cvAnalysesReducer = cvAnalysesSlice.reducer

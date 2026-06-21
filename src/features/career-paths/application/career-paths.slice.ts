import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { ApiError } from "@/core/api/api-client"
import { careerPathsApi } from "../data/career-paths.api"
import type { CareerPathListItem } from "../domain/career-paths.types"

export type CareerPathsState = {
  items: CareerPathListItem[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: CareerPathsState = {
  items: [],
  status: "idle",
  error: null,
}

export const fetchCareerPaths = createAsyncThunk<
  CareerPathListItem[],
  void,
  { rejectValue: string }
>("careerPaths/fetchList", async (_, { rejectWithValue }) => {
  try {
    return await careerPathsApi.list()
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to load career paths")
  }
})

const careerPathsSlice = createSlice({
  name: "careerPaths",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCareerPaths.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchCareerPaths.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload
      })
      .addCase(fetchCareerPaths.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Failed to load career paths"
      })
  },
})

export const careerPathsReducer = careerPathsSlice.reducer

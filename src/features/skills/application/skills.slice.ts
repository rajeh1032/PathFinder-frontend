import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { ApiError } from "@/core/api/api-client"
import { skillsApi } from "../data/skills.api"
import type {
  Pagination,
  SkillsListParams,
  SkillsListResult,
} from "../domain/skills.types"

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

export type SkillsState = {
  items: SkillsListResult["items"]
  pagination: Pagination
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: SkillsState = {
  items: [],
  pagination: INITIAL_PAGINATION,
  status: "idle",
  error: null,
}

export const fetchSkills = createAsyncThunk<
  SkillsListResult,
  SkillsListParams | undefined,
  { rejectValue: string }
>("skills/fetchList", async (params, { rejectWithValue }) => {
  try {
    return await skillsApi.list(params ?? {})
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to load skills")
  }
})

const skillsSlice = createSlice({
  name: "skills",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkills.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Failed to load skills"
      })
  },
})

export const skillsReducer = skillsSlice.reducer

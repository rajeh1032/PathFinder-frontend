import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { ApiError } from "@/core/api/api-client"
import { settingsApi } from "../data/settings.api"
import type {
  SystemSettingsData,
  SystemSettingsUpdate,
} from "../domain/settings.types"

export type SettingsState = {
  data: SystemSettingsData | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: SettingsState = {
  data: null,
  status: "idle",
  error: null,
}

export const fetchSettings = createAsyncThunk<
  SystemSettingsData,
  void,
  { rejectValue: string }
>("settings/fetch", async (_arg, { rejectWithValue }) => {
  try {
    return await settingsApi.get()
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to load settings")
  }
})

export const saveSettings = createAsyncThunk<
  SystemSettingsData,
  SystemSettingsUpdate,
  { rejectValue: string }
>("settings/save", async (payload, { rejectWithValue }) => {
  try {
    return await settingsApi.update(payload)
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to save settings")
  }
})

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.data = action.payload
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Failed to load settings"
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.data = action.payload
      })
  },
})

export const settingsReducer = settingsSlice.reducer

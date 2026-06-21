import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { ApiError } from "@/core/api/api-client"
import { ragApi } from "../data/rag.api"
import type { RagDocumentListItem, UploadRagDocumentInput } from "../domain/rag.types"

export type RagState = {
  items: RagDocumentListItem[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: RagState = {
  items: [],
  status: "idle",
  error: null,
}

export const fetchRagDocuments = createAsyncThunk<
  RagDocumentListItem[],
  void,
  { rejectValue: string }
>("rag/fetchList", async (_, { rejectWithValue }) => {
  try {
    return await ragApi.list()
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to load RAG documents")
  }
})

export const uploadRagDocument = createAsyncThunk<
  RagDocumentListItem,
  UploadRagDocumentInput,
  { rejectValue: string }
>("rag/upload", async (input, { rejectWithValue }) => {
  try {
    return await ragApi.upload(input)
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to upload document")
  }
})

export const deleteRagDocument = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("rag/delete", async (id, { rejectWithValue }) => {
  try {
    await ragApi.remove(id)
    return id
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to delete document")
  }
})

export const setRagDocumentActive = createAsyncThunk<
  RagDocumentListItem,
  { id: string; isActive: boolean },
  { rejectValue: string }
>("rag/setActive", async ({ id, isActive }, { rejectWithValue }) => {
  try {
    return await ragApi.setActive(id, isActive)
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to update document")
  }
})

const ragSlice = createSlice({
  name: "rag",
  initialState,
  reducers: {
    clearRagError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRagDocuments.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchRagDocuments.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload
      })
      .addCase(fetchRagDocuments.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Failed to load RAG documents"
      })
      .addCase(uploadRagDocument.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items]
      })
      .addCase(deleteRagDocument.fulfilled, (state, action) => {
        // Backend soft-deletes (is_active = false). Reflect that locally so the
        // row stays visible but marked inactive, matching a refetch.
        state.items = state.items.map((item) =>
          item.id === action.payload ? { ...item, isActive: false } : item,
        )
      })
      .addCase(setRagDocumentActive.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        )
      })
  },
})

export const { clearRagError } = ragSlice.actions
export const ragReducer = ragSlice.reducer

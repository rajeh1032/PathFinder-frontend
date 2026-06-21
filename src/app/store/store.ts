import { configureStore } from "@reduxjs/toolkit"
import { authReducer } from "@/features/auth/application/auth.slice"
import { dashboardReducer } from "@/features/dashboard/application/dashboard.slice"
import { usersReducer } from "@/features/users/application/users.slice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    users: usersReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

import { configureStore } from "@reduxjs/toolkit"
import { authReducer } from "@/features/auth/application/auth.slice"
import { dashboardReducer } from "@/features/dashboard/application/dashboard.slice"
import { usersReducer } from "@/features/users/application/users.slice"
import { careerPathsReducer } from "@/features/career-paths/application/career-paths.slice"
import { ragReducer } from "@/features/rag/application/rag.slice"
import { cvAnalysesReducer } from "@/features/cv-analyses/application/cv-analyses.slice"
import { coursesReducer } from "@/features/courses/application/courses.slice"
import { skillsReducer } from "@/features/skills/application/skills.slice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    users: usersReducer,
    careerPaths: careerPathsReducer,
    rag: ragReducer,
    cvAnalyses: cvAnalysesReducer,
    courses: coursesReducer,
    skills: skillsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

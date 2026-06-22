import { configureStore } from "@reduxjs/toolkit"
import { authReducer } from "@/features/auth/application/auth.slice"
import { dashboardReducer } from "@/features/dashboard/application/dashboard.slice"
import { usersReducer } from "@/features/users/application/users.slice"
import { careerPathsReducer } from "@/features/career-paths/application/career-paths.slice"
import { ragReducer } from "@/features/rag/application/rag.slice"
import { cvAnalysesReducer } from "@/features/cv-analyses/application/cv-analyses.slice"
import { coursesReducer } from "@/features/courses/application/courses.slice"
import { skillsReducer } from "@/features/skills/application/skills.slice"
import { jobsReducer } from "@/features/jobs/application/jobs.slice"
import { jobMatchesReducer } from "@/features/jobs/application/jobMatches.slice"
import { interviewsReducer } from "@/features/interviews/application/interviews.slice"
import { aiLogsReducer } from "@/features/ai-operations/application/ai-logs.slice"
import { settingsReducer } from "@/features/settings/application/settings.slice"

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
    jobs: jobsReducer,
    jobMatches: jobMatchesReducer,
    interviews: interviewsReducer,
    aiLogs: aiLogsReducer,
    settings: settingsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

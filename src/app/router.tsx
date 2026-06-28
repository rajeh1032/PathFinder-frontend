import { createBrowserRouter, Navigate } from "react-router"
import { AdminLayout } from "./layout/AdminLayout"
import { ProtectedRoute } from "@/features/auth/presentation/components/ProtectedRoute"

export const router = createBrowserRouter([
  {
    path: "/login",
    lazy: () => import("@/features/auth/presentation/pages/AdminLogin").then(({ AdminLogin }) => ({ Component: AdminLogin })),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/welcome",
        lazy: () => import("@/features/dashboard/presentation/pages/WelcomeSplash").then(({ WelcomeSplash }) => ({ Component: WelcomeSplash })),
      },
      {
        path: "/",
        element: <AdminLayout />,
        children: [
          { index: true, lazy: () => import("@/features/dashboard/presentation/pages/Dashboard").then(({ Dashboard }) => ({ Component: Dashboard })) },
          { path: "users", lazy: () => import("@/features/users/presentation/pages/UsersList").then(({ UsersList }) => ({ Component: UsersList })) },
          { path: "users/:id", lazy: () => import("@/features/users/presentation/pages/UserDetails").then(({ UserDetails }) => ({ Component: UserDetails })) },
          { path: "career-paths", lazy: () => import("@/features/career-paths/presentation/pages/CareerPaths").then(({ CareerPaths }) => ({ Component: CareerPaths })) },
          { path: "career-paths/:id/edit", lazy: () => import("@/features/career-paths/presentation/pages/CareerPathEdit").then(({ CareerPathEdit }) => ({ Component: CareerPathEdit })) },
          { path: "skills", lazy: () => import("@/features/skills/presentation/pages/SkillsManagement").then(({ SkillsManagement }) => ({ Component: SkillsManagement })) },
          { path: "courses", lazy: () => import("@/features/courses/presentation/pages/Courses").then(({ Courses }) => ({ Component: Courses })) },
          { path: "roadmaps", lazy: () => import("@/features/roadmaps/presentation/pages/Roadmaps").then(({ Roadmaps }) => ({ Component: Roadmaps })) },
          { path: "jobs", lazy: () => import("@/features/jobs/presentation/pages/JobsList").then(({ JobsList }) => ({ Component: JobsList })) },
          { path: "job-matches", lazy: () => import("@/features/jobs/presentation/pages/JobMatches").then(({ JobMatches }) => ({ Component: JobMatches })) },
          { path: "cv-analyses", lazy: () => import("@/features/cv-analyses/presentation/pages/CvAnalyses").then(({ CvAnalyses }) => ({ Component: CvAnalyses })) },
          { path: "cv-analyses/:id", lazy: () => import("@/features/cv-analyses/presentation/pages/CvAnalysisDetails").then(({ CvAnalysisDetails }) => ({ Component: CvAnalysisDetails })) },
          { path: "interview-sessions", lazy: () => import("@/features/interviews/presentation/pages/InterviewSessions").then(({ InterviewSessions }) => ({ Component: InterviewSessions })) },
          { path: "interview-sessions/:id", lazy: () => import("@/features/interviews/presentation/pages/InterviewDetails").then(({ InterviewDetails }) => ({ Component: InterviewDetails })) },
          { path: "ai-logs", lazy: () => import("@/features/ai-operations/presentation/pages/AiLogs").then(({ AiLogs }) => ({ Component: AiLogs })) },
          { path: "rag-documents", lazy: () => import("@/features/rag/presentation/pages/RagDocuments").then(({ RagDocuments }) => ({ Component: RagDocuments })) },
          { path: "rag-documents/upload", lazy: () => import("@/features/rag/presentation/pages/UploadRagDocument").then(({ UploadRagDocument }) => ({ Component: UploadRagDocument })) },
          { path: "settings", lazy: () => import("@/features/settings/presentation/pages/SystemSettings").then(({ SystemSettings }) => ({ Component: SystemSettings })) },
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
])


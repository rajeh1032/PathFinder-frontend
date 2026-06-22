import { env } from "@/core/config/env"

/**
 * Backend exception: the chat module is mounted under `/api/chat`, not
 * `/api/v1`. Pass `{ baseUrl: chatApiBaseUrl }` to `apiRequest`/`http` when
 * calling the chat endpoints below.
 */
export const chatApiBaseUrl = `${env.serverOrigin}/api/chat`

/**
 * Path constants for every mounted backend route, relative to `env.apiBaseUrl`
 * (`/api/v1`) unless noted. Verified against PathFinder-Backend route files.
 * Add a constant here before adding a call; do not inline paths in features.
 */
export const apiEndpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    me: "/auth/me",
    profile: "/auth/profile",
    changePassword: "/auth/change-password",
  },
  users: {
    list: "/users",
    me: "/users/me",
    byId: (id: string) => `/users/${id}`,
    stats: (id: string) => `/users/${id}/stats`,
    activate: (id: string) => `/users/${id}/activate`,
    deactivate: (id: string) => `/users/${id}/deactivate`,
  },
  dashboard: {
    overview: "/dashboard/overview",
  },
  settings: {
    // Admin-only. `GET /settings` returns the full settings object;
    // `PUT /settings` upserts a partial object and returns the full object.
    root: "/settings",
  },
  aiLogs: {
    // Admin-only. `GET /ai-logs` (paginated list), `GET /ai-logs/stats`
    // (summary cards), `GET /ai-logs/:id` (full prompt/response/payloads),
    // `DELETE /ai-logs/:id` (remove one), `DELETE /ai-logs` (clear all).
    root: "/ai-logs",
    stats: "/ai-logs/stats",
    byId: (id: string) => `/ai-logs/${id}`,
  },
  skills: {
    // `GET /skills` (authenticate, paginated) and `POST /skills` (admin).
    root: "/skills",
    // `GET /:id` (authenticate, returns usage counts), `PATCH /:id` (admin),
    // `DELETE /:id` (admin).
    byId: (id: string) => `/skills/${id}`,
  },
  cvs: {
    analyze: "/cvs/analyze",
    latestAnalysis: "/cvs/me/latest-analysis",
    status: "/cvs/me/status",
    // Admin-only (require `authorize('admin')` on the backend).
    list: "/cvs",
    byId: (id: string) => `/cvs/${id}`,
  },
  rag: {
    documents: "/rag/documents",
    upload: "/rag/documents/upload",
    byId: (id: string) => `/rag/documents/${id}`,
  },
  roadmaps: {
    generate: "/roadmaps/generate",
    me: "/roadmaps/me",
    byId: (id: string) => `/roadmaps/${id}`,
    stepProgress: (roadmapId: string, stepId: string) =>
      `/roadmaps/${roadmapId}/steps/${stepId}/progress`,
  },
  courses: {
    root: "/courses",
    importPreview: "/courses/import/preview",
    importConfirm: "/courses/import/confirm",
    recommended: "/courses/recommended",
    saved: "/courses/saved",
    enrollments: "/courses/enrollments",
    // `byId` is used for GET (read), PATCH (admin update), and DELETE (admin).
    byId: (id: string) => `/courses/${id}`,
    save: (id: string) => `/courses/${id}/save`,
    enroll: (id: string) => `/courses/${id}/enroll`,
    enrollment: (id: string) => `/courses/${id}/enrollment`,
  },
  interviews: {
    careerPaths: "/interviews/career-paths",
    sessions: "/interviews/sessions",
    sessionById: (id: string) => `/interviews/sessions/${id}`,
    sessionQuestions: (id: string) => `/interviews/sessions/${id}/questions`,
    answerQuestion: (id: string, questionId: string) =>
      `/interviews/sessions/${id}/questions/${questionId}/answer`,
    skipQuestion: (id: string, questionId: string) =>
      `/interviews/sessions/${id}/questions/${questionId}/skip`,
    finishSession: (id: string) => `/interviews/sessions/${id}/finish`,
    sessionResult: (id: string) => `/interviews/sessions/${id}/result`,
    cancelSession: (id: string) => `/interviews/sessions/${id}/cancel`,
    adminSessions: "/interviews/admin/sessions",
    adminSessionById: (id: string) => `/interviews/admin/sessions/${id}`,
  },
  jobs: {
    root: "/jobs",
    matched: "/jobs/matched",
    sync: "/jobs/sync",
    saved: "/jobs/saved",
    applied: "/jobs/applied",
    appliedStatus: (id: string) => `/jobs/applied/${id}/status`,
    byId: (id: string) => `/jobs/${id}`,
    save: (id: string) => `/jobs/${id}/save`,
    apply: (id: string) => `/jobs/${id}/apply`,
  },
  jobMatches: {
    root: "/job-matches",
    generate: "/job-matches/generate",
    byId: (id: string) => `/job-matches/${id}`,
  },
  coverLetters: {
    root: "/cover-letters",
    generate: "/cover-letters/generate",
    byId: (id: string) => `/cover-letters/${id}`,
    versions: (id: string) => `/cover-letters/${id}/versions`,
    export: (id: string) => `/cover-letters/${id}/export`,
  },
  // Chat lives under `/api/chat`. Call with `{ baseUrl: chatApiBaseUrl }`.
  chat: {
    sessions: "/sessions",
    sendMessage: (sessionId: string) => `/${sessionId}`,
    sessionMessages: (sessionId: string) => `/${sessionId}/messages`,
    deleteSession: (sessionId: string) => `/sessions/${sessionId}`,
  },
} as const

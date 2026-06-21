/** Aggregated admin metrics returned by `GET /dashboard/overview`. */

export type DashboardKpis = {
  totalUsers: number
  totalCvs: number
  totalCvAnalyses: number
  totalCareerPaths: number
  totalSkills: number
  totalCourses: number
  totalJobs: number
  totalJobMatches: number
  totalInterviews: number
  totalRagDocuments: number
  aiTokensUsed: number
  aiEstimatedCost: number
}

export type NamedCount = { name: string; count: number }

export type DashboardTrends = {
  userGrowth: { name: string; users: number }[]
  cvAnalyses: { name: string; count: number }[]
  jobMatches: { name: string; count: number }[]
  aiUsage: { name: string; tokens: number }[]
}

export type DashboardOverview = {
  kpis: DashboardKpis
  topCareerPaths: NamedCount[]
  topSkills: NamedCount[]
  trends: DashboardTrends
}

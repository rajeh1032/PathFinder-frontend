/** Types for the users feature, mirroring the backend `/users` contract. */

export type Pagination = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: number | null
  previousPage: number | null
}

/** Nested lookup objects returned inside the profile embed. */
type Lookup<K extends string> = { id: string } & { [P in K]?: string | null }

export type UserProfileDto = {
  id: string
  user_id: string
  university: string | null
  major: string | null
  location: string | null
  headline: string | null
  bio: string | null
  avatar_url: string | null
  education_level: Lookup<"education_level"> | null
  experience_year: Lookup<"experience_level"> | null
  current_status: Lookup<"current_status"> | null
  career_paths: { id: string; title: string | null } | null
}

export type UserDto = {
  id: string
  name: string
  email: string
  is_active: boolean
  created_at: string
  last_login_at: string | null
  last_active_at: string | null
  role: { id: string; name: string } | null
  profile: UserProfileDto | null
}

/** Flattened view model used by the list table. */
export type UserListItem = {
  id: string
  name: string
  email: string
  isActive: boolean
  status: "Active" | "Inactive"
  role: string
  targetCareer: string
  experience: string
  location: string
  lastActiveAt: string
  createdAt: string
}

export type UserStats = {
  counts: {
    skills: number
    cvs: number
    cvAnalyses: number
    roadmaps: number
    jobMatches: number
    interviews: number
    coverLetters: number
    chatSessions: number
  }
  aiUsage: {
    tokensUsed: number
    cost: number
    calls: number
  }
}

export type UsersListParams = {
  page?: number
  limit?: number
  search?: string
  status?: "active" | "inactive" | ""
}

export type UsersListResult = {
  items: UserListItem[]
  pagination: Pagination
}

import { apiRequestWithMeta, http } from "@/core/api/api-client"
import { apiEndpoints } from "@/core/api/api-endpoints"
import { HttpMethod } from "@/core/api/http.constants"
import type {
  Pagination,
  UserDto,
  UserListItem,
  UsersListParams,
  UsersListResult,
  UserStats,
} from "../domain/users.types"

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 20,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
  nextPage: null,
  previousPage: null,
}

/** Map a backend user DTO to the flattened list view model. */
export function toListItem(dto: UserDto): UserListItem {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    isActive: dto.is_active,
    status: dto.is_active ? "Active" : "Inactive",
    role: dto.role?.name ?? "user",
    targetCareer: dto.profile?.career_paths?.title ?? "—",
    experience: dto.profile?.experience_year?.experience_level ?? "—",
    location: dto.profile?.location ?? "—",
    lastActiveAt: dto.last_active_at ?? "—",
    createdAt: dto.created_at ? dto.created_at.slice(0, 10) : "—",
  }
}

export const usersApi = {
  async list(params: UsersListParams = {}): Promise<UsersListResult> {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    }
    if (params.search) query.search = params.search
    if (params.status) query.status = params.status

    const { data, meta } = await apiRequestWithMeta<
      { users: UserDto[] },
      { pagination?: Pagination }
    >(apiEndpoints.users.list, { query })

    return {
      items: (data?.users ?? []).map(toListItem),
      pagination: meta?.pagination ?? DEFAULT_PAGINATION,
    }
  },

  async getById(id: string): Promise<UserDto> {
    const data = await http.get<{ user: UserDto }>(apiEndpoints.users.byId(id))
    return data.user
  },

  getStats: (id: string) => http.get<UserStats>(apiEndpoints.users.stats(id)),

  activate: (id: string) =>
    apiRequestWithMeta<{ user: UserDto }>(apiEndpoints.users.activate(id), {
      method: HttpMethod.PATCH,
    }).then((res) => res.data.user),

  deactivate: (id: string) =>
    apiRequestWithMeta<{ user: UserDto }>(apiEndpoints.users.deactivate(id), {
      method: HttpMethod.PATCH,
    }).then((res) => res.data.user),
}

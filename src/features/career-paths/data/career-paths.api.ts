import { http } from "@/core/api/api-client"
import { apiEndpoints } from "@/core/api/api-endpoints"
import type { CareerPathDto, CareerPathListItem } from "../domain/career-paths.types"

/** Map a backend career-path DTO to the flattened list view model. */
export function toListItem(dto: CareerPathDto): CareerPathListItem {
  return {
    id: dto.id,
    title: dto.title,
    category: dto.category ?? "—",
    difficulty_level: dto.difficulty_level ?? "—",
  }
}

export const careerPathsApi = {
  /**
   * Fetch the active career-path catalog.
   *
   * Verified backend route: `GET /api/v1/interviews/career-paths`
   * (`authenticate`, returns active paths with `id`, `title`, `category`,
   * `difficulty_level`).
   */
  async list(): Promise<CareerPathListItem[]> {
    const data = await http.get<CareerPathDto[]>(apiEndpoints.interviews.careerPaths)
    return (data ?? []).map(toListItem)
  },
}

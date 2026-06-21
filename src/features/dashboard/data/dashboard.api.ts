import { http } from "@/core/api/api-client"
import { apiEndpoints } from "@/core/api/api-endpoints"
import type { DashboardOverview } from "../domain/dashboard.types"

export const dashboardApi = {
  getOverview: () => http.get<DashboardOverview>(apiEndpoints.dashboard.overview),
}

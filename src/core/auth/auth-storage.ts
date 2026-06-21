const accessTokenKey = "pathfinder.admin.accessToken"
const refreshTokenKey = "pathfinder.admin.refreshToken"
const userKey = "pathfinder.admin.user"

export type StoredAdmin = {
  id: string
  email: string
  name?: string
  role: string
}

function activeStorage() {
  return localStorage.getItem(accessTokenKey) ? localStorage : sessionStorage
}

export const authStorage = {
  getAccessToken: () => activeStorage().getItem(accessTokenKey),
  getRefreshToken: () => activeStorage().getItem(refreshTokenKey),
  getUser(): StoredAdmin | null {
    const value = activeStorage().getItem(userKey)
    if (!value) return null
    try { return JSON.parse(value) as StoredAdmin } catch { return null }
  },
  save(accessToken: string, refreshToken: string, user: StoredAdmin, remember: boolean) {
    this.clear()
    const storage = remember ? localStorage : sessionStorage
    storage.setItem(accessTokenKey, accessToken)
    storage.setItem(refreshTokenKey, refreshToken)
    storage.setItem(userKey, JSON.stringify(user))
  },
  clear() {
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem(accessTokenKey)
      storage.removeItem(refreshTokenKey)
      storage.removeItem(userKey)
    }
  },
}


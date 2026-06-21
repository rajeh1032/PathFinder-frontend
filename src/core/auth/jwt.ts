/** Decode the `role` claim from a JWT without verifying the signature (UX gating only). */
export function decodeJwtRole(token: string): string {
  try {
    const rawPayload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    const padded = rawPayload.padEnd(Math.ceil(rawPayload.length / 4) * 4, "=")
    return String(JSON.parse(atob(padded)).role || "user")
  } catch {
    return "user"
  }
}

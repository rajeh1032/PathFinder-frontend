export function exportCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => escape(r[h])).join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export type CsvImportResult<T> = { ok: T[]; errors: { row: number; reason: string }[] }

export function parseCsv<T extends Record<string, string>>(text: string, required: string[]): CsvImportResult<T> {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return { ok: [], errors: [{ row: 0, reason: "File is empty" }] }
  const headers = lines[0].split(",").map(h => h.trim())
  const missing = required.filter(r => !headers.includes(r))
  if (missing.length) return { ok: [], errors: [{ row: 0, reason: `Missing columns: ${missing.join(", ")}` }] }
  const ok: T[] = []
  const errors: { row: number; reason: string }[] = []
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",")
    if (cells.length !== headers.length) { errors.push({ row: i + 1, reason: "Column count mismatch" }); continue }
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => { obj[h] = cells[idx]?.trim() ?? "" })
    const blank = required.find(r => !obj[r])
    if (blank) { errors.push({ row: i + 1, reason: `Empty required field: ${blank}` }); continue }
    ok.push(obj as T)
  }
  return { ok, errors }
}

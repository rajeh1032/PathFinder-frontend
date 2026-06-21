import React, { useState } from "react"
import { Camera, Save, Lock, LogOut, Trash2, Monitor, Smartphone, Globe } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { FormModal, ConfirmDeleteDialog, Field } from "@/shared/components/crud"

type Session = { id: string; device: string; browser: string; location: string; ip: string; current: boolean; lastActive: string; type: "desktop" | "mobile" }

const initialSessions: Session[] = [
  { id: "1", device: "MacBook Pro", browser: "Chrome 130", location: "Cairo, EG", ip: "41.234.10.22", current: true, lastActive: "Now", type: "desktop" },
  { id: "2", device: "iPhone 15", browser: "Safari Mobile", location: "Cairo, EG", ip: "41.234.11.18", current: false, lastActive: "3h ago", type: "mobile" },
  { id: "3", device: "Windows PC", browser: "Edge 129", location: "Alexandria, EG", ip: "156.220.40.12", current: false, lastActive: "2 days ago", type: "desktop" },
]

export function Profile() {
  const [profile, setProfile] = useState({
    name: "Mona Adel",
    email: "mona@pathfinder.ai",
    title: "Super Admin",
    phone: "+20 100 123 4567",
    bio: "Building career discovery experiences for the next generation.",
    timezone: "Africa/Cairo",
    language: "English (en-US)",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const [pwModalOpen, setPwModalOpen] = useState(false)
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" })
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({})
  const [pwLoading, setPwLoading] = useState(false)

  const [sessions, setSessions] = useState(initialSessions)
  const [sessionToRevoke, setSessionToRevoke] = useState<Session | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleting, setDeleting] = useState(false)

  const saveProfile = () => {
    const e: Record<string, string> = {}
    if (!profile.name.trim()) e.name = "Required"
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(profile.email)) e.email = "Invalid email"
    if (profile.phone && !/^[+\d\s-]{6,}$/.test(profile.phone)) e.phone = "Invalid phone"
    setErrors(e); if (Object.keys(e).length) return
    setSaving(true)
    setTimeout(() => { setSaving(false); toast.success("Profile updated") }, 400)
  }

  const submitPassword = () => {
    const e: Record<string, string> = {}
    if (!pwForm.current) e.current = "Required"
    if (pwForm.next.length < 8) e.next = "Min 8 characters"
    if (!/[A-Z]/.test(pwForm.next) || !/[0-9]/.test(pwForm.next)) e.next = "Must include uppercase and a number"
    if (pwForm.next !== pwForm.confirm) e.confirm = "Passwords don't match"
    setPwErrors(e); if (Object.keys(e).length) return
    setPwLoading(true)
    setTimeout(() => {
      setPwLoading(false); setPwModalOpen(false)
      setPwForm({ current: "", next: "", confirm: "" })
      toast.success("Password changed")
    }, 500)
  }

  const uploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return }
    if (!/^image\/(png|jpeg|jpg|webp)$/.test(file.type)) { toast.error("PNG, JPG or WebP only"); return }
    toast.success(`Avatar updated: ${file.name}`)
  }

  const revokeSession = () => {
    if (!sessionToRevoke) return
    setSessions(s => s.filter(x => x.id !== sessionToRevoke.id))
    toast.success("Session revoked")
    setSessionToRevoke(null)
  }

  const revokeAll = () => {
    setSessions(s => s.filter(x => x.current))
    toast.success("Other sessions revoked")
  }

  const deleteAccount = () => {
    if (deleteConfirm !== profile.email) { toast.error("Email confirmation does not match"); return }
    setDeleting(true)
    setTimeout(() => { setDeleting(false); setDeleteOpen(false); toast.success("Account scheduled for deletion") }, 600)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-[var(--muted-foreground)]">Your personal information and account security.</p>
      </div>

      {/* Personal info */}
      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-2xl font-bold">
                {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-[var(--muted)]">
                <Camera className="h-3.5 w-3.5" />
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={uploadAvatar} />
              </label>
            </div>
            <div>
              <p className="font-semibold">{profile.name}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{profile.title}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">PNG, JPG or WebP. Max 2MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" error={errors.name}>
              <Input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
            </Field>
            <Field label="Job Title">
              <Input value={profile.title} onChange={e => setProfile({ ...profile, title: e.target.value })} />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <Input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
            </Field>
            <Field label="Timezone">
              <select className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm" value={profile.timezone} onChange={e => setProfile({ ...profile, timezone: e.target.value })}>
                <option>Africa/Cairo</option><option>Europe/London</option><option>America/New_York</option><option>Asia/Dubai</option><option>UTC</option>
              </select>
            </Field>
            <Field label="Language">
              <select className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm" value={profile.language} onChange={e => setProfile({ ...profile, language: e.target.value })}>
                <option>English (en-US)</option><option>Arabic (ar-EG)</option><option>French (fr-FR)</option>
              </select>
            </Field>
          </div>

          <Field label="Bio" hint={`${profile.bio.length} / 240`}>
            <Textarea rows={3} maxLength={240} value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
          </Field>

          <div className="flex justify-end">
            <Button onClick={saveProfile} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader><CardTitle>Security</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center"><Lock className="h-4 w-4" /></div>
              <div>
                <p className="font-medium text-sm">Password</p>
                <p className="text-xs text-[var(--muted-foreground)]">Last changed 2 months ago</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setPwForm({ current: "", next: "", confirm: "" }); setPwErrors({}); setPwModalOpen(true) }}>Change Password</Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)]">
            <div>
              <p className="font-medium text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-[var(--muted-foreground)]">Extra security via authenticator app</p>
            </div>
            <Badge variant="success">Enabled</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Active sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Sessions</CardTitle>
          {sessions.filter(s => !s.current).length > 0 && (
            <Button variant="outline" size="sm" onClick={revokeAll}><LogOut className="mr-2 h-4 w-4" />Sign out other sessions</Button>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                  {s.type === "mobile" ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{s.device} · {s.browser}</p>
                    {s.current && <Badge variant="success">This device</Badge>}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5"><Globe className="h-3 w-3" />{s.location} · {s.ip} · {s.lastActive}</p>
                </div>
              </div>
              {!s.current && (
                <Button variant="ghost" size="sm" onClick={() => setSessionToRevoke(s)}>Revoke</Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200">
        <CardHeader><CardTitle className="text-red-600">Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Delete account</p>
              <p className="text-xs text-[var(--muted-foreground)]">Permanently remove your account and all associated data.</p>
            </div>
            <Button variant="destructive" onClick={() => { setDeleteConfirm(""); setDeleteOpen(true) }}>
              <Trash2 className="mr-2 h-4 w-4" />Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change password modal */}
      <FormModal open={pwModalOpen} onOpenChange={setPwModalOpen} title="Change Password" description="Use a strong password you don't reuse." onSubmit={submitPassword} loading={pwLoading} submitLabel="Update Password">
        <Field label="Current Password" error={pwErrors.current}>
          <Input type="password" value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} />
        </Field>
        <Field label="New Password" error={pwErrors.next} hint="Min 8 chars, with uppercase and a number.">
          <Input type="password" value={pwForm.next} onChange={e => setPwForm({ ...pwForm, next: e.target.value })} />
        </Field>
        <Field label="Confirm New Password" error={pwErrors.confirm}>
          <Input type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
        </Field>
      </FormModal>

      {/* Revoke session confirm */}
      <ConfirmDeleteDialog
        open={!!sessionToRevoke}
        onOpenChange={(v) => !v && setSessionToRevoke(null)}
        title={`Revoke ${sessionToRevoke?.device}?`}
        description="That session will be signed out immediately."
        onConfirm={revokeSession}
      />

      {/* Delete account modal — requires email confirmation */}
      <FormModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Account"
        description="This is permanent. All your data will be removed within 30 days."
        onSubmit={deleteAccount}
        loading={deleting}
        submitLabel="Permanently Delete"
      >
        <Field label="Type your email to confirm" hint={`Confirm: ${profile.email}`}>
          <Input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} />
        </Field>
      </FormModal>
    </div>
  )
}

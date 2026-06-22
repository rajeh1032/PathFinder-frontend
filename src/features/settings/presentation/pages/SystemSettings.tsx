import React, { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Save, Globe, Cpu, AlertTriangle, User, RotateCcw, Eye, EyeOff } from "lucide-react"
import { ApiError } from "@/core/api/api-client"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Switch } from "@/shared/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Field } from "@/shared/components/crud"
import { useSettings } from "../../application/useSettings"
import { settingsApi } from "../../data/settings.api"
import type { SystemSettingsData } from "../../domain/settings.types"

const tabs = [
  { id: "general",    label: "General",          icon: Globe         },
  { id: "ai",         label: "AI Configuration", icon: Cpu           },
  { id: "maintenance",label: "Maintenance",      icon: AlertTriangle },
  { id: "profile",    label: "Admin Profile",    icon: User          },
]

const SETTINGS_DEFAULTS: SystemSettingsData = {
  app_name: "PathFinder AI",
  support_email: "support@pathfinder.ai",
  default_language: "en",
  ai_provider: "google",
  ai_model: "gemini-3.1-flash-lite",
  max_tokens: 4096,
  temperature: 0.7,
  maintenance_enabled: false,
  maintenance_message: "The platform is currently under maintenance. Please check back soon.",
}

type ProfileForm = { id: string; name: string; email: string }
type PasswordForm = { current_password: string; new_password: string; confirm_password: string }

const emptyPassword: PasswordForm = { current_password: "", new_password: "", confirm_password: "" }

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

export function SystemSettings() {
  const settings = useSettings()

  const [tab, setTab] = useState("general")
  const [form, setForm] = useState<SystemSettingsData>(SETTINGS_DEFAULTS)
  const [profile, setProfile] = useState<ProfileForm>({ id: "", name: "", email: "" })
  const [profileOriginal, setProfileOriginal] = useState<ProfileForm>({ id: "", name: "", email: "" })
  const [password, setPassword] = useState<PasswordForm>(emptyPassword)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [showPass, setShowPass] = useState(false)

  // Sync the form with loaded settings.
  useEffect(() => {
    if (settings.data) setForm(settings.data)
  }, [settings.data])

  // Load the admin profile (name/email) once.
  useEffect(() => {
    let active = true
    settingsApi
      .getProfile()
      .then((user) => {
        if (!active) return
        const loaded = { id: user.id, name: user.name ?? "", email: user.email ?? "" }
        setProfile(loaded)
        setProfileOriginal(loaded)
      })
      .catch((err) => {
        if (active) toast.error(errorMessage(err, "Failed to load profile"))
      })
    return () => {
      active = false
    }
  }, [])

  const settingsDirty = useMemo(
    () => Boolean(settings.data) && JSON.stringify(form) !== JSON.stringify(settings.data),
    [form, settings.data],
  )
  const profileDirty = profile.name !== profileOriginal.name || profile.email !== profileOriginal.email
  const passwordDirty = Boolean(password.new_password || password.current_password)
  const dirty = settingsDirty || profileDirty || passwordDirty

  const set = <K extends keyof SystemSettingsData>(key: K, value: SystemSettingsData[K]) =>
    setForm((s) => ({ ...s, [key]: value }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.app_name.trim()) e.app_name = "Required"
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.support_email)) e.support_email = "Invalid email"
    if (form.max_tokens < 256 || form.max_tokens > 32768) e.max_tokens = "Between 256 and 32768"
    if (form.temperature < 0 || form.temperature > 2) e.temperature = "Between 0 and 2"
    if (profileDirty) {
      if (!profile.name.trim()) e.admin_name = "Required"
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(profile.email)) e.admin_email = "Invalid email"
    }
    if (passwordDirty) {
      if (!password.current_password) e.current_password = "Enter current password"
      if (password.new_password.length < 8) e.new_password = "Min 8 characters"
      if (password.new_password !== password.confirm_password) e.confirm_password = "Passwords do not match"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate()) {
      toast.error("Fix validation errors first")
      return
    }
    setSaving(true)
    try {
      if (settingsDirty) {
        await settings.save(form)
      }
      if (profileDirty && profile.id) {
        const updated = await settingsApi.updateProfile(profile.id, { name: profile.name.trim(), email: profile.email.trim() })
        const loaded = { id: updated.id, name: updated.name ?? "", email: updated.email ?? "" }
        setProfile(loaded)
        setProfileOriginal(loaded)
      }
      if (passwordDirty) {
        await settingsApi.changePassword({ password: password.current_password, newPassword: password.new_password })
        setPassword(emptyPassword)
      }
      setErrors({})
      toast.success("Settings saved")
    } catch (err) {
      toast.error(errorMessage(err, "Failed to save settings"))
    } finally {
      setSaving(false)
    }
  }

  const discard = () => {
    if (settings.data) setForm(settings.data)
    setProfile(profileOriginal)
    setPassword(emptyPassword)
    setErrors({})
    toast.info("Changes discarded")
  }

  const loadingSettings = settings.isLoading && !settings.data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-[var(--muted-foreground)]">Configure platform preferences and admin profile.</p>
        </div>
        <div className="flex gap-2">
          {dirty && <Badge variant="warning">Unsaved changes</Badge>}
          <Button variant="outline" onClick={discard} disabled={!dirty || saving}>
            <RotateCcw className="mr-2 h-4 w-4" />Discard
          </Button>
          <Button onClick={save} disabled={saving || !dirty}>
            <Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {settings.error && !settings.data && (
        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          <span>{settings.error}</span>
          <Button variant="outline" size="sm" onClick={settings.refetch}>Retry</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
        <nav className="space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${tab === t.id ? "bg-[var(--primary)]/10 text-[var(--primary)] font-medium" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}
            >
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </nav>

        <div>
          {loadingSettings ? (
            <Card>
              <CardContent className="py-12 text-center text-[var(--muted-foreground)]">Loading settings…</CardContent>
            </Card>
          ) : (
            <>
              {tab === "general" && (
                <Card>
                  <CardHeader><CardTitle>General</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Field label="App Name *" error={errors.app_name}>
                      <Input value={form.app_name} onChange={(e) => set("app_name", e.target.value)} />
                    </Field>
                    <Field label="Support Email *" error={errors.support_email}>
                      <Input type="email" value={form.support_email} onChange={(e) => set("support_email", e.target.value)} />
                    </Field>
                    <Field label="Default Language">
                      <select
                        className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm"
                        value={form.default_language}
                        onChange={(e) => set("default_language", e.target.value)}
                      >
                        <option value="en">English (en)</option>
                        <option value="ar">Arabic (ar)</option>
                        <option value="fr">French (fr)</option>
                      </select>
                    </Field>
                  </CardContent>
                </Card>
              )}

              {tab === "ai" && (
                <Card>
                  <CardHeader><CardTitle>AI Configuration</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Field label="AI Provider">
                      <select
                        className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm"
                        value={form.ai_provider}
                        onChange={(e) => set("ai_provider", e.target.value)}
                      >
                        <option value="anthropic">Anthropic (Claude)</option>
                        <option value="openai">OpenAI (GPT)</option>
                        <option value="google">Google (Gemini)</option>
                      </select>
                    </Field>
                    <Field label="AI Model">
                      <Input value={form.ai_model} onChange={(e) => set("ai_model", e.target.value)} placeholder="e.g. gemini-3.1-flash-lite" />
                    </Field>
                    <Field label="Max Tokens" error={errors.max_tokens} hint="256 – 32768">
                      <Input
                        type="number" min={256} max={32768}
                        value={form.max_tokens}
                        onChange={(e) => set("max_tokens", Number(e.target.value))}
                      />
                    </Field>
                    <Field label="Temperature" error={errors.temperature} hint="0.0 (deterministic) – 2.0 (creative)">
                      <Input
                        type="number" min={0} max={2} step={0.1}
                        value={form.temperature}
                        onChange={(e) => set("temperature", Number(e.target.value))}
                      />
                    </Field>
                  </CardContent>
                </Card>
              )}

              {tab === "maintenance" && (
                <Card>
                  <CardHeader><CardTitle>Maintenance</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40">
                      <div>
                        <p className="font-medium text-sm">Maintenance Mode</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                          When enabled, students see the maintenance message instead of the app.
                        </p>
                      </div>
                      <Switch
                        checked={form.maintenance_enabled}
                        onCheckedChange={(v) => set("maintenance_enabled", v)}
                      />
                    </div>
                    {form.maintenance_enabled && (
                      <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        Maintenance mode is currently <strong>ON</strong>. Students cannot access the platform.
                      </div>
                    )}
                    <Field label="Maintenance Message">
                      <Textarea
                        rows={4}
                        placeholder="We are currently performing maintenance..."
                        value={form.maintenance_message}
                        onChange={(e) => set("maintenance_message", e.target.value)}
                      />
                    </Field>
                  </CardContent>
                </Card>
              )}

              {tab === "profile" && (
                <Card>
                  <CardHeader><CardTitle>Admin Profile</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Field label="Name *" error={errors.admin_name}>
                      <Input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
                    </Field>
                    <Field label="Email *" error={errors.admin_email}>
                      <Input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
                    </Field>

                    <div className="pt-4 border-t border-[var(--border)]">
                      <p className="text-sm font-medium mb-4">Change Password</p>
                      <div className="space-y-3">
                        <Field label="Current Password" error={errors.current_password}>
                          <div className="relative">
                            <Input
                              type={showPass ? "text" : "password"}
                              placeholder="Enter current password"
                              value={password.current_password}
                              onChange={(e) => setPassword((p) => ({ ...p, current_password: e.target.value }))}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPass((v) => !v)}
                              className="absolute right-2.5 top-2.5 text-[var(--muted-foreground)] hover:text-[var(--on-surface)]"
                            >
                              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </Field>
                        <Field label="New Password" error={errors.new_password}>
                          <Input
                            type="password"
                            placeholder="Min 8 characters"
                            value={password.new_password}
                            onChange={(e) => setPassword((p) => ({ ...p, new_password: e.target.value }))}
                          />
                        </Field>
                        <Field label="Confirm New Password" error={errors.confirm_password}>
                          <Input
                            type="password"
                            placeholder="Repeat new password"
                            value={password.confirm_password}
                            onChange={(e) => setPassword((p) => ({ ...p, confirm_password: e.target.value }))}
                          />
                        </Field>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

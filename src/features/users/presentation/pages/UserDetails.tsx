import React from "react"
import { useNavigate, useParams } from "react-router"
import { ArrowLeft, Mail, MapPin, Briefcase } from "lucide-react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { DataState } from "@/shared/components/custom"
import { useUserDetails } from "../../application/useUserDetails"
import type { UserStats } from "../../domain/users.types"

export function UserDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user, stats, isLoading, error, refetch } = useUserDetails(id)

  const profile = user?.profile ?? null
  const targetCareer = profile?.career_paths?.title ?? "—"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
          <p className="text-[var(--muted-foreground)]">{id}</p>
        </div>
      </div>

      <DataState isLoading={isLoading} error={error} onRetry={refetch} loadingLabel="Loading user...">
        {user && (
          <>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-[var(--primary)] text-white text-lg">
                    {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    <Badge variant={user.is_active ? "success" : "secondary"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-1.5 text-sm text-[var(--muted-foreground)]">
                    <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{user.email}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{targetCareer}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profile?.location ?? "—"}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--muted-foreground)]">Last active</p>
                  <p className="font-medium">{user.last_active_at ?? "—"}</p>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card><CardContent className="p-6 space-y-2 text-sm">
                  <Row label="Name" value={user.name} />
                  <Row label="Email" value={user.email} />
                  <Row label="Role" value={user.role?.name ?? "user"} />
                  <Row label="Education Level" value={profile?.education_level?.education_level ?? "—"} />
                  <Row label="University" value={profile?.university ?? "—"} />
                  <Row label="Major" value={profile?.major ?? "—"} />
                  <Row label="Experience Level" value={profile?.experience_year?.experience_level ?? "—"} />
                  <Row label="Current Status" value={profile?.current_status?.current_status ?? "—"} />
                  <Row label="Location" value={profile?.location ?? "—"} />
                  <Row label="Target Career" value={targetCareer} />
                  <Row label="Headline" value={profile?.headline ?? "—"} />
                  <Row label="Bio" value={profile?.bio ?? "—"} />
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="statistics">
                {stats ? <StatsGrid stats={stats} /> : (
                  <Card><CardContent className="p-6 text-sm text-[var(--muted-foreground)]">No statistics available.</CardContent></Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </DataState>
    </div>
  )
}

function StatsGrid({ stats }: { stats: UserStats }) {
  const counts: { label: string; value: number }[] = [
    { label: "Skills", value: stats.counts.skills },
    { label: "CVs", value: stats.counts.cvs },
    { label: "CV Analyses", value: stats.counts.cvAnalyses },
    { label: "Roadmaps", value: stats.counts.roadmaps },
    { label: "Job Matches", value: stats.counts.jobMatches },
    { label: "Interviews", value: stats.counts.interviews },
    { label: "Cover Letters", value: stats.counts.coverLetters },
    { label: "Chat Sessions", value: stats.counts.chatSessions },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {counts.map(c => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <p className="text-xs text-[var(--muted-foreground)]">{c.label}</p>
              <p className="text-2xl font-bold mt-1">{c.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">AI Usage</h3>
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <Row label="Tokens Used" value={stats.aiUsage.tokensUsed.toLocaleString()} />
            <Row label="Estimated Cost" value={`$${stats.aiUsage.cost.toFixed(2)}`} />
            <Row label="AI Calls" value={String(stats.aiUsage.calls)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-[var(--border)] last:border-0 py-2">
      <span className="text-[var(--muted-foreground)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

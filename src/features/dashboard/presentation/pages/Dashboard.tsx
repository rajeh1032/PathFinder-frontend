import React from "react"
import { useNavigate } from "react-router"
import {
  Users, FileText, CheckCircle, Map, Lightbulb, GraduationCap,
  Briefcase, Heart, Video, BookOpen, Cpu, DollarSign, Plus, TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { DataState } from "@/shared/components/custom"
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid,
} from "recharts"
import { useDashboard } from "../../application/useDashboard"
import type { NamedCount } from "../../domain/dashboard.types"

function formatNumber(value: number): string {
  return value.toLocaleString()
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

export function Dashboard() {
  const navigate = useNavigate()
  const { overview, isLoading, error, refetch } = useDashboard()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-[var(--muted-foreground)]">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <Badge variant="outline" className="h-8 rounded-md px-3 font-normal">Last 30 days</Badge>
      </div>

      <DataState isLoading={isLoading} error={error} onRetry={refetch} loadingLabel="Loading dashboard...">
        {overview && (
          <>
            {/* 12 KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Kpi icon={<Users         className="h-4 w-4" />} label="Total Users"         value={formatNumber(overview.kpis.totalUsers)} />
              <Kpi icon={<FileText      className="h-4 w-4" />} label="Total CVs"           value={formatNumber(overview.kpis.totalCvs)} />
              <Kpi icon={<CheckCircle   className="h-4 w-4" />} label="Total CV Analyses"   value={formatNumber(overview.kpis.totalCvAnalyses)} />
              <Kpi icon={<Map           className="h-4 w-4" />} label="Total Career Paths"  value={formatNumber(overview.kpis.totalCareerPaths)} />
              <Kpi icon={<Lightbulb     className="h-4 w-4" />} label="Total Skills"        value={formatNumber(overview.kpis.totalSkills)} />
              <Kpi icon={<GraduationCap className="h-4 w-4" />} label="Total Courses"       value={formatNumber(overview.kpis.totalCourses)} />
              <Kpi icon={<Briefcase     className="h-4 w-4" />} label="Total Jobs"          value={formatNumber(overview.kpis.totalJobs)} />
              <Kpi icon={<Heart         className="h-4 w-4" />} label="Total Job Matches"   value={formatNumber(overview.kpis.totalJobMatches)} />
              <Kpi icon={<Video         className="h-4 w-4" />} label="Total Interviews"    value={formatNumber(overview.kpis.totalInterviews)} />
              <Kpi icon={<BookOpen      className="h-4 w-4" />} label="Total RAG Documents" value={formatNumber(overview.kpis.totalRagDocuments)} />
              <Kpi icon={<Cpu           className="h-4 w-4" />} label="AI Tokens Used"      value={formatCompact(overview.kpis.aiTokensUsed)} />
              <Kpi icon={<DollarSign    className="h-4 w-4" />} label="Estimated AI Cost"   value={`$${overview.kpis.aiEstimatedCost.toFixed(2)}`} />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button onClick={() => navigate("/career-paths")}><Plus className="w-4 h-4 mr-2" />Add Career Path</Button>
                <Button variant="outline" onClick={() => navigate("/skills")}><Lightbulb className="w-4 h-4 mr-2" />Add Skill</Button>
                <Button variant="outline" onClick={() => navigate("/courses")}><GraduationCap className="w-4 h-4 mr-2" />Add Course</Button>
                <Button variant="outline" onClick={() => navigate("/jobs")}><Briefcase className="w-4 h-4 mr-2" />Add Job</Button>
                <Button variant="outline" onClick={() => navigate("/rag-documents/upload")}><BookOpen className="w-4 h-4 mr-2" />Upload RAG Doc</Button>
              </CardContent>
            </Card>

            {/* Trend charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader><CardTitle>User Growth Trend</CardTitle></CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={overview.trends.userGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }} />
                        <Area type="monotone" dataKey="users" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader><CardTitle>CV Analysis Trend</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={overview.trends.cvAnalyses}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }} />
                        <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-4">
                <CardHeader><CardTitle>Job Match Trend</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={overview.trends.jobMatches}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }} />
                        <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader><CardTitle>AI Usage Trend</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={overview.trends.aiUsage}>
                        <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }} />
                        <Area type="monotone" dataKey="tokens" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-2">tokens</p>
                </CardContent>
              </Card>
            </div>

            {/* Top widgets */}
            <div className="grid gap-4 md:grid-cols-2">
              <RankCard title="Most Selected Career Paths" icon={<TrendingUp className="w-4 h-4" />} rows={overview.topCareerPaths} />
              <RankCard title="Most Requested Skills"      icon={<Lightbulb  className="w-4 h-4" />} rows={overview.topSkills} />
            </div>
          </>
        )}
      </DataState>
    </div>
  )
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <span className="text-[var(--muted-foreground)]">{icon}</span>
      </CardHeader>
      <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
    </Card>
  )
}

function RankCard({ title, icon, rows }: { title: string; icon: React.ReactNode; rows: NamedCount[] }) {
  const max = Math.max(...rows.map(r => r.count), 1)
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base">{icon}{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No data yet.</p>
        ) : rows.map((r, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{r.name}</span>
              <span className="text-[var(--muted-foreground)]">{r.count.toLocaleString()}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
              <div className="h-full bg-[var(--primary)]" style={{ width: `${(r.count / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

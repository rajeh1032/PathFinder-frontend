import React from "react"
import { TrendingUp, Users, Target, Award } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { exportCsv } from "@/shared/lib/csv"
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"

const engagementData = [
  { day: "Mon", sessions: 1200, signups: 80 },
  { day: "Tue", sessions: 1800, signups: 120 },
  { day: "Wed", sessions: 1500, signups: 95 },
  { day: "Thu", sessions: 2100, signups: 140 },
  { day: "Fri", sessions: 2400, signups: 180 },
  { day: "Sat", sessions: 1100, signups: 60 },
  { day: "Sun", sessions: 900, signups: 50 },
]

const careerData = [
  { name: "Frontend", value: 35 },
  { name: "Backend", value: 25 },
  { name: "Data", value: 18 },
  { name: "Design", value: 12 },
  { name: "DevOps", value: 10 },
]

const conversionData = [
  { stage: "Visitors", count: 12500 },
  { stage: "Signups", count: 4200 },
  { stage: "CV Uploaded", count: 2800 },
  { stage: "Matched", count: 1900 },
  { stage: "Applied", count: 920 },
]

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"]

export function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-[var(--muted-foreground)]">Platform-wide engagement and conversion insights.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Last 7 days</Button>
          <Button variant="outline" size="sm">Last 30 days</Button>
          <Button size="sm" onClick={() => { exportCsv("analytics-summary.csv", [{ metric: "users", value: 12450 }, { metric: "cv_analyses", value: 34210 }, { metric: "matches", value: 8920 }]); toast.success("Exported analytics CSV") }}>Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Sessions", value: "48,200", change: "+12.4%", icon: Users },
          { label: "Avg. Session Time", value: "8m 22s", change: "+3.1%", icon: TrendingUp },
          { label: "Career Match Rate", value: "76%", change: "+5.8%", icon: Target },
          { label: "Active Premium", value: "1,240", change: "+18%", icon: Award },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <stat.icon className="h-5 w-5 text-[var(--primary)]" />
                <Badge variant="success">{stat.change}</Badge>
              </div>
              <p className="text-2xl font-bold mt-3">{stat.value}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>User Engagement</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="sessions" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Area type="monotone" dataKey="signups" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Career Path Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={careerData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {careerData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Conversion Funnel</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={conversionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="stage" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

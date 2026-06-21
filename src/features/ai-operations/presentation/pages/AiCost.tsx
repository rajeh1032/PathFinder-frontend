import React from "react"
import { Zap, DollarSign, AlertTriangle, Clock, TrendingUp, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import { Button } from "@/shared/components/ui/button"
import { exportCsv } from "@/shared/lib/csv"
import { toast } from "sonner"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const tokensByDay = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`, tokens: 30000 + Math.round(Math.sin(i / 2) * 12000) + i * 1500,
}))
const featureUsage = [
  { feature: "CV Analysis", tokens: 1240000, cost: 18.6 },
  { feature: "Chat", tokens: 890000, cost: 13.4 },
  { feature: "Cover Letters", tokens: 420000, cost: 6.3 },
  { feature: "Interview Sim", tokens: 380000, cost: 5.7 },
  { feature: "RAG Embeddings", tokens: 310000, cost: 1.2 },
]

export function AiCost() {
  const todayTokens = 184_320
  const monthTokens = 3_240_000
  const monthBudget = 5_000_000
  const monthCost = 45.18
  const failedRequests = 47
  const avgResponse = 1.4
  const mostUsed = featureUsage[0]
  const mostExpensive = [...featureUsage].sort((a, b) => b.cost - a.cost)[0]
  const budgetPct = (monthTokens / monthBudget) * 100
  const overBudget = budgetPct > 100
  const nearLimit = budgetPct >= 80

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Cost & Token Usage</h1>
          <p className="text-[var(--muted-foreground)]">Track Gemini token spend and reliability across features.</p>
        </div>
        <Button variant="outline" onClick={() => { exportCsv("ai-usage.csv", featureUsage); toast.success("Exported AI usage CSV") }}>
          Export CSV
        </Button>
      </div>

      {(nearLimit || overBudget) && (
        <div className={`rounded-md border px-4 py-3 text-sm flex items-center gap-2 ${overBudget ? "bg-red-500/10 border-red-500/40 text-red-700 dark:text-red-300" : "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300"}`}>
          <AlertTriangle className="h-4 w-4" />
          {overBudget
            ? "Monthly token budget exceeded — AI features are throttled until the next cycle."
            : `Approaching monthly budget (${budgetPct.toFixed(0)}% used).`}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Zap className="h-4 w-4" />} label="Tokens today" value={todayTokens.toLocaleString()} />
        <Stat icon={<TrendingUp className="h-4 w-4" />} label="Tokens this month" value={monthTokens.toLocaleString()} sub={`${budgetPct.toFixed(0)}% of ${monthBudget.toLocaleString()} budget`} />
        <Stat icon={<DollarSign className="h-4 w-4" />} label="Estimated cost" value={`$${monthCost.toFixed(2)}`} sub="this month" />
        <Stat icon={<Clock className="h-4 w-4" />} label="Avg response time" value={`${avgResponse}s`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<TrendingUp className="h-4 w-4" />} label="Most used feature" value={mostUsed.feature} sub={`${mostUsed.tokens.toLocaleString()} tokens`} />
        <Stat icon={<DollarSign className="h-4 w-4" />} label="Most expensive feature" value={mostExpensive.feature} sub={`$${mostExpensive.cost.toFixed(2)}`} />
        <Stat icon={<XCircle className="h-4 w-4" />} label="Failed AI requests" value={failedRequests} accent="text-red-600" sub="last 24h" />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-[var(--muted-foreground)]">Monthly budget</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={Math.min(100, budgetPct)} />
            <p className="text-xs text-[var(--muted-foreground)] mt-2">{budgetPct.toFixed(0)}% used {overBudget && <Badge variant="destructive" className="ml-2">Exceeded</Badge>}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Tokens used (last 14 days)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tokensByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="tokens" stroke="var(--primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Cost by feature</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="feature" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: 8 }} />
                  <Bar dataKey="cost" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Stat({ icon, label, value, sub, accent }: { icon?: React.ReactNode; label: string; value: React.ReactNode; sub?: string; accent?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-[var(--muted-foreground)]">{label}</CardTitle>
        {icon && <span className="text-[var(--muted-foreground)]">{icon}</span>}
      </CardHeader>
      <CardContent>
        <div className={`text-xl font-bold ${accent ?? ""}`}>{value}</div>
        {sub && <p className="text-xs text-[var(--muted-foreground)] mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

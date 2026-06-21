import React from "react"
import { useNavigate, useParams } from "react-router"
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"

const mock = {
  id: "CV-2071",
  user: "Ahmed Ali",
  fileName: "ahmed_ali_resume.pdf",
  uploadedAt: "2026-05-30 14:22",
  status: "Completed",
  score: 78,
  strengths: ["Clear project impact statements", "Strong technical stack alignment", "Quantified achievements"],
  weaknesses: ["Missing soft-skill keywords", "Education section too brief", "No portfolio link"],
  suggestions: [
    "Add a 'Leadership' line under recent role.",
    "Include measurable outcomes for the last 2 projects.",
    "Mention React 19 explicitly to match job postings.",
  ],
  matchedJobs: [
    { title: "Senior Frontend Engineer", company: "Acme", match: 92 },
    { title: "Full-Stack Developer", company: "Globex", match: 81 },
    { title: "React Engineer", company: "Initech", match: 76 },
  ],
  extracted: {
    name: "Ahmed Ali",
    email: "ahmed.ali@example.com",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind"],
    experienceYears: 5,
  },
}

export function CvAnalysisDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/cv-analyses")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">CV Analysis {id ?? mock.id}</h1>
            <Badge>{mock.status}</Badge>
          </div>
          <p className="text-[var(--muted-foreground)]">{mock.fileName} • {mock.uploadedAt}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <FileText className="w-5 h-5 text-[var(--primary)]" />
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Candidate</p>
            <p className="font-medium">{mock.user}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[var(--primary)]" />
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Score</p>
            <p className="font-medium">{mock.score}/100</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[var(--primary)]" />
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Top Match</p>
            <p className="font-medium">{mock.matchedJobs[0].title}</p>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="jobs">Matched Jobs</TabsTrigger>
          <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold">Strengths</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {mock.strengths.map((s, i) => <li key={i}>• {s}</li>)}
            </ul>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold">Areas to Improve</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {mock.weaknesses.map((s, i) => <li key={i}>• {s}</li>)}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <Card className="p-5 space-y-3">
            {mock.suggestions.map((s, i) => (
              <div key={i} className="flex gap-3">
                <Sparkles className="w-4 h-4 text-[var(--primary)] mt-0.5 shrink-0" />
                <p className="text-sm">{s}</p>
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-3">
          {mock.matchedJobs.map((j, i) => (
            <Card key={i} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{j.title}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{j.company}</p>
              </div>
              <Badge variant="secondary">{j.match}% match</Badge>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="extracted">
          <Card className="p-5 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Name</span><span>{mock.extracted.name}</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Email</span><span>{mock.extracted.email}</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Experience</span><span>{mock.extracted.experienceYears} years</span></div>
            <div>
              <p className="text-[var(--muted-foreground)] mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {mock.extracted.skills.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

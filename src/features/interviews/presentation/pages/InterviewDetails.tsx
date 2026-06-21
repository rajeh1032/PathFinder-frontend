import React from "react"
import { useNavigate, useParams } from "react-router"
import { ArrowLeft, Video, Clock, User, MessageSquare, Star } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"

const mock = {
  id: "INT-1042",
  user: "Sarah Khan",
  role: "Frontend Engineer",
  status: "Completed",
  startedAt: "2026-05-29 10:14",
  durationMin: 38,
  overallScore: 82,
  scores: { communication: 88, technical: 78, problemSolving: 84, confidence: 80 },
  questions: [
    { q: "Tell me about a challenging React performance issue you solved.", a: "I profiled with React DevTools and memoized expensive subtrees...", score: 84 },
    { q: "Explain the difference between useMemo and useCallback.", a: "useMemo memoizes a value, useCallback memoizes a function reference...", score: 90 },
    { q: "How would you architect a real-time dashboard?", a: "I'd use websockets with a normalized store and selective subscriptions...", score: 76 },
  ],
  feedback: "Strong technical grasp and clear communication. Improve depth on system design tradeoffs.",
}

export function InterviewDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/interview-sessions")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Interview {id ?? mock.id}</h1>
            <Badge>{mock.status}</Badge>
          </div>
          <p className="text-[var(--muted-foreground)]">{mock.role} • {mock.startedAt}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <User className="w-5 h-5 text-[var(--primary)]" />
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Candidate</p>
            <p className="font-medium">{mock.user}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-[var(--primary)]" />
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Duration</p>
            <p className="font-medium">{mock.durationMin} min</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Questions</p>
            <p className="font-medium">{mock.questions.length}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Star className="w-5 h-5 text-[var(--primary)]" />
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Overall Score</p>
            <p className="font-medium">{mock.overallScore}/100</p>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="qa">
        <TabsList>
          <TabsTrigger value="qa">Q&A</TabsTrigger>
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="recording">Recording</TabsTrigger>
        </TabsList>

        <TabsContent value="qa" className="space-y-3">
          {mock.questions.map((item, i) => (
            <Card key={i} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">Q{i + 1}. {item.q}</p>
                <Badge variant="secondary">{item.score}/100</Badge>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">{item.a}</p>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="scores">
          <Card className="p-6 space-y-4">
            {Object.entries(mock.scores).map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                  <span>{v}/100</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                  <div className="h-full bg-[var(--primary)]" style={{ width: `${v}%` }} />
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card className="p-6">
            <p className="text-sm leading-relaxed">{mock.feedback}</p>
          </Card>
        </TabsContent>

        <TabsContent value="recording">
          <Card className="p-10 flex flex-col items-center justify-center text-center text-[var(--muted-foreground)]">
            <Video className="w-10 h-10 mb-3" />
            <p>Recording playback unavailable in this demo.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

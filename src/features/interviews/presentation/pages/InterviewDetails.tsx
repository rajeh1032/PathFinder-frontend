import { useNavigate, useParams } from "react-router"
import { ArrowLeft, Clock, User, MessageSquare, Star, Sparkles, CheckCircle2, SkipForward } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { DataState } from "@/shared/components/custom/DataState"
import { useInterviewDetail } from "../../application/useInterviewDetail"
import type { InterviewStatus, InterviewType } from "../../domain/interviews.types"

const STATUS_LABELS: Record<InterviewStatus, string> = {
  started: "Started",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
}

const TYPE_LABELS: Record<InterviewType, string> = {
  technical: "Technical",
  behavioral: "Behavioral",
  mock_hr: "Mock HR",
}

const statusVariant = (status: InterviewStatus) =>
  status === "completed" ? "success" : status === "cancelled" ? "destructive" : "warning"

const questionStatusVariant = (status: string | null) =>
  status === "passed" ? "success" : status === "skipped" ? "secondary" : status === "needs_improvement" ? "warning" : "outline"

export function InterviewDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { interview, isLoading, error, refetch } = useInterviewDetail(id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/interview-sessions")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Interview Session</h1>
            {interview && <Badge variant={statusVariant(interview.status)}>{STATUS_LABELS[interview.status]}</Badge>}
          </div>
          <p className="text-[var(--muted-foreground)]">
            {interview ? `${TYPE_LABELS[interview.type]} • ${interview.careerPath} • ${interview.startedAt}` : "Loading session details..."}
          </p>
        </div>
      </div>

      <DataState
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        loadingLabel="Loading interview session..."
      >
        {interview && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 flex items-center gap-3">
                <User className="w-5 h-5 text-[var(--primary)]" />
                <div className="min-w-0">
                  <p className="text-xs text-[var(--muted-foreground)]">Candidate</p>
                  <p className="font-medium truncate">{interview.userName}</p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">{interview.userEmail}</p>
                </div>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-[var(--primary)]" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Duration</p>
                  <p className="font-medium">{interview.durationLabel ?? "—"}</p>
                </div>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Questions</p>
                  <p className="font-medium">{interview.totalQuestions}</p>
                </div>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <Star className="w-5 h-5 text-[var(--primary)]" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Overall Score</p>
                  <p className="font-medium">{interview.overallScore === null ? "—" : `${interview.overallScore}/100`}</p>
                </div>
              </Card>
            </div>

            <Tabs defaultValue="qa">
              <TabsList>
                <TabsTrigger value="qa">Q&amp;A</TabsTrigger>
                <TabsTrigger value="insight">AI Insight</TabsTrigger>
              </TabsList>

              <TabsContent value="qa" className="space-y-3">
                {interview.questions.length === 0 ? (
                  <Card className="p-10 text-center text-[var(--muted-foreground)]">
                    <p>No questions recorded for this session.</p>
                  </Card>
                ) : (
                  interview.questions.map((q) => (
                    <Card key={q.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium">Q{q.order}. {q.question}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          {q.status && <Badge variant={questionStatusVariant(q.status)}>{q.status.replace(/_/g, " ")}</Badge>}
                          {q.score !== null && <Badge variant="secondary">{q.score}/100</Badge>}
                        </div>
                      </div>

                      {q.options.length > 0 && (
                        <ul className="space-y-1 text-sm">
                          {q.options.map((option, i) => {
                            const isAnswer = q.userAnswer !== null && option === q.userAnswer
                            return (
                              <li
                                key={i}
                                className={`flex items-center gap-2 ${isAnswer ? "font-medium text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}
                              >
                                {isAnswer ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <span className="h-3.5 w-3.5 shrink-0" />}
                                {option}
                              </li>
                            )
                          })}
                        </ul>
                      )}

                      {q.isSkipped && (
                        <p className="flex items-center gap-1.5 text-sm text-amber-600">
                          <SkipForward className="h-3.5 w-3.5" /> Skipped by candidate
                        </p>
                      )}

                      {q.feedback && (
                        <p className="text-sm text-[var(--muted-foreground)]">{q.feedback}</p>
                      )}

                      {q.aiSuggestion && (
                        <div className="flex gap-2 rounded-lg bg-[var(--muted)] p-3">
                          <Sparkles className="h-4 w-4 text-[var(--primary)] mt-0.5 shrink-0" />
                          <p className="text-sm">{q.aiSuggestion}</p>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="insight">
                <Card className="p-6">
                  {interview.insight ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{interview.insight}</p>
                  ) : (
                    <p className="text-sm text-[var(--muted-foreground)]">No AI insight recorded for this session.</p>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DataState>
    </div>
  )
}

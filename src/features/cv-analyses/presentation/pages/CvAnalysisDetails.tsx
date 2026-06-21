import { useParams, useNavigate } from "react-router"
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, Sparkles, FileSearch } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { DataState } from "@/shared/components/custom"
import { useCvAnalysisDetail } from "../../application/useCvAnalysisDetail"
import type { CvAnalysisStatus } from "../../domain/cv-analyses.types"

const statusVariant = (status: CvAnalysisStatus) =>
  status === "completed" ? "success" : status === "reviewed" ? "secondary" : "destructive"

const statusLabel = (status: CvAnalysisStatus) =>
  status.charAt(0).toUpperCase() + status.slice(1)

export function CvAnalysisDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { analysis, isLoading, error, refetch } = useCvAnalysisDetail(id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/cv-analyses")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">CV Analysis</h1>
            {analysis && <Badge variant={statusVariant(analysis.status)}>{statusLabel(analysis.status)}</Badge>}
          </div>
          <p className="text-[var(--muted-foreground)]">
            {analysis ? `${analysis.fileName} • ${analysis.createdAt}` : "Loading analysis details..."}
          </p>
        </div>
      </div>

      <DataState
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        loadingLabel="Loading CV analysis..."
      >
        {analysis && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 flex items-center gap-3">
                <FileText className="w-5 h-5 text-[var(--primary)]" />
                <div className="min-w-0">
                  <p className="text-xs text-[var(--muted-foreground)]">Candidate</p>
                  <p className="font-medium truncate">{analysis.userName}</p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">{analysis.userEmail}</p>
                </div>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Score</p>
                  <p className="font-medium">{analysis.score}/100</p>
                </div>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <FileSearch className="w-5 h-5 text-[var(--primary)]" />
                <div className="min-w-0">
                  <p className="text-xs text-[var(--muted-foreground)]">Model</p>
                  <p className="font-medium truncate">{analysis.model}</p>
                </div>
              </Card>
            </div>

            <Tabs defaultValue="summary" className="mt-2">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                {analysis.summary && (
                  <Card className="p-5">
                    <h3 className="font-semibold mb-2">Overview</h3>
                    <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">{analysis.summary}</p>
                  </Card>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <h3 className="font-semibold">Strengths</h3>
                    </div>
                    {analysis.strengths.length ? (
                      <ul className="space-y-2 text-sm">
                        {analysis.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-[var(--muted-foreground)]">No strengths recorded.</p>
                    )}
                  </Card>
                  <Card className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <h3 className="font-semibold">Areas to Improve</h3>
                    </div>
                    {analysis.weaknesses.length ? (
                      <ul className="space-y-2 text-sm">
                        {analysis.weaknesses.map((s, i) => <li key={i}>• {s}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-[var(--muted-foreground)]">No weaknesses recorded.</p>
                    )}
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="suggestions">
                <Card className="p-5 space-y-3">
                  {analysis.suggestions.length ? (
                    analysis.suggestions.map((s, i) => (
                      <div key={i} className="flex gap-3">
                        <Sparkles className="w-4 h-4 text-[var(--primary)] mt-0.5 shrink-0" />
                        <p className="text-sm">{s}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[var(--muted-foreground)]">No suggestions recorded.</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="space-y-4">
                <Card className="p-5">
                  <h3 className="font-semibold mb-3">Detected Skills</h3>
                  {analysis.detectedSkills.length ? (
                    <div className="flex flex-wrap gap-2">
                      {analysis.detectedSkills.map((s, i) => (
                        <Badge key={`${s.name}-${i}`} variant="secondary">{s.name}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--muted-foreground)]">No skills detected.</p>
                  )}
                </Card>
                {(analysis.missingSkills.length > 0 || analysis.recommendedRoles.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.missingSkills.length > 0 && (
                      <Card className="p-5">
                        <h3 className="font-semibold mb-3">Missing Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.missingSkills.map((s, i) => (
                            <Badge key={`${s}-${i}`} variant="outline">{s}</Badge>
                          ))}
                        </div>
                      </Card>
                    )}
                    {analysis.recommendedRoles.length > 0 && (
                      <Card className="p-5">
                        <h3 className="font-semibold mb-3">Recommended Roles</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.recommendedRoles.map((s, i) => (
                            <Badge key={`${s}-${i}`} variant="secondary">{s}</Badge>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </DataState>
    </div>
  )
}

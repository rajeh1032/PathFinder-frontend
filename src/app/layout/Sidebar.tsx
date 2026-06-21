import React from "react"
import { NavLink } from "react-router"
import {
  Home, Users, Briefcase, GraduationCap, Map, Lightbulb,
  Video, FileText, Settings, BookOpen, Heart, Brain,
} from "lucide-react"

type Item = { name: string; icon: React.ComponentType<{ className?: string }>; path: string }
type Section = { title: string; items: Item[] }

const sidebarItems: Section[] = [
  {
    title: "Dashboard",
    items: [
      { name: "Overview", icon: Home, path: "/" },
    ],
  },
  {
    title: "Students",
    items: [
      { name: "Users", icon: Users, path: "/users" },
    ],
  },
  {
    title: "Career Management",
    items: [
      { name: "Career Paths", icon: Map, path: "/career-paths" },
      { name: "Skills", icon: Lightbulb, path: "/skills" },
      { name: "Courses", icon: GraduationCap, path: "/courses" },
    ],
  },
  {
    title: "Jobs",
    items: [
      { name: "Jobs", icon: Briefcase, path: "/jobs" },
      { name: "Job Matches", icon: Heart, path: "/job-matches" },
    ],
  },
  {
    title: "AI Features",
    items: [
      { name: "CV Analyses", icon: FileText, path: "/cv-analyses" },
      { name: "Interview Sessions", icon: Video, path: "/interview-sessions" },
      { name: "AI Logs", icon: Brain, path: "/ai-logs" },
    ],
  },
  {
    title: "Knowledge Base",
    items: [
      { name: "RAG Documents", icon: BookOpen, path: "/rag-documents" },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Settings", icon: Settings, path: "/settings" },
    ],
  },
]

export function Sidebar() {
  return (
    <aside className="w-[260px] bg-[var(--surface)] border-r border-[var(--border)] h-screen overflow-y-auto flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white font-bold">P</div>
        <div className="leading-tight">
          <p className="font-bold text-[var(--on-surface)]">PathFinder AI</p>
          <p className="text-xs text-[var(--muted-foreground)]">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 px-3 pb-6 space-y-5">
        {sidebarItems.map((section, idx) => (
          <div key={idx}>
            <h4 className="px-3 mb-1.5 text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              {section.title}
            </h4>
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "text-[var(--on-surface-variant)] hover:bg-[var(--muted)] hover:text-[var(--on-surface)]"
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}

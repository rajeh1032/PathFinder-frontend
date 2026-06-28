import React from "react"
import { useNavigate } from "react-router"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/components/ui/utils"

const welcomeAudioSrc = "/welcome/pathfinder-welcome.ogg?v=20260628-0559"
const fallbackDurationMs = 5194

const welcomeCues = [
  { startsAt: 0, name: "Ahmed Wageh", imageSrc: "/welcome/wageh.jpg", imageAlt: "Ahmed Wageh" },
  { startsAt: 0.80, name: "Ahmed Rajeh", imageSrc: "/welcome/98366239.jpg", imageAlt: "Ahmed Rajeh" },
  { startsAt: 1.40, name: "Alaa", imageSrc: "/welcome/208084820.jpg", imageAlt: "Alaa" },
  { startsAt: 2, name: "Ayat Essam", imageSrc: "/welcome/237897890.jpg", imageAlt: "Ayat Essam" },
  { startsAt: 2.60, name: "George Adly Kamel", imageSrc: "/welcome/97970356.jpg", imageAlt: "George Adly Kamel" },
]

function getActiveCueIndex(currentTimeSeconds: number) {
  for (let index = welcomeCues.length - 1; index >= 0; index -= 1) {
    if (currentTimeSeconds >= welcomeCues[index].startsAt) return index
  }
  return 0
}

export function WelcomeSplash() {
  const navigate = useNavigate()
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const startedAtRef = React.useRef<number>(performance.now())
  const finishedRef = React.useRef(false)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [progress, setProgress] = React.useState(0)

  const activeGuest = welcomeCues[activeIndex]

  const finishSplash = React.useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    audioRef.current?.pause()
    navigate("/", { replace: true })
  }, [navigate])

  React.useEffect(() => {
    const audio = audioRef.current
    startedAtRef.current = performance.now()

    if (audio) {
      audio.currentTime = 0
      void audio.play().catch(() => {})
    }

    const syncToAudio = () => {
      const currentAudio = audioRef.current
      const hasAudioDuration =
        currentAudio &&
        Number.isFinite(currentAudio.duration) &&
        currentAudio.duration > 0
      const fallbackElapsedMs = performance.now() - startedAtRef.current
      const canReadAudioClock = Boolean(currentAudio && !currentAudio.paused && currentAudio.currentTime > 0.01)
      const durationMs = hasAudioDuration && currentAudio ? currentAudio.duration * 1000 : fallbackDurationMs
      const elapsedMs = canReadAudioClock && currentAudio ? currentAudio.currentTime * 1000 : fallbackElapsedMs
      const elapsedSeconds = elapsedMs / 1000
      const nextProgress = Math.min((elapsedMs / durationMs) * 100, 100)
      const nextIndex = getActiveCueIndex(elapsedSeconds)

      setProgress(nextProgress)
      setActiveIndex(nextIndex)

      if (!canReadAudioClock && nextProgress >= 100) finishSplash()
    }

    const timerId = window.setInterval(syncToAudio, 50)
    syncToAudio()

    return () => window.clearInterval(timerId)
  }, [finishSplash])

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex min-h-[42vh] items-center justify-center bg-[var(--surface-variant)] px-6 py-10 lg:min-h-screen">
          <div className="relative flex aspect-square w-full max-w-[360px] items-center justify-center sm:max-w-[420px]">
            <div className="absolute inset-6 rounded-[2rem] border border-[var(--border)] bg-[var(--card)] shadow-xl" />
            <img
              key={activeGuest.imageSrc}
              src={activeGuest.imageSrc}
              alt={activeGuest.imageAlt}
              className="relative h-[min(72vw,320px)] w-[min(72vw,320px)] rounded-[2rem] border border-white/80 object-cover shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 sm:h-[340px] sm:w-[340px]"
            />
          </div>
        </section>

        <section className="flex items-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-xl space-y-10">
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/20">
                P
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                PathFinder AI
              </p>
              <div className="min-h-[104px]">
                <h1
                  key={activeGuest.name}
                  className="text-4xl font-bold leading-tight animate-in fade-in slide-in-from-bottom-3 duration-500 sm:text-5xl"
                >
                  {activeGuest.name}
                </h1>
                <p className="mt-3 text-lg text-[var(--muted-foreground)]">
                  Welcome to the admin console.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {welcomeCues.map((guest, index) => (
                  <div
                    key={guest.imageSrc}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 transition-all",
                      index === activeIndex && "border-[var(--primary)] shadow-md shadow-[var(--primary)]/10",
                    )}
                  >
                    <img src={guest.imageSrc} alt="" className="h-10 w-10 rounded-md object-cover" />
                    <span className="min-w-0 truncate text-xs font-medium">{guest.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" variant="ghost" onClick={finishSplash}>
                Skip
              </Button>
            </div>

            <audio ref={audioRef} src={welcomeAudioSrc} preload="auto" autoPlay onEnded={finishSplash} />
          </div>
        </section>
      </div>
    </main>
  )
}

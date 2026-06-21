import { useEffect, useState } from "react"
import { ImageIcon } from "lucide-react"
import { cn } from "@/shared/components/ui/utils"

type Props = {
  src?: string | null
  alt?: string
  /** Tailwind classes for the wrapper (control size, radius, etc.). */
  className?: string
}

/**
 * Renders a course cover/thumbnail image with a graceful placeholder when the
 * URL is empty or fails to load. The backend exposes this as `thumbnailUrl`.
 */
export function CourseImage({ src, alt, className }: Props) {
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    setErrored(false)
  }, [src])

  const url = src?.trim()
  const showImage = Boolean(url) && !errored

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-[var(--muted)]",
        className,
      )}
    >
      {showImage ? (
        <img
          src={url}
          alt={alt ?? "Course thumbnail"}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setErrored(true)}
        />
      ) : (
        <ImageIcon className="h-5 w-5 text-[var(--muted-foreground)]" />
      )}
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

/** Plays a recording kept in the local database. */
export function AudioPlayer({ blob }: { blob: Blob }) {
  const { t } = useTranslation()
  const audioRef = useRef<HTMLAudioElement>(null)

  // A blob needs a temporary URL to play. It is created here and released
  // when the player goes away, so recordings don't pile up in memory.
  useEffect(() => {
    const url = URL.createObjectURL(blob)
    if (audioRef.current) audioRef.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [blob])

  return (
    <audio
      ref={audioRef}
      controls
      preload="metadata"
      aria-label={t('notes.playRecording')}
      className="h-10 w-full max-w-sm"
    />
  )
}

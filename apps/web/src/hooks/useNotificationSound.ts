import { useEffect, useRef } from 'react'

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/assets/sound.wav')
    audioRef.current.preload = 'auto'

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((error) => {
        console.warn('Could not play notification sound:', error)
      })
    }
  }

  return { playNotificationSound }
}

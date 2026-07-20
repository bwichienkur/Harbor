import { useEffect } from 'react'
import { ambientSounds } from '../data/sounds'
import { playAmbient, setAmbientVolume, stopAmbient } from '../lib/audio'
import { useAppStore } from '../store/useAppStore'

export function useAmbientSound() {
  const activeSoundId = useAppStore((s) => s.activeSoundId)
  const soundVolume = useAppStore((s) => s.soundVolume)

  useEffect(() => {
    const sound = ambientSounds.find((s) => s.id === activeSoundId) ?? null
    void playAmbient(sound, soundVolume)
    return () => stopAmbient()
  }, [activeSoundId])

  useEffect(() => {
    setAmbientVolume(soundVolume)
  }, [soundVolume])
}

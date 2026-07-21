import { useEffect } from 'react'
import { stopAmbient } from '../lib/audio'
import { stopAllAmbientLayers, syncAmbientLayers } from '../lib/audioLayers'
import { useAppStore } from '../store/useAppStore'

export function useAmbientSound() {
  const soundLayers = useAppStore((s) => s.soundLayers)

  useEffect(() => {
    // Legacy single-bus ambient is replaced by layered playback.
    stopAmbient()
    void syncAmbientLayers(soundLayers)
    return () => stopAllAmbientLayers()
  }, [soundLayers])
}

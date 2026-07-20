import { useCallback, useEffect, useState } from 'react'

type FullscreenElement = Element & {
  webkitRequestFullscreen?: () => Promise<void> | void
  webkitRequestFullScreen?: () => Promise<void> | void
}

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
  webkitCancelFullScreen?: () => Promise<void> | void
}

function getFullscreenElement() {
  const doc = document as FullscreenDocument
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null
}

async function requestFullscreen(el: Element) {
  const target = el as FullscreenElement
  if (target.requestFullscreen) {
    await target.requestFullscreen()
    return
  }
  if (target.webkitRequestFullscreen) {
    await target.webkitRequestFullscreen()
    return
  }
  if (target.webkitRequestFullScreen) {
    await target.webkitRequestFullScreen()
  }
}

async function exitFullscreen() {
  const doc = document as FullscreenDocument
  if (document.exitFullscreen) {
    await document.exitFullscreen()
    return
  }
  if (doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen()
    return
  }
  if (doc.webkitCancelFullScreen) {
    await doc.webkitCancelFullScreen()
  }
}

export function useFullscreen(targetSelector = '.app-shell') {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(getFullscreenElement()))
    sync()
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync as EventListener)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync as EventListener)
    }
  }, [])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (getFullscreenElement()) {
        await exitFullscreen()
        return
      }
      const target =
        document.querySelector(targetSelector) ?? document.documentElement
      await requestFullscreen(target)
    } catch {
      // Browser may block without a user gesture or deny the request.
    }
  }, [targetSelector])

  return { isFullscreen, toggleFullscreen }
}

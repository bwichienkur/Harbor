import type {
  LayoutPlacement,
  TaskDockLayout,
  TimerLayout,
  WidgetLayoutTemplate,
} from '../types'

export type { WidgetLayoutTemplate }

export interface ResolvedWidgetLayouts {
  timer: TimerLayout
  clock: TimerLayout
  tasks: TaskDockLayout
}

function resolveX(
  anchor: LayoutPlacement['anchorX'],
  width: number,
  vw: number,
  offset = 0,
) {
  const margin = 16
  if (anchor === 'left') return Math.max(margin, margin + offset)
  if (anchor === 'right') return Math.max(margin, vw - width - margin + offset)
  return Math.max(margin, (vw - width) / 2 + offset)
}

function resolveY(
  anchor: LayoutPlacement['anchorY'],
  height: number,
  vh: number,
  offset = 0,
) {
  const top = 72
  const bottom = 88
  if (anchor === 'top') return Math.max(top, top + offset)
  if (anchor === 'bottom') return Math.max(top, vh - height - bottom + offset)
  return Math.max(top, (vh - height) / 2 + offset)
}

function resolveBox(placement: LayoutPlacement, vw: number, vh: number, fallbackHeight: number) {
  const width = Math.min(placement.width, vw - 24)
  const height = Math.min(placement.height ?? fallbackHeight, vh - 100)
  return {
    x: resolveX(placement.anchorX, width, vw, placement.offsetX ?? 0),
    y: resolveY(placement.anchorY, height, vh, placement.offsetY ?? 0),
    width,
    height,
  }
}

export function resolveLayoutTemplate(
  template: WidgetLayoutTemplate,
  vw = typeof window !== 'undefined' ? window.innerWidth : 1280,
  vh = typeof window !== 'undefined' ? window.innerHeight : 800,
): ResolvedWidgetLayouts {
  const timerBox = resolveBox(template.timer, vw, vh, template.timer.width * 0.72)
  const clockBox = resolveBox(template.clock, vw, vh, template.clock.width * 0.55)
  const tasksBox = resolveBox(template.tasks, vw, vh, template.tasks.height)

  return {
    timer: { x: timerBox.x, y: timerBox.y, width: timerBox.width },
    clock: { x: clockBox.x, y: clockBox.y, width: clockBox.width },
    tasks: {
      x: tasksBox.x,
      y: tasksBox.y,
      width: tasksBox.width,
      height: template.tasks.height,
    },
  }
}

export function captureLayoutAsRelative(
  layouts: ResolvedWidgetLayouts,
  meta: { id: string; name: string; description?: string },
  vw = window.innerWidth,
  vh = window.innerHeight,
): WidgetLayoutTemplate {
  const toRelative = (box: {
    x: number
    y: number
    width: number
    height?: number
  }): LayoutPlacement => {
    const midX = box.x + box.width / 2
    const midY = box.y + (box.height ?? box.width * 0.5) / 2
    const anchorX: LayoutPlacement['anchorX'] =
      midX < vw * 0.33 ? 'left' : midX > vw * 0.66 ? 'right' : 'center'
    const anchorY: LayoutPlacement['anchorY'] =
      midY < vh * 0.33 ? 'top' : midY > vh * 0.66 ? 'bottom' : 'center'
    const idealX = resolveX(anchorX, box.width, vw, 0)
    const idealY = resolveY(anchorY, box.height ?? box.width * 0.5, vh, 0)
    return {
      anchorX,
      anchorY,
      offsetX: Math.round(box.x - idealX),
      offsetY: Math.round(box.y - idealY),
      width: Math.round(box.width),
      height: box.height != null ? Math.round(box.height) : undefined,
    }
  }

  const timer = toRelative(layouts.timer)
  const clock = toRelative(layouts.clock)
  const tasksRel = toRelative(layouts.tasks)

  return {
    id: meta.id,
    name: meta.name,
    description: meta.description ?? 'Saved from your current widget positions',
    builtin: false,
    timer,
    clock,
    tasks: {
      ...tasksRel,
      height: layouts.tasks.height,
    },
  }
}

export const builtinLayoutTemplates: WidgetLayoutTemplate[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Timer center · clock top-right · tasks bottom-left',
    builtin: true,
    timer: { anchorX: 'center', anchorY: 'center', width: 420, offsetY: -20 },
    clock: { anchorX: 'right', anchorY: 'top', width: 220 },
    tasks: { anchorX: 'left', anchorY: 'bottom', width: 280, height: 220 },
  },
  {
    id: 'zen',
    name: 'Zen',
    description: 'Large centered timer · quiet clock · tasks tucked away',
    builtin: true,
    timer: { anchorX: 'center', anchorY: 'center', width: 520, offsetY: -10 },
    clock: { anchorX: 'center', anchorY: 'top', width: 200, offsetY: 8 },
    tasks: { anchorX: 'left', anchorY: 'bottom', width: 240, height: 180, offsetY: -8 },
  },
  {
    id: 'wide-desk',
    name: 'Wide Desk',
    description: 'Timer left · clock top-right · tasks bottom-right',
    builtin: true,
    timer: { anchorX: 'left', anchorY: 'center', width: 400, offsetX: 24, offsetY: -24 },
    clock: { anchorX: 'right', anchorY: 'top', width: 200 },
    tasks: { anchorX: 'right', anchorY: 'bottom', width: 300, height: 240 },
  },
  {
    id: 'study-stack',
    name: 'Study Stack',
    description: 'Clock top · timer mid · tasks under the timer',
    builtin: true,
    timer: { anchorX: 'center', anchorY: 'center', width: 400, offsetY: -40 },
    clock: { anchorX: 'center', anchorY: 'top', width: 240, offsetY: 12 },
    tasks: { anchorX: 'center', anchorY: 'bottom', width: 320, height: 200, offsetY: -12 },
  },
  {
    id: 'corners',
    name: 'Corners',
    description: 'Timer center · clock top-left · tasks bottom-right',
    builtin: true,
    timer: { anchorX: 'center', anchorY: 'center', width: 420 },
    clock: { anchorX: 'left', anchorY: 'top', width: 200 },
    tasks: { anchorX: 'right', anchorY: 'bottom', width: 280, height: 220 },
  },
]

export function allLayoutTemplates(custom: WidgetLayoutTemplate[] = []) {
  return [...builtinLayoutTemplates, ...custom]
}

export function findLayoutTemplate(id: string, custom: WidgetLayoutTemplate[] = []) {
  return allLayoutTemplates(custom).find((t) => t.id === id)
}

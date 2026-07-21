import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { fontStackFor, preloadGoogleFonts } from '../data/fonts'

export type SelectOption<T extends string = string> = {
  value: T
  label: string
  /** When set, option label (and trigger when selected) render in this family. */
  fontFamily?: string
  disabled?: boolean
}

type SelectMenuProps<T extends string = string> = {
  id?: string
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  /** Fires when hovering an option (null when leaving the list). Useful for live previews. */
  onHoverOption?: (value: T | null) => void
  placeholder?: string
  /** Preload Google Fonts for options that declare fontFamily when the menu opens. */
  preloadFonts?: boolean
  'aria-label'?: string
}

type MenuCoords = {
  top: number
  left: number
  width: number
  maxHeight: number
  openUp: boolean
}

export function SelectMenu<T extends string>({
  id,
  value,
  options,
  onChange,
  onHoverOption,
  placeholder = 'Select…',
  preloadFonts = false,
  'aria-label': ariaLabel,
}: SelectMenuProps<T>) {
  const autoId = useId()
  const listId = `${id ?? autoId}-list`
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [coords, setCoords] = useState<MenuCoords | null>(null)

  const selected = options.find((o) => o.value === value)
  const selectedLabel = selected?.label ?? placeholder
  const selectedFont = selected?.fontFamily

  const updateCoords = () => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const gap = 6
    const spaceBelow = window.innerHeight - rect.bottom - gap
    const spaceAbove = rect.top - gap
    const preferred = Math.min(280, options.length * 44 + 16)
    const openUp = spaceBelow < preferred && spaceAbove > spaceBelow
    const maxHeight = Math.max(120, Math.min(preferred, openUp ? spaceAbove : spaceBelow))
    setCoords({
      top: openUp ? rect.top - gap : rect.bottom + gap,
      left: rect.left,
      width: rect.width,
      maxHeight,
      openUp,
    })
  }

  useLayoutEffect(() => {
    if (!open) return
    updateCoords()
    const onReposition = () => updateCoords()
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open, options.length])

  useEffect(() => {
    if (!open || !preloadFonts) return
    const families = options
      .map((o) => o.fontFamily)
      .filter((f): f is string => Boolean(f && f !== 'custom'))
    preloadGoogleFonts(families)
  }, [open, preloadFonts, options])

  useEffect(() => {
    if (!open) {
      onHoverOption?.(null)
      return
    }
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || listRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onHoverOption])

  useEffect(() => {
    if (!open) return
    const idx = Math.max(
      0,
      options.findIndex((o) => o.value === value && !o.disabled),
    )
    setActiveIndex(idx)
  }, [open, options, value])

  const moveActive = (delta: number) => {
    if (!options.length) return
    let next = activeIndex
    for (let i = 0; i < options.length; i++) {
      next = (next + delta + options.length) % options.length
      if (!options[next]?.disabled) break
    }
    setActiveIndex(next)
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${next}"]`)
    node?.scrollIntoView({ block: 'nearest' })
  }

  const commit = (opt: SelectOption<T>) => {
    if (opt.disabled) return
    onChange(opt.value)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      if (e.key === 'ArrowDown') moveActive(1)
      if ((e.key === 'Enter' || e.key === ' ') && activeIndex >= 0) {
        const opt = options[activeIndex]
        if (opt) commit(opt)
      }
    } else if (e.key === 'ArrowUp' && open) {
      e.preventDefault()
      moveActive(-1)
    }
  }

  const onListKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      moveActive(1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      moveActive(-1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const opt = options[activeIndex]
      if (opt) commit(opt)
    } else if (e.key === 'Home') {
      e.preventDefault()
      const first = options.findIndex((o) => !o.disabled)
      if (first >= 0) setActiveIndex(first)
    } else if (e.key === 'End') {
      e.preventDefault()
      for (let i = options.length - 1; i >= 0; i--) {
        if (!options[i]?.disabled) {
          setActiveIndex(i)
          break
        }
      }
    }
  }

  const triggerStyle: CSSProperties | undefined = selectedFont
    ? { fontFamily: fontStackFor(selectedFont) }
    : undefined

  const menu = createPortal(
    <AnimatePresence>
      {open && coords ? (
        <motion.div
          key="select-menu-list"
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-opt-${options[activeIndex]?.value}` : undefined
          }
          className="select-menu-list"
          style={{
            position: 'fixed',
            top: coords.openUp ? undefined : coords.top,
            bottom: coords.openUp ? window.innerHeight - coords.top : undefined,
            left: coords.left,
            width: coords.width,
            maxHeight: coords.maxHeight,
            zIndex: 80,
          }}
          initial={{ opacity: 0, y: coords.openUp ? 6 : -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: coords.openUp ? 6 : -6, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          onKeyDown={onListKeyDown}
          onMouseLeave={() => onHoverOption?.(null)}
        >
          {options.map((opt, index) => {
            const isSelected = opt.value === value
            const isActive = index === activeIndex
            const style: CSSProperties | undefined = opt.fontFamily
              ? { fontFamily: fontStackFor(opt.fontFamily) }
              : undefined
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                id={`${listId}-opt-${opt.value}`}
                data-index={index}
                aria-selected={isSelected}
                disabled={opt.disabled}
                className={`select-menu-option${isSelected ? ' selected' : ''}${isActive ? ' active' : ''}`}
                style={style}
                onMouseEnter={() => {
                  setActiveIndex(index)
                  onHoverOption?.(opt.value)
                }}
                onClick={() => commit(opt)}
              >
                <span className="select-menu-option-label">{opt.label}</span>
                {isSelected && <Check size={16} strokeWidth={2.4} aria-hidden />}
              </button>
            )
          })}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )

  return (
    <div className="select-menu">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={`select-menu-trigger${open ? ' open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        style={triggerStyle}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="select-menu-value">{selectedLabel}</span>
        <ChevronDown
          className={`select-menu-chevron${open ? ' open' : ''}`}
          size={18}
          strokeWidth={2.2}
          aria-hidden
        />
      </button>
      {menu}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'

export default function AnimatedNumber({ value, digits = 0, suffix = '' }: { value: number; digits?: number; suffix?: string }) {
  const previous = useRef(value)
  const [shown, setShown] = useState(value)
  const [pulse, setPulse] = useState(0)
  useEffect(() => {
    const from = previous.current
    const started = performance.now()
    let frame = 0
    let active = true
    const low = Math.min(from, value)
    const high = Math.max(from, value)
    const tick = (now: number) => {
      if (!active) return
      const progress = Math.max(0, Math.min(1, (now - started) / 620))
      const eased = 1 - (1 - progress) ** 3
      setShown(Math.max(low, Math.min(high, from + (value - from) * eased)))
      if (progress < 1) frame = requestAnimationFrame(tick)
      else { previous.current = value; setPulse(x => x + 1) }
    }
    frame = requestAnimationFrame(tick)
    return () => { active = false; cancelAnimationFrame(frame); previous.current = shown }
    // shown intentionally excluded: it is only captured as the next animation's origin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return <span key={pulse} className="animated-number">{shown.toLocaleString('ja-JP', { minimumFractionDigits: digits, maximumFractionDigits: digits })}{suffix}</span>
}

'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
}: {
  children: ReactNode
  direction?: 'up' | 'left' | 'right'
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('sr-visible')
        } else {
          el.classList.remove('sr-visible')
        }
      },
      { threshold: 0.12 }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`sr-base sr-${direction} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

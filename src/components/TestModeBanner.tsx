'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface TestModeBannerProps {
  persistKey?: string
}

export default function TestModeBanner({
  persistKey = 'test_mode_banner_closed_session',
}: TestModeBannerProps) {
  const [visible, setVisible] = useState<boolean | null>(null)
  const message = (
    <>
      You’re in test mode (no real value).
      {' '}
      <Link
        href="https://faucet.circle.com/"
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-primary underline-offset-4 hover:underline"
      >
        Get free USDC
      </Link>
      {' '}
      on Polygon Amoy.
    </>
  )

  useEffect(() => {
    try {
      const closed = sessionStorage.getItem(persistKey)
      setVisible(closed !== '1')
    }
    catch {
      setVisible(true)
    }
  }, [persistKey])

  if (visible !== true) {
    return null
  }

  return (
    <div className={`
      fixed right-4 bottom-4 z-60 max-w-xs rounded-xl border border-border/60 bg-background text-foreground shadow-xl
    `}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed">
            <span className="font-semibold text-destructive">Heads up:</span>
            {' '}
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setVisible(false)
            try {
              sessionStorage.setItem(persistKey, '1')
            }
            catch {
              //
            }
          }}
          className="ml-2 inline-flex size-7 shrink-0 items-center justify-center text-lg text-foreground"
          aria-label="Dismiss test mode banner"
        >
          &times;
        </button>
      </div>
    </div>
  )
}

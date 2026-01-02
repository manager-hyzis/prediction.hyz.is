import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatTimeAgo } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface ProfileLinkProps {
  user: {
    address: string
    proxy_wallet_address?: string | null
    image: string
    username: string
  }
  position?: number
  date?: string
  children?: ReactNode
  trailing?: ReactNode
  usernameMaxWidthClassName?: string
  usernameClassName?: string
}

export default function ProfileLink({
  user,
  position,
  date,
  children,
  trailing,
  usernameMaxWidthClassName,
  usernameClassName,
}: ProfileLinkProps) {
  const medalColor = {
    1: '#FFD700',
    2: '#C0C0C0',
    3: '#CD7F32',
  }[position ?? 0] ?? '#000000'

  const medalTextColor = medalColor === '#000000' ? '#ffffff' : '#1a1a1a'
  const profileHref = `/@${user.username}` as any

  return (
    <div
      className={cn(
        'flex gap-3 py-2',
        children ? 'items-start' : 'items-center',
      )}
    >
      <Link href={profileHref} className="relative shrink-0">
        <Image
          src={user.image}
          alt={user.username}
          width={32}
          height={32}
          className="rounded-full"
        />
        {position && (
          <Badge
            variant="secondary"
            style={{ backgroundColor: medalColor, color: medalTextColor }}
            className="absolute top-0 -right-2 size-5 rounded-full px-1 font-mono text-muted-foreground tabular-nums"
          >
            {position}
          </Badge>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'flex min-w-0 items-center gap-1',
              usernameMaxWidthClassName ?? 'max-w-32 lg:max-w-64',
            )}
          >
            <Link
              href={profileHref}
              className={cn('truncate text-sm font-medium', usernameClassName)}
            >
              {user.username}
            </Link>
            {date && (
              <span className="text-xs whitespace-nowrap text-muted-foreground">
                {formatTimeAgo(date)}
              </span>
            )}
          </div>
          {children}
        </div>
        {trailing
          ? (
              <div className="ml-2 flex shrink-0 items-center text-right">
                {trailing}
              </div>
            )
          : null}
      </div>
    </div>
  )
}

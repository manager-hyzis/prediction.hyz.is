import type { UserOpenOrder } from '@/types'
import { useInfiniteQuery } from '@tanstack/react-query'

interface FetchUserOpenOrdersParams {
  pageParam: number
  eventSlug: string
  conditionId: string
  signal?: AbortSignal
}

interface UseUserOpenOrdersArgs {
  userId?: string | null
  eventSlug?: string
  conditionId?: string
  enabled?: boolean
}

export function buildUserOpenOrdersQueryKey(userId?: string | null, eventSlug?: string, conditionId?: string) {
  return ['user-open-orders', userId, eventSlug, conditionId] as const
}

export function useUserOpenOrdersQuery({
  userId,
  eventSlug,
  conditionId,
  enabled = true,
}: UseUserOpenOrdersArgs) {
  return useInfiniteQuery({
    queryKey: buildUserOpenOrdersQueryKey(userId, eventSlug, conditionId),
    queryFn: ({ pageParam = 0, signal }) =>
      fetchUserOpenOrders({
        pageParam,
        eventSlug: eventSlug ?? '',
        conditionId: conditionId ?? '',
        signal,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 50) {
        return allPages.reduce((total, page) => total + page.length, 0)
      }
      return undefined
    },
    enabled: Boolean(enabled && userId && eventSlug && conditionId),
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export async function fetchUserOpenOrders({
  pageParam,
  eventSlug,
  conditionId,
  signal,
}: FetchUserOpenOrdersParams): Promise<UserOpenOrder[]> {
  const params = new URLSearchParams({
    limit: '50',
    offset: pageParam.toString(),
  })

  if (conditionId) {
    params.set('conditionId', conditionId)
  }

  const response = await fetch(`/api/events/${encodeURIComponent(eventSlug)}/open-orders?${params}`, {
    signal,
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch open orders')
  }

  const payload = await response.json()
  return payload.data ?? []
}

import { getR2ImageUrl } from '@/lib/r2'
import 'server-only'

export function getImageUrl(iconPath: string | null): string {
  return getR2ImageUrl(iconPath)
}

export { getR2ImageUrl }

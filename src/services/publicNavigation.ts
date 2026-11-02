import { slugify } from '../utils/slugify'

export interface PublicNavItem {
  id: string
  label: string
  slug?: string
}

export function publicItemHref(groupId: string, item: PublicNavItem): string | null {
  const slug = encodeURIComponent(item.slug || slugify(item.label))
  if (groupId === 'by-skill') return `/skills/${slug}`
  if (groupId === 'by-field') return `/fields/${slug}`
  if (groupId === 'by-company') return `/companies/${slug}/jobs`
  return null
}

function readItems(body: unknown): unknown[] {
  if (Array.isArray(body)) return body
  if (body && typeof body === 'object') {
    if ('data' in body) return readItems(body.data)
    if ('content' in body) return readItems(body.content)
  }
  throw new Error('Dữ liệu danh sách không hợp lệ.')
}

export async function fetchPublicNavigation(endpoint: string, signal: AbortSignal): Promise<PublicNavItem[]> {
  const result = new Map<string, PublicNavItem>()
  for (let page = 0; ; page++) {
  // Vite bỏ prefix /api và chuyển tới localhost:8080/public/...
  const response = await fetch(`/api/public/${endpoint}?page=${page}&size=100`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'omit',
    signal,
  })
  if (!response.ok) throw new Error(`Không thể tải danh sách (HTTP ${response.status}).`)
  const raw: unknown = await response.json()
  const body = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
  const items = readItems(body).map((item, index) => {
    if (typeof item === 'string') return { id: String(index), label: item }
    if (!item || typeof item !== 'object') throw new Error('Item không hợp lệ.')
    const record = item as Record<string, unknown>
    const label = record.name ?? record.domainName ?? record.skillName ?? record.companyName
    if (typeof label !== 'string' || !label.trim()) throw new Error('Item thiếu tên hiển thị.')
    return { id: String(record.id ?? index), label: label.trim(), slug: typeof record.slug === 'string' ? record.slug : undefined }
  })
  const previousSize = result.size
  items.forEach((item) => result.set(item.id, item))
  if (!body || typeof body !== 'object' || Array.isArray(body) || !('content' in body)) break
  const metadata = body as Record<string, unknown>
  if (metadata.last === true || metadata.isLast === true || (typeof metadata.totalPages === 'number' && page + 1 >= metadata.totalPages)) break
  if (!items.length || previousSize === result.size) break
  if (typeof metadata.totalPages !== 'number' && metadata.last !== false && metadata.isLast !== false) break
  }
  return [...result.values()]
}

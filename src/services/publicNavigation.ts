export interface PublicNavItem {
  id: string
  label: string
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
  // Vite bỏ prefix /api và chuyển tới localhost:8080/public/...
  const response = await fetch(`/api/public/${endpoint}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'omit',
    signal,
  })
  if (!response.ok) throw new Error(`Không thể tải danh sách (HTTP ${response.status}).`)
  return readItems(await response.json()).map((item, index) => {
    if (typeof item === 'string') return { id: String(index), label: item }
    if (!item || typeof item !== 'object') throw new Error('Item không hợp lệ.')
    const record = item as Record<string, unknown>
    const label = record.name ?? record.domainName ?? record.skillName ?? record.companyName
    if (typeof label !== 'string' || !label.trim()) throw new Error('Item thiếu tên hiển thị.')
    return { id: String(record.id ?? index), label: label.trim() }
  })
}

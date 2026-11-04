export interface AdminDomain {
  id: number
  name: string
  slug: string
}

export interface AdminDomainPage {
  content: AdminDomain[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export async function mutateAdminDomain(token: string, method: 'POST' | 'PUT' | 'DELETE', id?: number, payload?: Omit<AdminDomain, 'id'>): Promise<void> {
  const response = await fetch(`/api/admin/domains${id === undefined ? '' : `/${id}`}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', ...(payload ? { 'Content-Type': 'application/json' } : {}) },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) {
    const text = await response.text()
    let message = `Không thể ${method === 'DELETE' ? 'xóa' : 'lưu'} chuyên môn (HTTP ${response.status}).`
    try {
      const body: unknown = JSON.parse(text)
      if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') message = body.message
    } catch { if (text && !text.trimStart().startsWith('<')) message = text.slice(0, 300) }
    throw new Error(message)
  }
}

export async function fetchAdminDomains(page: number, size: number, signal: AbortSignal): Promise<AdminDomainPage> {
    const response = await fetch(`/api/public/domains?page=${page}&size=${size}`, { headers: { Accept: 'application/json' }, signal })
    if (!response.ok) throw new Error(`Không thể tải chuyên môn (HTTP ${response.status}).`)
    const raw: unknown = await response.json()
    const body = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
    const meta = body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : null
    const items = meta && Array.isArray(meta.content) ? meta.content : null
    if (!items) throw new Error('Danh sách chuyên môn không hợp lệ.')
    const content = items.map((value: unknown): AdminDomain => {
      if (!value || typeof value !== 'object') throw new Error('Chuyên môn không hợp lệ.')
      const item = value as Record<string, unknown>
      const id = Number(item.id)
      if (!Number.isInteger(id) || id <= 0 || typeof item.name !== 'string') throw new Error('Chuyên môn thiếu ID hoặc tên.')
      return { id, name: item.name, slug: typeof item.slug === 'string' ? item.slug : '' }
    })
    return { content, page: Number(meta!.page ?? page), size: Number(meta!.size ?? size), totalElements: Number(meta!.totalElements ?? 0), totalPages: Number(meta!.totalPages ?? 0), last: meta!.last === true || meta!.isLast === true }
}

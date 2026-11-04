export interface AdminUser {
  id: number
  email: string
  username: string
  roleName: string
  status: string
}

export interface AdminUserPage {
  content: AdminUser[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export async function fetchAdminUsers(token: string, page: number, size: number, signal: AbortSignal, email = ''): Promise<AdminUserPage> {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  if (email) headers['Content-Type'] = 'application/json'
  const response = await fetch(email ? `/api/admin/users/email?page=${page}&size=${size}` : `/api/api/v1/users/get-all?page=${page}&size=${size}`, {
    method: email ? 'POST' : 'GET', headers, signal,
    ...(email ? { body: JSON.stringify({ email }) } : {}),
  })
  if (email && response.status === 404) return { content: [], page: 0, size, totalElements: 0, totalPages: 0, last: true }
  if (!response.ok) throw new Error(`Không thể tải danh sách người dùng (HTTP ${response.status}).`)
  const raw: unknown = await response.json()
  const body = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
  const paged = body && typeof body === 'object' && 'content' in body && Array.isArray(body.content) ? body : null
  const values = paged ? paged.content as unknown[] : email && Array.isArray(body) ? body : email && body && typeof body === 'object' && 'id' in body ? [body] : email && body == null ? [] : null
  if (!values) throw new Error('Response danh sách người dùng không hợp lệ.')
  const meta = (paged ?? {}) as Record<string, unknown>
  const content = values.map((value: unknown): AdminUser => {
    if (!value || typeof value !== 'object') throw new Error('Thông tin người dùng không hợp lệ.')
    const user = value as Record<string, unknown>
    const id = Number(user.id)
    if (!Number.isInteger(id) || id <= 0) throw new Error('Người dùng thiếu ID hợp lệ.')
    const text = (key: string) => typeof user[key] === 'string' ? user[key] as string : ''
    return { id, email: text('email'), username: text('username'), roleName: text('roleName'), status: text('status') }
  })
  return { content, page: Number(meta.page ?? (paged ? page : 0)), size: Number(meta.size ?? size), totalElements: Number(meta.totalElements ?? content.length), totalPages: Number(meta.totalPages ?? (content.length ? 1 : 0)), last: paged ? meta.last === true : true }
}

export async function changeAdminUserStatus(token: string, id: number, action: 'active' | 'inactive'): Promise<void> {
  const response = await fetch(`/api/admin/users/${id}/${action}`, {
    method: 'PUT', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) {
    const text = await response.text()
    let message = `Không thể cập nhật trạng thái người dùng (HTTP ${response.status}).`
    try {
      const body: unknown = JSON.parse(text)
      if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') message = body.message
    } catch { if (text && !text.trimStart().startsWith('<')) message = text.slice(0, 300) }
    throw new Error(message)
  }
}

import { profileRequest } from './userInfo'

export interface AdminSkill { id: number; name: string; slug: string }
export interface AdminSkillPage { content: AdminSkill[]; page: number; size: number; totalElements: number; totalPages: number }

export async function mutateAdminSkill(token: string, domainId: number, method: 'POST' | 'PUT' | 'DELETE', payload?: { name: string; slug: string }, skillId?: number): Promise<void> {
  if (method === 'DELETE' && (!Number.isInteger(skillId) || !skillId || skillId <= 0)) throw new Error('Thiếu ID kỹ năng cần xóa.')
  await profileRequest(`domains/${domainId}/skill${method === 'DELETE' ? `/${skillId}` : ''}`, token, {
    method,
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  })
}

export async function fetchAdminSkills(token: string, domainId: number, page: number, size: number, signal: AbortSignal): Promise<AdminSkillPage> {
  const body = await profileRequest(`domains/${domainId}?page=${page}&size=${size}`, token, { signal })
  const container = body && typeof body === 'object' && 'skills' in body ? body.skills : body
  const meta = container && typeof container === 'object' && !Array.isArray(container) ? container as Record<string, unknown> : null
  const values = Array.isArray(container) ? container : meta?.content
  if (!Array.isArray(values)) throw new Error('Danh sách kỹ năng không hợp lệ.')
  const items = values.map((value: unknown): AdminSkill => {
    if (!value || typeof value !== 'object') throw new Error('Kỹ năng không hợp lệ.')
    const item = value as Record<string, unknown>
    const id = Number(item.id)
    if (!Number.isInteger(id) || id <= 0 || typeof item.name !== 'string') throw new Error('Kỹ năng thiếu ID hoặc tên.')
    return { id, name: item.name, slug: typeof item.slug === 'string' ? item.slug : '' }
  })
  if (Array.isArray(container)) return { content: items.slice(page * size, (page + 1) * size), page, size, totalElements: items.length, totalPages: Math.ceil(items.length / size) }
  return { content: items, page: Number(meta?.page ?? page), size: Number(meta?.size ?? size), totalElements: Number(meta?.totalElements ?? items.length), totalPages: Number(meta?.totalPages ?? (items.length ? 1 : 0)) }
}

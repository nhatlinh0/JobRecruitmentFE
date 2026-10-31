export interface ProfileOption { id: number; name: string }
export interface UserInfoPayload {
  salaryMax: number | null
  salaryMin: number | null
  salaryNegotiable: boolean
  experienceMax: number
  experienceMin: number
  workingType: string
  city: string
  image: string
  domainId: number
  username: string
  skill_ids: number[]
}

export interface UserInfoResponse extends UserInfoPayload {
  domain: ProfileOption | null
  skills: ProfileOption[]
}

export function unwrap(body: unknown): unknown {
  return body && typeof body === 'object' && 'data' in body ? body.data : body
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Dữ liệu hồ sơ không hợp lệ.')
  return value as Record<string, unknown>
}

export function parseOptions(value: unknown): ProfileOption[] {
  let items = unwrap(value)
  if (items && typeof items === 'object' && 'content' in items) items = items.content
  if (!Array.isArray(items)) throw new Error('Danh sách chuyên môn/kỹ năng không hợp lệ.')
  return items.map((item) => {
    const entry = record(item)
    const id = Number(entry.id)
    const name = entry.name ?? entry.domainName ?? entry.skillName
    if (!Number.isInteger(id) || typeof name !== 'string') throw new Error('Chuyên môn/kỹ năng thiếu ID hoặc tên.')
    return { id, name }
  })
}

// Đọc đủ các trang, tránh dropdown chỉ nhận 10 mục mặc định của server.
export async function fetchProfileOptions(path: string, token: string, signal: AbortSignal): Promise<ProfileOption[]> {
  const options = new Map<number, ProfileOption>()
  for (let page = 0; ; page += 1) {
    const body = await profileRequest(`${path}?page=${page}&size=100`, token, { signal })
    const container = body && typeof body === 'object' && 'skills' in body ? body.skills : body
    const items = parseOptions(container)
    const previousSize = options.size
    items.forEach((item) => options.set(item.id, item))
    const metadata = container && typeof container === 'object' && !Array.isArray(container) ? container as Record<string, unknown> : null
    if (!metadata || !('content' in metadata)) break
    if (metadata.isLast === true || metadata.last === true || (typeof metadata.totalPages === 'number' && page + 1 >= metadata.totalPages)) break
    if (!items.length || options.size === previousSize) break
    if (typeof metadata.totalPages !== 'number' && metadata.isLast !== false && metadata.last !== false) break
  }
  return [...options.values()]
}

export async function profileRequest(path: string, token: string, options: RequestInit = {}): Promise<unknown> {
  const response = await fetch(`/api/api/v1/${path}`, {
    ...options,
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
    signal: options.signal ?? AbortSignal.timeout(15000),
  })
  if (path === 'user-infos' && (!options.method || options.method === 'GET') && (response.status === 204 || response.status === 404)) return null
  const text = await response.text()
  let body: unknown = null
  if (text) { try { body = JSON.parse(text) } catch { if (response.ok) throw new Error('Server trả về dữ liệu không hợp lệ.') } }
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body && typeof body.message === 'string' ? body.message : `Yêu cầu thất bại (HTTP ${response.status}).`
    throw new Error(message)
  }
  return unwrap(body)
}

export function parseUserInfo(body: unknown): UserInfoResponse | null {
  let value = unwrap(body)
  if (Array.isArray(value)) value = value[0] ?? null
  if (value == null) return null
  const info = record(value)
  if (Object.keys(info).length === 0) return null
  const domain = info.domain && typeof info.domain === 'object' ? record(info.domain) : null
  const domainId = Number(domain?.id ?? info.domainId ?? 0)
  if (!Number.isInteger(domainId) || domainId < 0) throw new Error('Chuyên môn trong hồ sơ không có ID hợp lệ.')
  const skillValues = info.skills ?? info.skill_ids ?? []
  if (!Array.isArray(skillValues)) throw new Error('Dữ liệu kỹ năng trong hồ sơ không hợp lệ.')
  const skills = skillValues.every((skill) => skill && typeof skill === 'object') ? parseOptions(skillValues) : []
  const skillIds = skills.length ? skills.map((skill) => skill.id) : skillValues.map(Number)
  if (skillIds.some((id) => !Number.isInteger(id) || id <= 0)) throw new Error('Kỹ năng trong hồ sơ không có ID hợp lệ.')
  return {
    username: typeof info.username === 'string' ? info.username : '',
    city: typeof info.city === 'string' ? info.city : '',
    image: typeof info.image === 'string' ? info.image : '',
    workingType: typeof info.workingType === 'string' ? info.workingType : typeof info.workType === 'string' ? info.workType : '',
    domainId,
    domain: domain && typeof domain.name === 'string' && domainId > 0 ? { id: domainId, name: domain.name } : null,
    skills,
    salaryNegotiable: info.salaryNegotiable === true,
    salaryMin: typeof info.salaryMin === 'number' ? info.salaryMin : null,
    salaryMax: typeof info.salaryMax === 'number' ? info.salaryMax : null,
    experienceMin: Number(info.experienceMin ?? 0),
    experienceMax: Number(info.experienceMax ?? 3),
    skill_ids: [...new Set(skillIds)],
  }
}

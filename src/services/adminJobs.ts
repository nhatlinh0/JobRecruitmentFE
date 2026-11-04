export interface AdminJob {
  id: number
  title: string
  slug: string
  company: { id: number; name: string; logoUrl: string; companySize: string; country: string } | null
  address: string
  endDate: string
  workingType: string
  description: string
  requirements: string
  benefits: string
  createAt: string
  domain: { id: number; name: string } | null
  experienceMin: number | null
  experienceMax: number | null
  salaryMin: number | null
  salaryMax: number | null
  salaryNegotiable: boolean
  city: string
  status: string
  skills: { id: number; name: string }[]
  prioritize: boolean
}

export interface AdminJobPage {
  content: AdminJob[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

function parseJob(value: unknown): AdminJob {
  if (!value || typeof value !== 'object') throw new Error('Thông tin công việc không hợp lệ.')
  const item = value as Record<string, unknown>
  const id = Number(item.id)
  if (!Number.isInteger(id) || id <= 0) throw new Error('Công việc thiếu ID hợp lệ.')
  const text = (key: string) => typeof item[key] === 'string' ? item[key] as string : ''
  const number = (key: string) => item[key] == null ? null : Number(item[key])
  const company = item.company && typeof item.company === 'object' ? item.company as Record<string, unknown> : null
  const domain = item.domain && typeof item.domain === 'object' ? item.domain as Record<string, unknown> : null
  return {
    id, title: text('title'), slug: text('slug'), address: text('address'), endDate: text('endDate'), workingType: text('workingType'),
    description: text('description'), requirements: text('requirements'), benefits: text('benefits'), createAt: text('createAt'),
    city: text('city'), status: text('status'), experienceMin: number('experienceMin'), experienceMax: number('experienceMax'),
    salaryMin: number('salaryMin'), salaryMax: number('salaryMax'), salaryNegotiable: item.salaryNegotiable === true, prioritize: item.prioritize === true,
    company: company ? { id: Number(company.id), name: String(company.name ?? ''), logoUrl: String(company.logoUrl ?? ''), companySize: String(company.companySize ?? ''), country: String(company.country ?? '') } : null,
    domain: domain ? { id: Number(domain.id), name: String(domain.name ?? '') } : null,
    skills: Array.isArray(item.skills) ? item.skills.filter((skill) => skill && typeof skill === 'object' && typeof skill.name === 'string').map((skill) => ({ id: Number(skill.id), name: String(skill.name) })) : [],
  }
}

export type JobStatusFilter = '' | 'ACCEPTED' | 'REJECT' | 'SUSPEND'

export async function fetchAdminJobs(page: number, size: number, signal: AbortSignal, status: JobStatusFilter = '', token?: string, title = ''): Promise<AdminJobPage> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (status || title) {
    if (status && !title) params.set('status', status)
    if (token) headers.Authorization = `Bearer ${token}`
  }
  const endpoint = title ? `/api/admin/jobs/title/${encodeURIComponent(title)}` : status ? '/api/admin/jobs/status' : '/api/api/v1/jobs'
  const response = await fetch(`${endpoint}?${params}`, { headers, signal })
  if (title && response.status === 404) return { content: [], page: 0, size, totalElements: 0, totalPages: 0, last: true }
  if (!response.ok) throw new Error(`Không thể tải danh sách công việc (HTTP ${response.status}).`)
  const raw: unknown = await response.json()
  const body = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
  const paged = body && typeof body === 'object' && 'content' in body && Array.isArray(body.content) ? body : null
  const values = paged ? paged.content as unknown[] : title && Array.isArray(body) ? body : title && body && typeof body === 'object' && 'id' in body ? [body] : title && body == null ? [] : null
  if (!values) throw new Error('Response danh sách công việc không hợp lệ.')
  const meta = (paged ?? {}) as Record<string, unknown>
  return { content: values.map(parseJob), page: Number(meta.page ?? (paged ? page : 0)), size: Number(meta.size ?? size), totalElements: Number(meta.totalElements ?? values.length), totalPages: Number(meta.totalPages ?? (values.length ? 1 : 0)), last: paged ? meta.last === true : true }
}

export type JobAction = 'accept' | 'reject' | 'suspend'

export async function performJobAction(token: string, id: number, action: JobAction): Promise<void> {
  const response = await fetch(`/api/admin/jobs/${id}/${action}`, {
    method: 'PUT', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) {
    const text = await response.text()
    let message = `Không thể cập nhật trạng thái công việc (HTTP ${response.status}).`
    try {
      const body: unknown = JSON.parse(text)
      if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') message = body.message
    } catch { if (text && !text.trimStart().startsWith('<')) message = text.slice(0, 300) }
    throw new Error(message)
  }
}

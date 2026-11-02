export interface CreateJobPayload {
  title: string
  slug: string
  address: string
  end_date: string
  working_type: string
  description: string
  requirements: string
  benefits: string
  domain_id: string
  experience_min: string
  experience_max: string
  salary_min: string | null
  salary_max: string | null
  salary_negotiable: string
  city: string
  skillIds: number[]
  prioritize: string
}

export async function createJob(token: string, payload: CreateJobPayload): Promise<void> {
  return saveJob(token, payload)
}

export async function updateJob(token: string, id: number, payload: CreateJobPayload): Promise<void> {
  return saveJob(token, payload, id)
}

async function saveJob(token: string, payload: CreateJobPayload, id?: number): Promise<void> {
  const response = await fetch(id === undefined ? '/api/api/v1/jobs' : `/api/api/v1/jobs/${id}`, {
    method: id === undefined ? 'POST' : 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) {
    const text = await response.text()
    let message = `Không thể ${id === undefined ? 'tạo' : 'cập nhật'} công việc (HTTP ${response.status}).`
    try {
      const body: unknown = JSON.parse(text)
      if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') message = body.message
    } catch { if (text && !text.trimStart().startsWith('<')) message = text.slice(0, 300) }
    throw new Error(message)
  }
}
export interface RecruitJob {
  domainId: number | null
  skillIds: number[]
  status: string
  id: number
  title: string
  slug: string
  companyName: string
  deadline: string
  workType: string
  address: string
  city: string
  field: string
  skills: string[]
  experience: { min: number; max: number } | null
  salary: { min: number; max: number } | null
  featured: boolean
  description: string
  requirements: string
  benefits: string
}

export function parseRecruitJob(value: unknown): RecruitJob {
  if (!value || typeof value !== 'object') throw new Error('Dữ liệu công việc không hợp lệ.')
  const entry = value as Record<string, unknown>
  const text = (...keys: string[]) => { for (const key of keys) if (typeof entry[key] === 'string') return entry[key] as string; return '' }
  const number = (...keys: string[]) => { for (const key of keys) if (entry[key] != null && Number.isFinite(Number(entry[key]))) return Number(entry[key]); return null }
  const company = entry.company && typeof entry.company === 'object' ? entry.company as Record<string, unknown> : null
  const domain = entry.domain && typeof entry.domain === 'object' ? entry.domain as Record<string, unknown> : null
  const salaryMin = number('salary_min', 'salaryMin'), salaryMax = number('salary_max', 'salaryMax')
  const experienceMin = number('experience_min', 'experienceMin'), experienceMax = number('experience_max', 'experienceMax')
  const id = number('id', 'jobId')
  if (id === null || !Number.isInteger(id)) throw new Error('Công việc thiếu ID hợp lệ.')
  const negotiable = entry.salary_negotiable ?? entry.salaryNegotiable
  const featured = entry.prioritize ?? entry.featured
  return {
    domainId: domain?.id != null ? Number(domain.id) : number('domain_id', 'domainId'),
    skillIds: Array.isArray(entry.skills) ? entry.skills.flatMap((skill) => skill && typeof skill === 'object' && 'id' in skill && Number.isInteger(Number(skill.id)) ? [Number(skill.id)] : []) : Array.isArray(entry.skillIds) ? entry.skillIds.map(Number) : [],
    status: text('status'),
    id, title: text('title'), slug: text('slug'), companyName: typeof company?.name === 'string' ? company.name : text('companyName'),
    deadline: text('end_date', 'endDate', 'deadline'), workType: text('working_type', 'workingType', 'workType').replaceAll('_', ' '),
    address: text('address'), city: text('city'), field: typeof domain?.name === 'string' ? domain.name : text('domainName', 'field'),
    skills: Array.isArray(entry.skills) ? entry.skills.map((skill) => typeof skill === 'string' ? skill : skill && typeof skill === 'object' && 'name' in skill && typeof skill.name === 'string' ? skill.name : '').filter(Boolean) : [],
    salary: negotiable === true || negotiable === 'true' || salaryMin === null || salaryMax === null ? null : { min: salaryMin, max: salaryMax },
    experience: experienceMin === null || experienceMax === null ? null : { min: experienceMin, max: experienceMax },
    featured: featured === true || featured === 'true', description: text('description'), requirements: text('requirements'), benefits: text('benefits'),
  }
}

export async function fetchMyJobs(token: string, page: number, size: number, signal: AbortSignal) {
  const response = await fetch(`/api/api/v1/companies/my-jobs?page=${page}&size=${size}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal })
  if (!response.ok) throw new Error(`Không thể tải bài đăng (HTTP ${response.status}).`)
  const raw: unknown = await response.json()
  const body = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
  if (Array.isArray(body)) {
    const jobs = body.map(parseRecruitJob)
    const totalPages = Math.ceil(jobs.length / size)
    const currentPage = Math.max(0, Math.min(page, totalPages - 1))
    return { content: jobs.slice(currentPage * size, (currentPage + 1) * size), page: currentPage, size, totalElements: jobs.length, totalPages, isLast: currentPage >= totalPages - 1 }
  }
  if (!body || typeof body !== 'object' || !('content' in body) || !Array.isArray(body.content)) throw new Error('Response danh sách bài đăng không hợp lệ.')
  const meta = body as Record<string, unknown>
  const totalElements = Number(meta.totalElements ?? body.content.length)
  const actualSize = Number(meta.size ?? size)
  const actualPage = Number(meta.page ?? meta.number ?? page)
  const totalPages = Number(meta.totalPages ?? Math.ceil(totalElements / actualSize))
  return { content: body.content.map(parseRecruitJob), page: actualPage, size: actualSize, totalElements, totalPages, isLast: Boolean(meta.isLast ?? meta.last ?? actualPage >= totalPages - 1) }
}

// Chưa có endpoint chi tiết: tìm đúng ID trong danh sách thuộc công ty.
export async function fetchMyJob(token: string, id: number, signal: AbortSignal): Promise<RecruitJob | null> {
  for (let page = 0; ; page++) {
    const result = await fetchMyJobs(token, page, 100, signal)
    const job = result.content.find((item) => item.id === id)
    if (job) return job
    if (result.isLast || !result.content.length) return null
  }
}

export async function deleteJob(token: string, id: number): Promise<void> {
  const response = await fetch(`/api/api/v1/jobs/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) {
    const text = await response.text()
    let message = `Không thể xóa bài đăng (HTTP ${response.status}).`
    try {
      const body: unknown = JSON.parse(text)
      if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') message = body.message
    } catch { if (text && !text.trimStart().startsWith('<')) message = text.slice(0, 300) }
    throw new Error(message)
  }
}


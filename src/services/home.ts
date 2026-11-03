import { parseRecruitJob } from './jobs'
import type { Job, WorkType } from '../types/job'

export interface HomeCompany {
  id: string
  name: string
  slug: string
  logoUrl: string
  industry: string
  industrySlug?: string
  country: string
  size: string
  address?: string
  phone?: string
  description?: string
}

// Đọc hết các trang để lọc ACCEPTED chính xác, sau đó phân trang kết quả trên UI.
async function fetchAccepted(path: string, signal: AbortSignal): Promise<Record<string, unknown>[]> {
  const result = new Map<string, Record<string, unknown>>()
  for (let page = 0; ; page++) {
    const response = await fetch(`/api/api/v1/${path}?page=${page}&size=100&status=ACCEPTED`, { headers: { Accept: 'application/json' }, credentials: 'omit', signal })
    if (!response.ok) throw new Error(`Không thể tải ${path === 'jobs' ? 'việc làm' : 'công ty'} (HTTP ${response.status}).`)
    const raw: unknown = await response.json()
    const body = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
    const meta = body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : null
    const content = Array.isArray(body) ? body : meta?.content
    if (!Array.isArray(content)) throw new Error('Response danh sách không hợp lệ.')
    let added = 0
    content.forEach((item) => {
      if (!item || typeof item !== 'object') return
      const entry = item as Record<string, unknown>
      const key = String(entry.id ?? entry.jobId ?? entry.slug ?? '')
      if (!key) throw new Error('Dữ liệu thiếu ID.')
      if (!result.has(key)) added++
      result.set(key, entry)
    })
    if (!meta || meta.last === true || meta.isLast === true || (typeof meta.totalPages === 'number' && page + 1 >= meta.totalPages) || !content.length || !added) break
    if (typeof meta.totalPages !== 'number' && meta.last !== false && meta.isLast !== false) break
  }
  return [...result.values()].filter((item) => item.status === 'ACCEPTED')
}

export async function fetchHomeCompanies(signal: AbortSignal): Promise<HomeCompany[]> {
  const items = await fetchAccepted('companies', signal)
  return items.map(parseHomeCompany)
}

function parseHomeCompany(entry: Record<string, unknown>): HomeCompany {
    const industry = entry.industry && typeof entry.industry === 'object' ? entry.industry as Record<string, unknown> : null
    return { id: String(entry.id), name: String(entry.name ?? ''), slug: String(entry.slug ?? ''), logoUrl: String(entry.logoUrl ?? ''), industry: String(industry?.name ?? entry.industryName ?? (typeof entry.industry === 'string' ? entry.industry : '')), industrySlug: typeof industry?.slug === 'string' ? industry.slug : undefined, country: String(entry.country ?? ''), size: String(entry.companySize ?? ''), address: String(entry.address ?? ''), phone: String(entry.phone ?? ''), description: String(entry.description ?? '') }
}

export async function fetchCompanyBySlug(slug: string, signal: AbortSignal): Promise<HomeCompany | null> {
  const response = await fetch(`/api/api/v1/companies/slug/${encodeURIComponent(slug)}`, {
    headers: { Accept: 'application/json' }, credentials: 'omit', signal,
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Không thể tải công ty (HTTP ${response.status}).`)
  const raw: unknown = await response.json()
  const body = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Thông tin công ty không hợp lệ.')
  return parseHomeCompany(body as Record<string, unknown>)
}

export async function fetchHomeJobs(signal: AbortSignal): Promise<Job[]> {
  const items = await fetchAccepted('jobs', signal)
  return items.map(parseHomeJob)
}

export async function fetchJobsByTag(kind: 'skill' | 'field' | 'company', slug: string, signal: AbortSignal): Promise<Job[]> {
  const path = kind === 'company' ? `companies/${encodeURIComponent(slug)}/jobs` : `jobs/${kind === 'skill' ? 'skill' : 'domain'}/${encodeURIComponent(slug)}`
  const items = await fetchAccepted(path, signal)
  return items.map(parseHomeJob)
}

export async function fetchCompaniesByIndustry(slug: string, signal: AbortSignal): Promise<HomeCompany[]> {
  const items = await fetchAccepted(`companies/industry/${encodeURIComponent(slug)}`, signal)
  return items.map(parseHomeCompany)
}

export function parseHomeJob(entry: Record<string, unknown>): Job {
    const job = parseRecruitJob(entry)
    const type = job.workType === 'REMOTE' ? 'Remote' : job.workType === 'HYBRID' ? 'Hybrid' : job.workType === 'ONSITE' ? 'Onsite' : job.workType
    const company = entry.company && typeof entry.company === 'object' ? entry.company as Record<string, unknown> : null
    const industry = company?.industry && typeof company.industry === 'object' ? company.industry as Record<string, unknown> : null
    const domain = entry.domain && typeof entry.domain === 'object' ? entry.domain as Record<string, unknown> : null
    const skillSlugs: Record<string, string> = {}
    if (Array.isArray(entry.skills)) entry.skills.forEach((skill) => {
      if (skill && typeof skill === 'object' && 'name' in skill && 'slug' in skill && typeof skill.name === 'string' && typeof skill.slug === 'string') skillSlugs[skill.name] = skill.slug
    })
    return { ...job, domainSlug: typeof domain?.slug === 'string' ? domain.slug : undefined, skillSlugs, company: company ? {
      id: company.id != null ? String(company.id) : undefined,
      name: typeof company.name === 'string' ? company.name : job.companyName,
      slug: String(company.slug ?? ''), logoUrl: String(company.logoUrl ?? ''),
      industry: String(industry?.name ?? company.industryName ?? (typeof company.industry === 'string' ? company.industry : '')),
      size: String(company.companySize ?? company.size ?? ''), country: String(company.country ?? ''),
      address: String(company.address ?? ''), phone: String(company.phone ?? ''), description: String(company.description ?? ''),
    } : undefined, companyId: entry.companyId != null ? String(entry.companyId) : company?.id != null ? String(company.id) : undefined, companyColor: 'green', workType: type as WorkType, experience: job.experience ?? undefined, priority: job.featured ? 1 : 0 } satisfies Job
}

export async function fetchJobBySlug(slug: string, signal: AbortSignal): Promise<Job | null> {
  const response = await fetch(`/api/api/v1/jobs/slug/${encodeURIComponent(slug)}`, {
    headers: { Accept: 'application/json' }, credentials: 'omit', signal,
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Không thể tải công việc (HTTP ${response.status}).`)
  const raw: unknown = await response.json()
  const body = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Thông tin công việc không hợp lệ.')
  return parseHomeJob(body as Record<string, unknown>)
}

export interface AdminCompany {
  id: number
  name: string
  slug: string
  address: string
  companySize: string
  phone: string
  logoUrl: string
  profilePDFUrl: string
  status: string
  country: string
  industry: { id: number; name: string } | null
  createAt: string
  description: string
  jobCount: number
}

export interface AdminCompanyPage {
  content: AdminCompany[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

function parseCompany(value: unknown): AdminCompany {
  if (!value || typeof value !== 'object') throw new Error('Thông tin công ty không hợp lệ.')
  const item = value as Record<string, unknown>
  const id = Number(item.id)
  if (!Number.isInteger(id) || id <= 0) throw new Error('Công ty thiếu ID hợp lệ.')
  const text = (key: string) => typeof item[key] === 'string' ? item[key] as string : ''
  const industry = item.industry && typeof item.industry === 'object' ? item.industry as Record<string, unknown> : null
  return {
    id, name: text('name'), slug: text('slug'), address: text('address'), companySize: text('companySize'), phone: text('phone'),
    logoUrl: text('logoUrl'), profilePDFUrl: text('profilePDFUrl') || text('profilePdfUrl'), status: text('status'), country: text('country'),
    industry: industry && typeof industry.name === 'string' ? { id: Number(industry.id), name: industry.name } : null,
    createAt: text('createAt'), description: text('description'), jobCount: Number(item.jobCount ?? 0),
  }
}

export type CompanyStatusFilter = '' | 'ACCEPTED' | 'REJECT' | 'SUSPEND'

export async function fetchAdminCompanies(token: string, page: number, size: number, signal: AbortSignal, status: CompanyStatusFilter = ''): Promise<AdminCompanyPage> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (status) params.set('status', status)
  const response = await fetch(`${status ? '/api/admin/companies/status' : '/api/api/v1/companies'}?${params}`, {
    method: 'GET', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal,
  })
  if (!response.ok) throw new Error(`Không thể tải danh sách công ty (HTTP ${response.status}).`)
  const raw: unknown = await response.json()
  const body = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
  if (!body || typeof body !== 'object' || !('content' in body) || !Array.isArray(body.content)) throw new Error('Response danh sách công ty không hợp lệ.')
  const meta = body as Record<string, unknown>
  return {
    content: body.content.map(parseCompany), page: Number(meta.page ?? page), size: Number(meta.size ?? size),
    totalElements: Number(meta.totalElements ?? 0), totalPages: Number(meta.totalPages ?? 0), last: meta.last === true,
  }
}
export type CompanyAction = 'accept' | 'reject' | 'suspend'

export async function performCompanyAction(token: string, companyId: number, action: CompanyAction): Promise<void> {
  const response = await fetch(`/api/admin/companies/${companyId}/${action}`, {
    method: 'PUT', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) {
    const text = await response.text()
    let message = `Không thể cập nhật trạng thái công ty (HTTP ${response.status}).`
    try {
      const body: unknown = JSON.parse(text)
      if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') message = body.message
    } catch { if (text && !text.trimStart().startsWith('<')) message = text.slice(0, 300) }
    throw new Error(message)
  }
}

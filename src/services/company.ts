import { parseOptions, unwrap, type ProfileOption } from './userInfo'

export interface CompanyProfile {
  name: string
  slug: string
  address: string
  companySize: string
  phone: string
  logoUrl: string
  profilePDFUrl: string
  country: string
  industryId: number
  industry: ProfileOption | null
  description: string
}

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text()
  let body: unknown = text || null
  try { body = text ? JSON.parse(text) : null } catch { /* Có thể là thông báo dạng text. */ }
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body && typeof body.message === 'string' ? body.message : `Yêu cầu công ty thất bại (HTTP ${response.status}).`
    throw new Error(message)
  }
  return unwrap(body)
}

export async function fetchIndustries(signal: AbortSignal): Promise<ProfileOption[]> {
  const result = new Map<number, ProfileOption>()
  for (let page = 0; ; page++) {
    const response = await fetch(`/api/public/industry?page=${page}&size=100`, { headers: { Accept: 'application/json' }, credentials: 'omit', signal })
    const body = await readResponse(response)
    const items = parseOptions(body)
    const previousSize = result.size
    items.forEach((item) => result.set(item.id, item))
    if (!body || typeof body !== 'object' || Array.isArray(body) || !('content' in body)) break
    const meta = body as Record<string, unknown>
    if (meta.last === true || meta.isLast === true || (typeof meta.totalPages === 'number' && page + 1 >= meta.totalPages)) break
    if (!items.length || previousSize === result.size) break
    if (typeof meta.totalPages !== 'number' && meta.last !== false && meta.isLast !== false) break
  }
  return [...result.values()]
}

export async function fetchMyCompany(token: string, signal: AbortSignal): Promise<CompanyProfile | null> {
  const response = await fetch('/api/api/v1/companies/my-company', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal })
  // Tài khoản mới chưa có công ty: mở form tạo mới, không báo lỗi.
  if (response.status === 400 || response.status === 404) return null
  const body = await readResponse(response)
  if (!body || typeof body !== 'object' || !('name' in body) || typeof body.name !== 'string') throw new Error('Thông tin công ty trả về không hợp lệ.')
  const value = body as Record<string, unknown>
  const industry = value.industry && typeof value.industry === 'object' ? value.industry as Record<string, unknown> : null
  const text = (key: string) => typeof value[key] === 'string' ? value[key] as string : ''
  const industryId = Number(industry?.id ?? value.industryId ?? 0)
  return { name: text('name'), slug: text('slug'), address: text('address'), companySize: String(value.companySize ?? ''), phone: text('phone'), country: text('country'), logoUrl: text('logoUrl'), profilePDFUrl: text('profilePdfUrl') || text('profilePDFUrl'), industryId, industry: industry && typeof industry.name === 'string' ? { id: industryId, name: industry.name } : null, description: text('description') }
}

export async function saveCompany(token: string, exists: boolean, company: Omit<CompanyProfile, 'industry' | 'logoUrl' | 'profilePDFUrl'>, logo: File | null, license: File | null): Promise<void> {
  const form = new FormData()
  Object.entries(company).forEach(([key, value]) => form.append(key, String(value)))
  if (logo) form.append('logoUrl', logo, logo.name)
  if (license) form.append('profilePDFUrl', license, license.name)
  const response = await fetch('/api/api/v1/companies', { method: exists ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, body: form, signal: AbortSignal.timeout(30000) })
  await readResponse(response)
}

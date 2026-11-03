export async function submitApplication(token: string, jobId: number, coverLetter: string, cv: File | string, userStatus?: string): Promise<void> {
  await assertApplicationAllowed(token, jobId, undefined, userStatus)
  const body = new FormData()
  body.append('jobId', String(jobId))
  body.append('coverLetter', coverLetter)
  if (typeof cv === 'string') body.append('cvUrl', cv)
  else body.append('cvFile', cv, cv.name)
  const response = await fetch('/api/api/v1/applications', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body, signal: AbortSignal.timeout(30000) })
  if (!response.ok) {
    const text = await response.text()
    let message = `Không thể gửi đơn ứng tuyển (HTTP ${response.status}).`
    try { const value: unknown = JSON.parse(text); if (value && typeof value === 'object' && 'message' in value && typeof value.message === 'string') message = value.message } catch { if (text && !text.trimStart().startsWith('<')) message = text.slice(0, 300) }
    throw new Error(message)
  }
}
export interface UserApplication {
  id: string
  userName: string
  jobTitle: string
  jobSlug: string
  companyName: string
  coverLetter: string
  cvUrl: string
  status: string
  submittedAt: string
}

export interface UserApplicationPage {
  content: UserApplication[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export async function fetchUserApplications(token: string, page: number, size: number, signal: AbortSignal): Promise<UserApplicationPage> {
  return fetchApplicationsPage('users/application-jobs', token, page, size, signal)
}

export async function fetchJobApplications(jobId: number, token: string, page: number, size: number, signal: AbortSignal): Promise<UserApplicationPage> {
  if (!Number.isInteger(jobId) || jobId <= 0) throw new Error('ID công việc không hợp lệ.')
  return fetchApplicationsPage(`applications/job/${jobId}`, token, page, size, signal)
}

async function fetchApplicationsPage(path: string, token: string, page: number, size: number, signal: AbortSignal): Promise<UserApplicationPage> {
  const response = await fetch(`/api/api/v1/${path}?page=${page}&size=${size}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal })
  if (!response.ok) throw new Error(`Không thể tải đơn ứng tuyển (HTTP ${response.status}).`)
  const raw: unknown = await response.json()
  const body = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
  const meta = body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : null
  const values = Array.isArray(body) ? body : meta?.content
  if (!Array.isArray(values)) throw new Error('Response danh sách ứng tuyển không hợp lệ.')
  const content = values.map((value: unknown): UserApplication => {
    if (!value || typeof value !== 'object') throw new Error('Thông tin đơn ứng tuyển không hợp lệ.')
    const item = value as Record<string, unknown>
    const job = item.job && typeof item.job === 'object' ? item.job as Record<string, unknown> : null
    const company = job?.company && typeof job.company === 'object' ? job.company as Record<string, unknown> : null
    const text = (value: unknown) => typeof value === 'string' ? value : ''
    return { id: String(item.id ?? item.applicationId ?? ''), userName: text(item.userName), jobTitle: text(item.jobName ?? job?.title ?? item.jobTitle ?? item.title), jobSlug: text(job?.slug ?? item.jobSlug), companyName: text(company?.name ?? item.companyName), coverLetter: text(item.coverLetter), cvUrl: text(item.cvUrl), status: text(item.status), submittedAt: text(item.createAt ?? item.submittedAt ?? item.createdAt ?? item.appliedAt ?? item.applicationDate) }
  })
  if (Array.isArray(body)) {
    const totalPages = Math.ceil(content.length / size)
    const currentPage = Math.max(0, Math.min(page, totalPages - 1))
    return { content: content.slice(currentPage * size, (currentPage + 1) * size), page: currentPage, size, totalElements: content.length, totalPages }
  }
  const actualSize = Number(meta?.size ?? size)
  const totalElements = Number(meta?.totalElements ?? content.length)
  return { content, page: Number(meta?.page ?? meta?.number ?? page), size: actualSize, totalElements, totalPages: Number(meta?.totalPages ?? Math.ceil(totalElements / actualSize)) }
}

export async function assertApplicationAllowed(token: string, jobId: number, signal?: AbortSignal, userStatus?: string): Promise<void> {
  if (userStatus?.trim().toUpperCase() === 'INACTIVE') throw new Error('Tài khoản đang tạm ngưng, bạn không được phép ứng tuyển.')
  if (!Number.isInteger(jobId) || jobId <= 0) throw new Error('ID công việc không hợp lệ.')
  const requestSignal = signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000)
  const response = await fetch(`/api/api/v1/applications/exist/${jobId}`, {
      method: 'GET', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store', signal: requestSignal,
  })
  if (response.status === 404) return
  if (response.status === 200) throw new Error('Bạn đã ứng tuyển công việc này. Mỗi công việc chỉ được ứng tuyển một lần.')
  throw new Error(`Kiểm tra ứng tuyển thất bại (HTTP ${response.status}). Vui lòng thử lại.`)
}

export async function canReviewApplications(token: string, signal?: AbortSignal): Promise<boolean> {
  const response = await fetch('/api/api/v1/companies/my-company', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000),
  })
  if (response.status === 404) return false
  if (response.status !== 200) throw new Error(`Không thể kiểm tra quyền duyệt ứng tuyển (HTTP ${response.status}).`)
  const raw: unknown = await response.json()
  const company = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
  return Boolean(company && typeof company === 'object' && 'status' in company && company.status === 'ACCEPTED')
}

export async function updateApplicationStatus(token: string, applicationId: string, status: 'ACCEPTED' | 'REJECT'): Promise<void> {
  if (!await canReviewApplications(token)) throw new Error('Chỉ công ty đã được duyệt (ACCEPTED) mới được duyệt hoặc loại ứng viên.')
  const response = await fetch(`/api/api/v1/applications/status/${encodeURIComponent(applicationId)}`, {
    method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }), signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) {
    const text = await response.text()
    let message = `Không thể cập nhật đơn ứng tuyển (HTTP ${response.status}).`
    try { const body: unknown = JSON.parse(text); if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') message = body.message } catch { if (text && !text.trimStart().startsWith('<')) message = text.slice(0, 300) }
    throw new Error(message)
  }
}


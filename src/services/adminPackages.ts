import type { CreditPackage } from './packages'

export interface PackagePayload { name: string; price: string; credits: string; description: string }
export interface PackagePage { content: CreditPackage[]; page: number; size: number; totalElements: number; totalPages: number }

function parsePackage(value: unknown): CreditPackage {
  if (!value || typeof value !== 'object') throw new Error('Thông tin gói không hợp lệ.')
  const item = value as Record<string, unknown>
  const id = Number(item.id), price = Number(item.price), credits = Number(item.credits)
  if (!Number.isInteger(id) || id <= 0 || typeof item.name !== 'string' || item.price == null || !Number.isFinite(price) || price < 0 || item.credits == null || !Number.isInteger(credits) || credits < 0) throw new Error('Gói thiếu tên, giá hoặc số credits hợp lệ.')
  return { id, name: item.name, price, credits, description: typeof item.description === 'string' ? item.description : '' }
}

async function packageRequest(token: string, path: string, options: RequestInit = {}): Promise<unknown> {
  const response = await fetch(`/api/api/v1/packages${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
    signal: options.signal ?? AbortSignal.timeout(15000),
  })
  const text = await response.text()
  let body: unknown = null
  if (text) { try { body = JSON.parse(text) } catch { body = text } }
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body && typeof body.message === 'string' ? body.message : typeof body === 'string' && !body.trimStart().startsWith('<') ? body.slice(0, 300) : `Yêu cầu gói thất bại (HTTP ${response.status}).`
    throw new Error(message)
  }
  return body && typeof body === 'object' && 'data' in body ? body.data : body
}

export async function fetchAdminPackages(token: string, page: number, size: number, signal: AbortSignal): Promise<PackagePage> {
  const body = await packageRequest(token, `?page=${page}&size=${size}`, { signal })
  if (Array.isArray(body)) {
    const items = body.map(parsePackage)
    const totalPages = Math.ceil(items.length / size)
    const current = Math.max(0, Math.min(page, totalPages - 1))
    return { content: items.slice(current * size, (current + 1) * size), page: current, size, totalElements: items.length, totalPages }
  }
  if (!body || typeof body !== 'object' || !('content' in body) || !Array.isArray(body.content)) throw new Error('Danh sách gói không hợp lệ.')
  const meta = body as Record<string, unknown>
  return { content: body.content.map(parsePackage), page: Number(meta.page ?? page), size: Number(meta.size ?? size), totalElements: Number(meta.totalElements ?? 0), totalPages: Number(meta.totalPages ?? 0) }
}

export async function fetchPackageDetail(token: string, id: number, signal: AbortSignal): Promise<CreditPackage> {
  return parsePackage(await packageRequest(token, `/${id}`, { signal }))
}

export async function savePackage(token: string, payload: PackagePayload, id?: number): Promise<void> {
  await packageRequest(token, id === undefined ? '' : `/${id}`, { method: id === undefined ? 'POST' : 'PUT', body: JSON.stringify(payload) })
}

export async function deletePackage(token: string, id: number): Promise<void> {
  await packageRequest(token, `/${id}`, { method: 'DELETE' })
}

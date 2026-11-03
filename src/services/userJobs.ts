import { parseHomeJob } from './home'
import type { Job } from '../types/job'

export type UserJobKind = 'saved' | 'applied'
export interface UserJobsPageData {
  content: Job[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export async function fetchUserJobs(kind: UserJobKind, token: string, page: number, size: number, signal: AbortSignal): Promise<UserJobsPageData> {
  const endpoint = kind === 'saved' ? 'saved-jobs' : 'application-jobs'
  const response = await fetch(`/api/api/v1/users/${endpoint}?page=${page}&size=${size}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal })
  if (!response.ok) throw new Error(`Không thể tải danh sách việc làm (HTTP ${response.status}).`)
  const raw: unknown = await response.json()
  const body = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
  const meta = body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : null
  const values = Array.isArray(body) ? body : meta?.content
  if (!Array.isArray(values)) throw new Error('Response danh sách việc làm không hợp lệ.')
  const content = values.map((value: unknown) => {
    if (!value || typeof value !== 'object') throw new Error('Thông tin việc làm không hợp lệ.')
    const job = 'job' in value && value.job && typeof value.job === 'object' ? value.job : value
    return parseHomeJob(job as Record<string, unknown>)
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

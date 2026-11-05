import type { Job } from '../types/job'
import { parseHomeJob } from './home'

export interface JobSearchPage {
  content: Job[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export async function searchJobsByTitle(title: string, page: number, size: number, signal: AbortSignal, filterQuery?: string): Promise<JobSearchPage> {
  const params = new URLSearchParams(filterQuery)
  params.set('page', String(page)); params.set('size', String(size))
  if (filterQuery !== undefined) params.set('sort', 'id,desc')
  const response = await fetch(`/api/api/v1/jobs/${filterQuery !== undefined ? 'filter' : `title/${encodeURIComponent(title)}`}?${params}`, {
    headers: { Accept: 'application/json' }, credentials: 'omit', signal,
  })
  if (!response.ok) throw new Error(`Không thể tìm kiếm việc làm (HTTP ${response.status}).`)
  const raw: unknown = await response.json()
  const body = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
  if (!body || typeof body !== 'object' || !('content' in body) || !Array.isArray(body.content)) throw new Error('Danh sách việc làm không hợp lệ.')
  const meta = body as Record<string, unknown>
  const content = body.content.map((item: unknown) => {
    if (!item || typeof item !== 'object') throw new Error('Thông tin công việc không hợp lệ.')
    return parseHomeJob(item as Record<string, unknown>)
  })
  return { content, page: Number(meta.page ?? page), size: Number(meta.size ?? size), totalElements: Number(meta.totalElements ?? 0), totalPages: Number(meta.totalPages ?? 0), last: meta.last === true }
}

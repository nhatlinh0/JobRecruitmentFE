import { useMemo, useSyncExternalStore } from 'react'
import { useAuth } from './useAuth'
import { useNavigate } from 'react-router-dom'

const pendingSaves = new Set<string>()

const SAVED_JOBS_EVENT = 'saved-jobs-changed'

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(SAVED_JOBS_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(SAVED_JOBS_EVENT, onChange)
  }
}

function parseIds(value: string | null): number[] {
  try {
    const parsed: unknown = JSON.parse(value ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number' && Number.isInteger(id)) : []
  } catch {
    return []
  }
}

export function useSavedJobs() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const key = `saved_jobs:${user?.sub ?? 'guest'}`
  const stored = useSyncExternalStore(subscribe, () => localStorage.getItem(key), () => null)
  const savedIds = useMemo(() => parseIds(stored), [stored])

  async function toggleSaved(jobId: number) {
    if (!token) { navigate('/login'); return }
    const requestKey = `${key}:${jobId}`
    if (pendingSaves.has(requestKey)) return
    pendingSaves.add(requestKey)
    try {
      const response = await fetch(`/api/api/v1/users/saved/${jobId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000) })
      if (!response.ok) {
        const text = await response.text()
        let message = `Không thể lưu công việc (HTTP ${response.status}).`
        try { const body: unknown = JSON.parse(text); if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') message = body.message } catch { /* Giữ thông báo mặc định. */ }
        throw new Error(message)
      }
      const current = parseIds(localStorage.getItem(key))
      localStorage.setItem(key, JSON.stringify([...new Set([...current, jobId])]))
      window.dispatchEvent(new Event(SAVED_JOBS_EVENT))
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'success', message: 'Đã lưu công việc.' } }))
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'error', message: error instanceof Error ? error.message : 'Không thể lưu công việc.' } }))
    } finally { pendingSaves.delete(requestKey) }
  }

  async function removeSaved(jobId: number): Promise<boolean> {
    if (!token) { navigate('/login'); return false }
    const requestKey = `${key}:${jobId}`
    if (pendingSaves.has(requestKey)) return false
    pendingSaves.add(requestKey)
    try {
      const response = await fetch(`/api/api/v1/users/saved/${jobId}/remove`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) {
        const text = await response.text()
        let message = `Không thể xóa việc làm đã lưu (HTTP ${response.status}).`
        try {
          const body: unknown = JSON.parse(text)
          if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') message = body.message
        } catch { if (text && !text.trimStart().startsWith('<')) message = text.slice(0, 300) }
        throw new Error(message)
      }
      const current = parseIds(localStorage.getItem(key))
      localStorage.setItem(key, JSON.stringify(current.filter((id) => id !== jobId)))
      window.dispatchEvent(new Event(SAVED_JOBS_EVENT))
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'success', message: 'Đã xóa việc làm khỏi danh sách đã lưu.' } }))
      return true
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'error', message: error instanceof Error ? error.message : 'Không thể xóa việc làm đã lưu.' } }))
      return false
    } finally { pendingSaves.delete(requestKey) }
  }

  return { savedIds, toggleSaved, removeSaved }
}

import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ApplicationsContent } from './AppliedJobsPage'
import './JobApplicantsPage.css'

export function JobApplicantsPage() {
  const { id } = useParams<{ id: string }>()
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!user?.role) return <p role="status">Đang tải thông tin người dùng...</p>
  if (user.role !== 'RECRUIT') return <Navigate to="/" replace />
  const jobId = Number(id)
  if (!Number.isInteger(jobId) || jobId <= 0) return <section className="post-list"><h1>Công việc không hợp lệ</h1><Link to="/recruit/posts">Quay lại danh sách bài đăng</Link></section>
  return <ApplicationsContent key={`${token}:${jobId}`} token={token} jobId={jobId} />
}
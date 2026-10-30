import { useState } from 'react'
import { Link } from 'react-router-dom'
import { JobList } from '../components/jobs/JobList'
import { jobs } from '../data/jobs'
import { useSavedJobs } from '../hooks/useSavedJobs'
import './JobPostListPage.css'

const PAGE_SIZE = 6

export function SavedJobsPage() {
  const { savedIds, toggleSaved } = useSavedJobs()
  const [requestedPage, setRequestedPage] = useState(0)
  const savedJobs = jobs.filter((job) => savedIds.includes(job.id))
  // Giả lập metadata phân trang trước khi kết nối API.
  const totalElements = savedJobs.length
  const totalPages = Math.ceil(totalElements / PAGE_SIZE)
  const page = Math.max(0, Math.min(requestedPage, totalPages - 1))
  const isLast = page >= totalPages - 1
  const content = savedJobs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return <section className="post-list">
    <div className="post-list__heading"><span className="section-kicker">CƠ HỘI CỦA BẠN</span><h1>Việc làm đã lưu</h1><p>{totalElements} việc làm đã lưu.</p></div>
    {totalElements > 0
      ? <JobList jobs={content} savedIds={savedIds} onToggleSave={toggleSaved} onReset={() => setRequestedPage(0)} />
      : <div className="empty-state"><h2>Bạn chưa lưu việc làm nào</h2><p>Lưu những công việc bạn quan tâm để xem lại tại đây.</p><Link className="button button-primary" to="/">Khám phá việc làm</Link></div>}
    <nav className="post-pagination" aria-label="Phân trang việc làm đã lưu">
      <span className="post-pagination__info">Trang {totalPages ? page + 1 : 0}/{totalPages} · Tổng {totalElements} việc làm</span>
      <div className="post-pagination__buttons">
        <button type="button" disabled={page === 0} onClick={() => setRequestedPage(page - 1)}>← Trước</button>
        {Array.from({ length: totalPages }, (_, index) => <button key={index} type="button" aria-label={`Trang ${index + 1}`} aria-current={index === page ? 'page' : undefined} className={index === page ? 'is-active' : ''} onClick={() => setRequestedPage(index)}>{index + 1}</button>)}
        <button type="button" disabled={isLast} onClick={() => setRequestedPage(page + 1)}>Sau →</button>
      </div>
    </nav>
  </section>
}

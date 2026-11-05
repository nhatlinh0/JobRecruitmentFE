import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { searchJobsByTitle, type JobSearchPage as SearchResult } from '../services/jobSearch'
import { JobList } from '../components/jobs/JobList'
import { Pagination } from '../components/ui/Pagination'
import { useSavedJobs } from '../hooks/useSavedJobs'
import './TagJobsPage.css'

export function JobSearchPage({ filtered = false }: { filtered?: boolean }) {
  const [params] = useSearchParams()
  const title = params.get('title')?.trim() ?? ''
  const filterQuery = filtered ? params.toString() : undefined
  return <SearchContent key={filtered ? `filter:${filterQuery}` : title} title={title} filterQuery={filterQuery} />
}

function SearchContent({ title, filterQuery }: { title: string; filterQuery?: string }) {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const { savedIds, toggleSaved } = useSavedJobs()
  useEffect(() => {
    if (!title && filterQuery === undefined) return
    const controller = new AbortController()
    searchJobsByTitle(title, page, filterQuery === undefined ? 6 : 10, controller.signal, filterQuery).then((result) => {
      if (!controller.signal.aborted) setData(result)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Không thể tìm kiếm việc làm.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [title, page, retry, filterQuery])
  return <section className="tag-jobs">
    <div className="tag-jobs__heading"><span className="section-kicker">TÌM KIẾM VIỆC LÀM</span><h1>{filterQuery !== undefined ? 'Việc làm phù hợp với bộ lọc' : title ? `Kết quả cho “${title}”` : 'Tìm kiếm việc làm'}</h1>{!loading && !error && data && <p>{data.totalElements} việc làm phù hợp.</p>}</div>
    {!title && filterQuery === undefined ? <p>Vui lòng nhập tiêu đề công việc tại <Link to="/">trang chủ</Link>.</p> : loading ? <p role="status">Đang tìm việc làm...</p> : error ? <div role="alert">{error} <button className="button button-outline" type="button" onClick={() => { setLoading(true); setError(''); setRetry((value) => value + 1) }}>Thử lại</button></div> : data && <>
      {data.content.length ? <JobList jobs={data.content} savedIds={savedIds} onToggleSave={toggleSaved} onReset={() => {}} /> : <div className="tag-jobs__empty"><h2>Không tìm thấy việc làm phù hợp</h2><Link className="button button-primary" to="/">Quay lại tìm kiếm</Link></div>}
      <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} label="việc làm" onChange={(next) => { setLoading(true); setError(''); setPage(next) }} />
    </>}
  </section>
}

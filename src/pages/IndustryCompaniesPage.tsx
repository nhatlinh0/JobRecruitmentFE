import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { fetchCompaniesByIndustry, type HomeCompany } from '../services/home'
import { CompanyDirectory } from '../components/home/CompanyDirectory'
import './TagJobsPage.css'

export function IndustryCompaniesPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const location = useLocation()
  const [result, setResult] = useState<{ slug: string; companies: HomeCompany[]; error: string } | null>(null)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    window.scrollTo(0, 0)
    fetchCompaniesByIndustry(slug, controller.signal).then((companies) => {
      if (!controller.signal.aborted) setResult({ slug, companies, error: '' })
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setResult({ slug, companies: [], error: error instanceof Error ? error.message : 'Không thể tải danh sách công ty.' })
    })
    return () => controller.abort()
  }, [slug, retry])
  const data = result?.slug === slug ? result : null
  const label = typeof location.state?.label === 'string' ? location.state.label : slug.replaceAll('-', ' ')
  return <div>
    <div className="tag-jobs__heading" style={{ maxWidth: 1168, margin: '32px auto 0', padding: '0 22px' }}><Link to="/">← Trang chủ</Link><h1>Công ty lĩnh vực {label}</h1></div>
    {!data ? <p role="status">Đang tải công ty...</p> : data.error ? <div role="alert">{data.error} <button type="button" onClick={() => { setResult(null); setRetry((value) => value + 1) }}>Thử lại</button></div> : <CompanyDirectory key={slug} items={data.companies} />}
  </div>
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CtaBanner } from '../components/home/CtaBanner'
import { FeaturedJobs } from '../components/home/FeaturedJobs'
import { HeroSection } from '../components/home/HeroSection'
import { CompanyDirectory } from '../components/home/CompanyDirectory'

import { useAuth } from '../hooks/useAuth'
import { useJobSearch } from '../hooks/useJobSearch'
import { useSavedJobs } from '../hooks/useSavedJobs'
import { RecruitHome } from './RecruitHome'
import { AdminPage } from './AdminPage'
import { fetchHomeCompanies, fetchHomeJobs, type HomeCompany } from '../services/home'
import type { Job } from '../types/job'
import './HomePage.css'

const EMPTY_JOBS: Job[] = []

export function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [remoteJobs, setRemoteJobs] = useState<Job[]>(EMPTY_JOBS)
  const [companies, setCompanies] = useState<HomeCompany[]>([])
  const [loadState, setLoadState] = useState({ companies: false, jobs: false, companyError: '', jobError: '' })
  const [retry, setRetry] = useState(0)

  const homeJobs = remoteJobs
  const search = useJobSearch(homeJobs)
  const { savedIds, toggleSaved } = useSavedJobs()

  useEffect(() => {
    if (user?.role === 'RECRUIT' || user?.role === 'ADMIN') return
    const controller = new AbortController()
    fetchHomeCompanies(controller.signal).then((items) => {
      if (!controller.signal.aborted) { setCompanies(items); setLoadState((state) => ({ ...state, companies: true, companyError: '' })) }
    }).catch((error: unknown) => { if (!controller.signal.aborted) setLoadState((state) => ({ ...state, companies: true, companyError: error instanceof Error ? error.message : 'Không thể tải công ty.' })) })
    fetchHomeJobs(controller.signal).then((items) => {
      if (!controller.signal.aborted) { setRemoteJobs(items); setLoadState((state) => ({ ...state, jobs: true, jobError: '' })) }
    }).catch((error: unknown) => { if (!controller.signal.aborted) setLoadState((state) => ({ ...state, jobs: true, jobError: error instanceof Error ? error.message : 'Không thể tải việc làm.' })) })
    return () => controller.abort()
  }, [user?.role, retry])

  useEffect(() => {
    if (window.location.search) scrollToJobs()
  }, [])

  function scrollToJobs() {
    document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (user?.role === 'RECRUIT') return <RecruitHome />
  if (user?.role === 'ADMIN') return <AdminPage />

  return (
    <div className="home-page">
      <HeroSection
        keyword={title}
        onKeywordChange={setTitle}
        onSearch={() => { if (title.trim()) navigate(`/jobs/search?${new URLSearchParams({ title: title.trim() })}`); else scrollToJobs() }}
      />
      {!loadState.companies ? <div className="home-page__status" role="status"><span className="section-kicker">NHÀ TUYỂN DỤNG</span><p>Đang tải công ty...</p></div> : loadState.companyError ? <div className="home-page__status" role="alert">{loadState.companyError} <button className="button button-outline" type="button" onClick={() => setRetry((value) => value + 1)}>Thử lại</button></div> : <CompanyDirectory items={companies} />}
      {!loadState.jobs ? <div className="home-page__status" role="status"><span className="section-kicker">CƠ HỘI NGHỀ NGHIỆP</span><p>Đang tải việc làm...</p></div> : loadState.jobError ? <div className="home-page__status" role="alert">{loadState.jobError} <button className="button button-outline" type="button" onClick={() => setRetry((value) => value + 1)}>Thử lại</button></div> :
      <FeaturedJobs
        allJobs={homeJobs}
        field={search.field}
        jobs={search.filteredJobs}
        onFieldChange={search.setField}
        onReset={search.resetFilters}
        onToggleSave={toggleSaved}
        savedIds={savedIds}
      />
      }
      <CtaBanner />
    </div>
  )
}

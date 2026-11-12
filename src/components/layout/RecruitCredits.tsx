import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { fetchMyCompany } from '../../services/company'
import { Icon } from '../ui/Icon'
import './RecruitCredits.css'

export function RecruitCredits() {
  const { token, user } = useAuth()
  const { pathname } = useLocation()
  const [result, setResult] = useState<{ key: string; credits: number | null; hasCompany: boolean; error: string } | null>(null)
  const [retry, setRetry] = useState(0)
  const key = `${token}:${pathname}:${retry}`
  useEffect(() => {
    function refresh() { setRetry((value) => value + 1) }
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])
  useEffect(() => {
    if (!token || user?.role !== 'RECRUIT') return
    const controller = new AbortController()
    fetchMyCompany(token, controller.signal).then((company) => {
      if (!controller.signal.aborted) setResult({ key, credits: company?.credits ?? null, hasCompany: Boolean(company), error: '' })
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setResult({ key, credits: null, hasCompany: false, error: error instanceof Error ? error.message : 'Không thể tải credit.' })
    })
    return () => controller.abort()
  }, [token, user?.role, key])
  if (user?.role !== 'RECRUIT') return null
  const data = result?.key === key ? result : null
  return <section className="recruit-credits" aria-label="Số dư credit">
    <div className="recruit-credits__label"><Icon name="spark" /><span>Credit của công ty</span><button className="recruit-credits__refresh" type="button" onClick={() => setRetry((value) => value + 1)} aria-label="Tải lại số dư credits">Tải lại</button></div>
    {!data ? <p role="status">Đang tải...</p> : data.error ? <div><p role="alert">Không thể tải số dư credit.</p><button type="button" onClick={() => setRetry((value) => value + 1)}>Thử lại</button></div> : data.credits !== null ? <strong className="recruit-credits__balance">{new Intl.NumberFormat('vi-VN').format(data.credits)}<small>credits</small></strong> : <p>{data.hasCompany ? 'Chưa nhận được số dư credit từ máy chủ.' : 'Cập nhật thông tin công ty để xem số dư.'}</p>}
    <Link to="/recruit/upgrade">Khám phá các gói <Icon name="arrow" /></Link>
  </section>
}

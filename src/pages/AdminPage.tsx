import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { adminNavigation } from '../data/adminNavigation'
import { Icon } from '../components/ui/Icon'
import './AdminPage.css'

export function AdminPage({ section }: { section?: 'companies' | 'users' | 'jobs' }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!user?.role) return <p role="status">Đang tải thông tin người dùng...</p>
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  const current = adminNavigation.find((item) => item.id === section)
  return <section className="admin-page">
    {current && <Link className="admin-page__back" to="/">← Tổng quan quản trị</Link>}
    <header className="admin-page__heading"><span className="section-kicker">QUẢN TRỊ HỆ THỐNG</span><h1>{current?.label ?? `Xin chào, ${user.username || 'quản trị viên'}!`}</h1><p>{current?.description ?? 'Quản lý công ty, người dùng và công việc từ một không gian chung.'}</p></header>
    {!current ? <div className="admin-page__grid">{adminNavigation.map((item) => <Link className="admin-page__card" key={item.id} to={item.to}><span className="admin-page__icon"><Icon name={item.icon} /></span><h2>{item.label}</h2><p>{item.description}</p><span className="admin-page__card-link">Truy cập <Icon name="arrow" /></span></Link>)}</div> : <div className="admin-page__workspace"><span className="admin-page__icon"><Icon name={current.icon} /></span><h2>{current.label}</h2><p>Khu vực quản lý {section === 'companies' ? 'doanh nghiệp và thông tin công ty' : section === 'users' ? 'tài khoản người dùng' : 'tin tuyển dụng'}.</p></div>}
  </section>
}

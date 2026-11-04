import type { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Footer } from './Footer'
import { Header } from './Header'
import { RecruitSidebar } from './RecruitSidebar'
import { AdminSidebar } from './AdminSidebar'
import './MainLayout.css'
import { GlobalToast } from '../ui/GlobalToast'

export function MainLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const isRecruit = user?.role === 'RECRUIT'
  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="site-shell">
      <GlobalToast />
      <Header />
      <div className={`site-body${isRecruit || isAdmin ? ' site-body--with-sidebar' : ''}`}>
        {isRecruit && <RecruitSidebar />}
        {isAdmin && <AdminSidebar />}
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  )
}

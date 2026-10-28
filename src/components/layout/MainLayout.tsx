import type { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Footer } from './Footer'
import { Header } from './Header'
import { RecruitSidebar } from './RecruitSidebar'
import './MainLayout.css'

export function MainLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const isRecruit = user?.role === 'RECRUIT'

  return (
    <div className="site-shell">
      <Header />
      <div className={`site-body${isRecruit ? ' site-body--with-sidebar' : ''}`}>
        {isRecruit && <RecruitSidebar />}
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  )
}

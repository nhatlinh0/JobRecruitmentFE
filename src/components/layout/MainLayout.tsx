import type { ReactNode } from 'react'
import { Footer } from './Footer'
import { Header } from './Header'
import './MainLayout.css'

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

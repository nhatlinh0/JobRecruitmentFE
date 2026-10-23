import { Logo } from '../ui/Logo'
import './Footer.css'

const currentYear = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="site-footer">
      <Logo className="logo-small" />
      <p>Chạm đúng cơ hội, mở lối tương lai.</p>
      <span>© {currentYear} JobSeeker. Made for tech talents.</span>
    </footer>
  )
}

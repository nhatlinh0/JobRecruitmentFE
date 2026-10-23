import { Icon } from './Icon'
import './Logo.css'

interface LogoProps {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <a className={`logo ${className}`} href="#" aria-label="JobSeeker - Trang chủ">
      <span className="logo-mark"><Icon name="code" /></span>
      <span>job<span className="logo-accent">seeker</span></span>
    </a>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { UserMenu } from './UserMenu'
import { navGroups, navItems } from '../../data/navigation'
import { Icon } from '../ui/Icon'
import { Logo } from '../ui/Logo'
import { NavDropdown } from './NavDropdown'
import './Header.css'

export function Header() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) setOpenGroup(null)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenGroup(null)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function closeAll() {
    setOpenGroup(null)
    setMenuOpen(false)
  }

  return (
    <header className="site-header" ref={headerRef}>
      <Logo />
      <nav className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="Điều hướng chính">
        {navItems.map((item, index) => (
          <a
            className={`nav-link${index === 0 ? ' active' : ''}`}
            href={item.href}
            key={item.href}
            onClick={closeAll}
          >
            {item.label}
          </a>
        ))}
        {navGroups.map((group) => (
          <NavDropdown
            group={group}
            isOpen={openGroup === group.id}
            key={group.id}
            onClose={() => setOpenGroup(null)}
            onNavigate={closeAll}
            onOpen={setOpenGroup}
            onToggle={(id) => setOpenGroup((current) => (current === id ? null : id))}
          />
        ))}
      </nav>
      <div className="header-actions">
        {user ? (
          <UserMenu onNavigate={closeAll} />
        ) : (
          <>
            <Link className="login-link" to="/login" onClick={closeAll}>Đăng nhập</Link>
            <Link className="button button-primary header-cta" to="/register" onClick={closeAll}>Đăng ký</Link>
          </>
        )}
      </div>
      <button
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
        className="mobile-menu"
        onClick={() => setMenuOpen((open) => !open)}
        type="button"
      >
        <Icon name="menu" />
      </button>
    </header>
  )
}

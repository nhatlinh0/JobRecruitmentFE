import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { UserMenu } from './UserMenu'
import { navItems } from '../../data/navigation'
import { fetchPublicNavigation, type PublicNavItem } from '../../services/publicNavigation'
import { Icon } from '../ui/Icon'
import { Logo } from '../ui/Logo'
import { NavDropdown } from './NavDropdown'
import './Header.css'

const publicGroups = [
  { id: 'by-field', label: 'Việc làm theo chuyên môn', endpoint: 'domains' },
  { id: 'by-skill', label: 'Việc làm theo kỹ năng', endpoint: 'skills' },
  { id: 'by-company', label: 'Việc làm theo công ty', endpoint: 'companies' },
]
interface MenuData { items: PublicNavItem[]; loading: boolean; error: string }

export function Header() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const headerRef = useRef<HTMLElement>(null)
  const [menus, setMenus] = useState<Record<string, MenuData>>({})

  useEffect(() => {
    const controller = new AbortController()
    for (const group of publicGroups) {
      fetchPublicNavigation(group.endpoint, controller.signal).then((items) => {
        if (!controller.signal.aborted) setMenus((current) => ({ ...current, [group.id]: { items, loading: false, error: '' } }))
      }).catch((error: unknown) => {
        if (!controller.signal.aborted) setMenus((current) => ({ ...current, [group.id]: { items: [], loading: false, error: error instanceof Error ? error.message : 'Không thể tải danh sách.' } }))
      })
    }
    return () => controller.abort()
  }, [])

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
        {user?.role !== 'RECRUIT' && (
          <>
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
            {publicGroups.map((group) => (
              <NavDropdown
                group={{ id: group.id, label: group.label, items: [] }}
                publicItems={menus[group.id]?.items ?? []}
                loading={menus[group.id]?.loading ?? !menus[group.id]}
                error={menus[group.id]?.error}
                isOpen={openGroup === group.id}
                key={group.id}
                onClose={() => setOpenGroup(null)}
                onNavigate={closeAll}
                onOpen={setOpenGroup}
                onToggle={(id) => setOpenGroup((current) => (current === id ? null : id))}
              />
            ))}
          </>
        )}
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

import { Link } from 'react-router-dom'
import { NAV_PREVIEW_LIMIT, type NavGroup } from '../../data/navigation'
import { Icon } from '../ui/Icon'
import './NavDropdown.css'
import type { PublicNavItem } from '../../services/publicNavigation'

interface NavDropdownProps {
  group: NavGroup
  isOpen: boolean
  onOpen: (id: string) => void
  onClose: () => void
  onToggle: (id: string) => void
  onNavigate: () => void
  publicItems?: PublicNavItem[]
  loading?: boolean
  error?: string
}

export function NavDropdown({ group, isOpen, onOpen, onClose, onToggle, onNavigate, publicItems, loading, error }: NavDropdownProps) {
  const panelId = `${group.id}-panel`

  return (
    <div
      className={`nav-dropdown${isOpen ? ' is-open' : ''}`}
      onPointerEnter={(event) => event.pointerType === 'mouse' && onOpen(group.id)}
      onPointerLeave={(event) => event.pointerType === 'mouse' && onClose()}
    >
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className="nav-link nav-trigger"
        onClick={() => onToggle(group.id)}
        type="button"
      >
        {group.label}
        <Icon name="chevron" className="nav-chevron" />
      </button>
      <div className="mega-panel" id={panelId} hidden={!isOpen}>
        {publicItems !== undefined ? <>
          {loading ? <p className="mega-message" role="status">Đang tải...</p> : error ? <p className="mega-message" role="status">{error}</p> : publicItems.length === 0 ? <p className="mega-message">Chưa có dữ liệu.</p> : <ul className="mega-grid mega-grid--public">{publicItems.map((item) => <li key={item.id}><span className="mega-link mega-link--display">{item.label}</span></li>)}</ul>}
        </> : <>
        <ul className="mega-grid">
          {group.items.slice(0, NAV_PREVIEW_LIMIT).map((item) => (
            <li key={item.href}>
              {item.href.startsWith('/') ? (
                <Link className="mega-link" to={item.href} onClick={onNavigate}>
                  {item.label}
                </Link>
              ) : (
                <a className="mega-link" href={item.href} onClick={onNavigate}>
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
        {group.items.length > NAV_PREVIEW_LIMIT && (
          <div className="mega-footer">
            <Link className="mega-view-all" to={`/categories/${group.id}`} onClick={onNavigate}>
              Xem tất cả ({group.items.length})
            </Link>
          </div>
        )}
        </>}
      </div>
    </div>
  )
}

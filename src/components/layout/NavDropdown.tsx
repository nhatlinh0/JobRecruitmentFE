import { Link } from 'react-router-dom'
import { NAV_PREVIEW_LIMIT, type NavGroup } from '../../data/navigation'
import { Icon } from '../ui/Icon'
import './NavDropdown.css'

interface NavDropdownProps {
  group: NavGroup
  isOpen: boolean
  onOpen: (id: string) => void
  onClose: () => void
  onToggle: (id: string) => void
  onNavigate: () => void
}

export function NavDropdown({ group, isOpen, onOpen, onClose, onToggle, onNavigate }: NavDropdownProps) {
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
        <ul className="mega-grid">
          {group.items.slice(0, NAV_PREVIEW_LIMIT).map((item) => (
            <li key={item.href}>
              <a className="mega-link" href={item.href} onClick={onNavigate}>
                {item.label}
              </a>
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
      </div>
    </div>
  )
}

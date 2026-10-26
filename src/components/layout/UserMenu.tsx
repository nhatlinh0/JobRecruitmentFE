import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Icon } from '../ui/Icon'
import './UserMenu.css'

const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#cde6d5"/><circle cx="20" cy="15" r="7" fill="#25815d"/><path d="M5 40c0-9 7-14 15-14s15 5 15 14z" fill="#25815d"/></svg>',
  )

export function UserMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (!user) return null

  const profileItem =
    user.role === 'RECRUIT'
      ? { label: 'Công ty của tôi', to: '/my-company' }
      : { label: 'Hồ sơ của tôi', to: '/update-profile' }

  const items = [
    profileItem,
    { label: 'Việc làm đã lưu', to: '/saved-jobs' },
    { label: 'Đổi mật khẩu', to: '/change-password' },
  ]

  function close() {
    setOpen(false)
    onNavigate?.()
  }

  function handleLogout() {
    logout()
    close()
    navigate('/')
  }

  return (
    <div className="user-menu" ref={ref}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="user-menu__trigger"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <img alt="" className="user-menu__avatar" src={user.avatar || DEFAULT_AVATAR} />
        <span className="user-menu__name">{user.username}</span>
        <Icon name="chevron" className="user-menu__chevron" />
      </button>
      {open && (
        <div className="user-menu__panel" role="menu">
          {items.map((item) => (
            <Link className="user-menu__item" key={item.to} onClick={close} role="menuitem" to={item.to}>
              {item.label}
            </Link>
          ))}
          <button className="user-menu__item user-menu__logout" onClick={handleLogout} role="menuitem" type="button">
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './RecruitSidebar.css'

const menu = [
  { label: 'Trang chủ', to: '/' },
  {
    label: 'Quản lý công ty',
    children: [
      { label: 'Danh sách nhân sự', to: '/recruit/staff' },
      { label: 'Thêm nhân sự', to: '/recruit/staff/new' },
    ],
  },
  {
    label: 'Quản lý bài đăng',
    children: [
      { label: 'Thêm bài đăng', to: '/recruit/posts/new' },
      { label: 'Danh sách bài đăng', to: '/recruit/posts' },
    ],
  },
  { label: 'Tìm kiếm ứng viên', to: '/recruit/candidates' },
  { label: 'Nâng cấp gói', to: '/recruit/upgrade' },
]

export function RecruitSidebar() {
  const [openGroups, setOpenGroups] = useState<string[]>(menu.filter((m) => m.children).map((m) => m.label))

  function toggleGroup(label: string) {
    setOpenGroups((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    )
  }

  return (
    <aside className="recruit-sidebar" aria-label="Điều hướng nhà tuyển dụng">
      <nav>
        <ul className="recruit-sidebar__list">
          {menu.map((item) =>
            item.children ? (
              <li className="recruit-sidebar__group" key={item.label}>
                <button
                  aria-expanded={openGroups.includes(item.label)}
                  className="recruit-sidebar__group-button"
                  onClick={() => toggleGroup(item.label)}
                  type="button"
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true" className="recruit-sidebar__chevron">▾</span>
                </button>
                {openGroups.includes(item.label) && (
                  <ul className="recruit-sidebar__sublist">
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <NavLink className="recruit-sidebar__link recruit-sidebar__link--sub" to={child.to}>
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={item.to}>
                <NavLink
                  className={({ isActive }) =>
                    `recruit-sidebar__link${isActive ? ' recruit-sidebar__link--active' : ''}`
                  }
                  end={item.to === '/'}
                  to={item.to!}
                >
                  {item.label}
                </NavLink>
              </li>
            ),
          )}
        </ul>
      </nav>
    </aside>
  )
}

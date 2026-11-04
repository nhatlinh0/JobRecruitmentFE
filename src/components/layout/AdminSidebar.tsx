import { NavLink } from 'react-router-dom'
import { adminNavigation } from '../../data/adminNavigation'
import { Icon } from '../ui/Icon'
import './RecruitSidebar.css'
import './AdminSidebar.css'

export function AdminSidebar() {
  return <aside className="recruit-sidebar admin-sidebar" aria-label="Điều hướng quản trị viên">
    <div className="admin-sidebar__heading"><span>ADMIN</span><strong>Quản trị hệ thống</strong></div>
    <nav><ul className="recruit-sidebar__list">
      {adminNavigation.map((item) => <li key={item.id}><NavLink className={({ isActive }) => `recruit-sidebar__link admin-sidebar__link${isActive ? ' recruit-sidebar__link--active' : ''}`} to={item.to}><Icon name={item.icon} /><span>{item.label}</span></NavLink></li>)}
    </ul></nav>
  </aside>
}
